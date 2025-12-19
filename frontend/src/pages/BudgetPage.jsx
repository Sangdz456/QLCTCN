import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Calendar, DollarSign, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import BudgetForm from '../components/BudgetForm'; 
import Navbar from '../components/Navbar'; 

const API_BASE_URL = 'http://localhost:5000/api'; 

// Hàm tiện ích được nhúng trực tiếp
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
};

// HÀM TÍNH TOÁN CẢNH BÁO
const getStatus = (spent, budgeted) => {
    if (budgeted <= 0) return { status: 'Không đặt', class: 'bg-gray-200 text-gray-700' };
    const ratio = spent / budgeted;
    if (ratio > 1) {
        return { status: 'Vượt Ngân Sách', class: 'bg-red-500 text-white' }; 
    } else if (ratio >= 0.7) {
        return { status: 'Gần Vượt', class: 'bg-yellow-400 text-gray-800' }; 
    } else {
        return { status: 'An Toàn', class: 'bg-green-500 text-white' }; 
    }
};

const BudgetPage = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null); 
    const [apiError, setApiError] = useState(null); 
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentMonth = currentDate.getMonth() + 1; 
    const currentYear = currentDate.getFullYear();

    const token = localStorage.getItem('token');
    
    // ======================================
    // 1. LẤY DỮ LIỆU BUDGETS VÀ CHI TIÊU THỰC TẾ
    // ======================================
    const fetchBudgetsAndSpending = useCallback(async () => {
        setLoading(true);
        setApiError(null); 
        try {
            const budgetsPromise = axios.get(
                `${API_BASE_URL}/budgets?month=${currentMonth}&year=${currentYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const spendingPromise = axios.get(
                `${API_BASE_URL}/reports/breakdown/monthly?month=${currentMonth}&year=${currentYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const [budgetsRes, spendingRes] = await Promise.all([budgetsPromise, spendingPromise]);
            
            // SỬA LỖI MAPPING CUỐI CÙNG: Dùng parseFloat và làm tròn
            const spendingMap = spendingRes.data.reduce((acc, item) => {
                const amount = Math.round(parseFloat(item.total_amount)); 
                if (!isNaN(amount)) {
                    acc[item.category_id] = amount;
                }
                return acc;
            }, {});

            // 3. Hợp nhất (Merge) dữ liệu và tính toán trạng thái
            const mergedBudgets = budgetsRes.data.map(budget => {
                // Lấy chi tiêu thực tế (Spent)
                const spent = budget.category_type === 'expense' ? (spendingMap[budget.category_id] || 0) : 0;
                const remaining = budget.amount - spent;
                
                // --- DEBUG BỔ SUNG ---
                if (budget.category_type === 'expense' && spent === 0 && budget.amount > 0) {
                     // Nếu chi tiêu là 0, nhưng có budget, cảnh báo có thể do category_id không khớp
                     console.warn(`[DEBUG BUDGET] Category: ${budget.category_name} (ID: ${budget.category_id}). Spent is 0, but API Breakdown returned: `, spendingMap);
                }
                // ---------------------

                return {
                    ...budget,
                    spent,
                    remaining,
                    status: getStatus(spent, budget.amount)
                };
            });

            setBudgets(mergedBudgets); 
            setLoading(false);
        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu Ngân Sách và Chi tiêu:', error);
            setApiError("Không thể tải dữ liệu chi tiêu. Vui lòng kiểm tra console (F12) để xem chi tiết lỗi API.");
            setLoading(false);
        }
    }, [token, currentMonth, currentYear]);

    useEffect(() => {
        fetchBudgetsAndSpending();
    }, [fetchBudgetsAndSpending]);


    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ngân sách này không?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/budgets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Xóa ngân sách thành công!');
            fetchBudgetsAndSpending(); 
        } catch (error) {
            console.error('Lỗi khi xóa Budget:', error);
            alert('Lỗi: Không thể xóa ngân sách.');
        }
    };

    const handleMonthChange = (direction) => {
        const newDate = new Date(currentDate.getTime());
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const handleFormSubmit = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        fetchBudgetsAndSpending(); 
    };

    // Class Tailwind cho màu Tím (Purple) tùy chỉnh #673ab7
    const customPurpleClass = 'bg-[#673ab7] hover:bg-[#582fa3] text-white transition duration-200 shadow-md';
    // Class cho hiển thị tháng/năm
    const monthDisplayClass = 'flex items-center gap-2 font-semibold text-gray-800 px-4 py-2 bg-white rounded-lg border border-gray-300 shadow-sm';

    return (
        <> 
            <Navbar /> 
            <div className="bg-gray-50 min-h-screen p-4 md:p-8">
                <div className="container mx-auto">
                    
                    {/* TIÊU ĐỀ */}
                    <h2 className="text-3xl font-extrabold text-gray-800">Quản Lý Ngân Sách</h2>
                    <p className="text-gray-500 mb-8">Kiểm soát chi tiêu (Thực tế) so với giới hạn (Kế hoạch).</p>
                    
                    {/* THANH ĐIỀU HƯỚNG THÁNG/NĂM & THÊM MỚI */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        
                        {/* Bộ lọc tháng */}
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => handleMonthChange('prev')} 
                                className={`${customPurpleClass} px-3 py-2 rounded-lg`} 
                            >
                                &larr; Tháng trước
                            </button>
                            
                            {/* Hiển thị tháng/năm */}
                            <div className={monthDisplayClass}>
                                <Calendar size={18} className="text-blue-500" />
                                Tháng {currentMonth} / Năm {currentYear}
                            </div>
                            
                            <button 
                                onClick={() => handleMonthChange('next')} 
                                className={`${customPurpleClass} px-3 py-2 rounded-lg`}
                            >
                                Tháng sau &rarr;
                            </button>
                        </div>

                        {/* Nút Tải lại & Thêm Mới */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchBudgetsAndSpending}
                                className={`${customPurpleClass} px-4 py-2 rounded-lg font-semibold flex items-center gap-2`} 
                                disabled={loading}
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/> Tải Lại
                            </button>
                            <button
                                onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
                                className={`${customPurpleClass} px-4 py-2 rounded-lg font-semibold flex items-center gap-2`} 
                            >
                                <Plus size={20} /> Đặt Ngân Sách Mới
                            </button>
                        </div>
                    </div>

                    {/* HIỂN THỊ LỖI API */}
                    {apiError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong className="font-bold">Lỗi Dữ liệu:</strong>
                            <span className="block sm:inline"> {apiError}</span>
                            <p className="text-sm mt-1">Lỗi có thể là do API trả về chuỗi, đã được fix bằng <code>parseFloat</code>.</p>
                        </div>
                    )}

                    {/* Danh sách Ngân sách */}
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Kế hoạch Ngân Sách & Thực tế Chi tiêu</h3>
                    
                    {loading ? (
                        <div className="p-8 text-center flex items-center justify-center text-lg text-blue-600 bg-white rounded-lg shadow-lg">
                            <DollarSign className="animate-spin mr-3" /> Đang tải dữ liệu ngân sách...
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Danh mục</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kế hoạch (Budget)</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">ĐÃ CHI (Thực tế)</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Còn lại / Vượt</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {budgets.length > 0 ? (
                                        budgets.map((budget) => (
                                            <tr key={budget.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {budget.category_name}
                                                    {/* HIỂN THỊ CATEGORY ID ĐỂ DEBUG */}
                                                    <span className="text-xs text-gray-400 ml-1"> (ID: {budget.category_id}) </span> 
                                                    {/* Hiển thị loại */}
                                                    {budget.category_type === 'expense' && (
                                                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                            Chi tiêu
                                                        </span>
                                                    )}
                                                    {budget.category_type === 'income' && (
                                                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Thu nhập (Mục tiêu)
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                {/* CỘT KẾ HOẠCH (BUDGET) */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                                    {formatCurrency(budget.amount)}
                                                </td>
                                                
                                                {/* CỘT ĐÃ CHI (THỰC TẾ) */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                                    {budget.category_type === 'expense' ? (
                                                        <span style={{ color: budget.spent > budget.amount ? '#D9534F' : '#333' }}>
                                                            {formatCurrency(budget.spent)}
                                                        </span>
                                                    ) : 'N/A'}
                                                </td>

                                                {/* CỘT CÒN LẠI / VƯỢT */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                                    {budget.category_type === 'expense' ? (
                                                        <span style={{ color: budget.remaining < 0 ? '#D9534F' : '#5CB85C' }}>
                                                            {formatCurrency(budget.remaining)}
                                                        </span>
                                                    ) : 'N/A'}
                                                </td>

                                                {/* CỘT TRẠNG THÁI */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {budget.category_type === 'expense' ? (
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full items-center ${budget.status.class}`}>
                                                            {budget.status.status}
                                                            {budget.status.status === 'An Toàn' && <CheckCircle size={14} className="ml-1" />}
                                                            {budget.status.status === 'Gần Vượt' && <AlertTriangle size={14} className="ml-1" />}
                                                            {budget.status.status === 'Vượt Ngân Sách' && <XCircle size={14} className="ml-1" />}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">Mục tiêu</span>
                                                    )}
                                                </td>
                                                
                                                {/* CỘT THAO TÁC */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                                    <button
                                                        onClick={() => { setEditingBudget(budget); setIsModalOpen(true); }}
                                                        className="text-indigo-600 hover:text-indigo-800 mr-3 p-1"
                                                        title="Điều chỉnh ngân sách"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(budget.id)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title="Xóa ngân sách"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                Không có ngân sách nào được thiết lập cho tháng {currentMonth}/{currentYear}.
                                                <br/>
                                                <button
                                                    onClick={() => { setEditingBudget(null); setIsModalOpen(true); }}
                                                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                                >
                                                    Đặt Ngân Sách Đầu tiên
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Modal Form */}
                    <BudgetForm
                        isOpen={isModalOpen}
                        onClose={() => { setIsModalOpen(false); setEditingBudget(null); }} 
                        onSubmit={handleFormSubmit}
                        initialData={editingBudget}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                </div>
            </div>
        </>
    );
};

export default BudgetPage;