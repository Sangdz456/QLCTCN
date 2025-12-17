import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { X, DollarSign } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const BudgetForm = ({ isOpen, onClose, onSubmit, initialData, currentMonth, currentYear }) => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        amount: '',
        month: currentMonth,
        year: currentYear,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    const fetchCategories = useCallback(async () => {
        try {
            // Lấy danh mục, chỉ lọc loại 'expense' vì thường chỉ thiết lập ngân sách cho chi tiêu
            const response = await axios.get(`${API_BASE_URL}/categories?type=expense`, { 
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(response.data); 
            
            if (!initialData && response.data.length > 0) {
                 setFormData(prev => ({ 
                     ...prev, 
                     category_id: response.data[0].id.toString() 
                 }));
            }
        } catch (err) {
            console.error('Lỗi tải danh mục:', err);
            setError('Không thể tải danh mục.');
        }
    }, [token, initialData]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            setError('');
            if (initialData) {
                setFormData({
                    category_id: initialData.category_id.toString(), 
                    amount: initialData.amount,
                    month: initialData.month,
                    year: initialData.year,
                });
            } else {
                setFormData({
                    category_id: categories.length > 0 ? categories[0].id.toString() : '',
                    amount: '',
                    month: currentMonth,
                    year: currentYear,
                });
            }
        }
    }, [isOpen, initialData, categories.length, currentMonth, currentYear, fetchCategories]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.category_id || !formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Vui lòng chọn danh mục và nhập số tiền lớn hơn 0.');
            setLoading(false);
            return;
        }
        
        const payload = {
            ...formData,
            category_id: parseInt(formData.category_id), 
            amount: parseFloat(formData.amount)
        };

        try {
            await axios.post(`${API_BASE_URL}/budgets`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            alert(`Ngân sách đã được ${initialData ? 'cập nhật' : 'thiết lập'} thành công!`);
            onSubmit(); 
        } catch (err) {
            console.error('Lỗi Submit Budget:', err);
            setError(err.response?.data?.message || 'Lỗi kết nối Server.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex justify-center items-center z-50 p-4"> {/* Nền Modal tối hơn */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all"> {/* Border cong, shadow đậm */}
                
                {/* Header Modal */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-5">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {initialData ? 'Cập Nhật Ngân Sách' : `Thiết Lập Ngân Sách`}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Danh mục Chi tiêu
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="bg-gray-50 border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                            disabled={loading || !!initialData} 
                        >
                            <option value="">-- Chọn Danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                         <p className="text-xs text-gray-500 mt-1">Lưu ý: Ngân sách được thiết lập cho danh mục Chi tiêu.</p>
                    </div>
                    
                    {/* Trường Month/Year (ReadOnly) */}
                     <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Tháng/Năm
                        </label>
                        <input
                            type="text"
                            value={`Tháng ${currentMonth} / Năm ${currentYear}`}
                            className="bg-gray-100 border border-gray-300 rounded-lg w-full py-2.5 px-3 text-gray-700 cursor-not-allowed"
                            readOnly
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            Số tiền Ngân sách (VNĐ)
                        </label>
                        <div className="relative">
                            <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="bg-gray-50 border border-gray-300 rounded-lg w-full py-2.5 pl-10 pr-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Nhập số tiền (Ví dụ: 2500000)"
                                required
                                min="1"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    
                    {/* Nút Submit */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition mr-3 font-semibold"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 font-semibold flex items-center gap-1"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : (initialData ? 'Cập Nhật' : 'Thiết Lập')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetForm;