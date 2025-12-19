import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, Key, Save, Edit, XCircle } from 'lucide-react'; 
import Navbar from '../components/Navbar';

const API_BASE_URL = 'http://localhost:5000/api/users';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setNewUsername(response.data.username);
            setLoading(false);
        } catch (err) {
            setError('Không thể tải thông tin hồ sơ.');
            setLoading(false);
        }
    };

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        setMessage('');
        if (newUsername.trim() === '') {
            setMessage({ type: 'error', text: 'Tên người dùng không được để trống.' });
            return;
        }
        try {
            await axios.put(
                `${API_BASE_URL}/profile`,
                { username: newUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Cập nhật tên người dùng thành công!' });
            setIsEditingUsername(false);
            fetchProfile(); 
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi cập nhật tên người dùng.' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/password`,
                passwordData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); // Reset form
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi đổi mật khẩu.' });
        }
    };

    if (loading) {
        return (
            <Navbar>
                <div className="text-center p-10 text-lg">Đang tải hồ sơ...</div>
            </Navbar>
        );
    }

    if (error) {
        return (
            <Navbar>
                <div className="text-center p-10 text-red-500 text-lg">Lỗi: {error}</div>
            </Navbar>
        );
    }

    return (
        <>
            <Navbar />
            <div className="bg-gray-50 min-h-screen p-4 md:p-8">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
                        <User className="inline mr-2 text-blue-500" size={30} /> Thông Tin Cá Nhân
                    </h2>

                    {message && (
                        <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* 1. THÔNG TIN CƠ BẢN */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Hồ Sơ Người Dùng</h3>
                        
                        <div className="space-y-4">
                            {/* Username */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <User size={20} className="text-indigo-500 mr-3" />
                                    <span className="font-medium text-gray-600 w-24">Username:</span>
                                    {isEditingUsername ? (
                                        <input
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="ml-2 border border-gray-300 rounded px-2 py-1 flex-grow"
                                            style={{ fontWeight: 'bold', color: '#333' }} // <<< SỬA STYLE CHO INPUT USERNAME
                                        />
                                    ) : (
                                        <span className="font-bold text-gray-900">{profile.username}</span>
                                    )}
                                </div>
                                
                                {isEditingUsername ? (
                                    <div className="flex space-x-2">
                                        <button onClick={handleUpdateUsername} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition" title="Lưu">
                                            <Save size={18} />
                                        </button>
                                        <button onClick={() => { setIsEditingUsername(false); setNewUsername(profile.username); }} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-full transition" title="Hủy">
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditingUsername(true)} className="text-blue-500 hover:text-blue-700 p-2" title="Chỉnh sửa">
                                        <Edit size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Mail size={20} className="text-indigo-500 mr-3" />
                                <span className="font-medium text-gray-600 w-24">Email:</span>
                                <span className="text-gray-900">{profile.email}</span>
                            </div>

                            {/* Created At */}
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <Calendar size={20} className="text-indigo-500 mr-3" />
                                <span className="font-medium text-gray-600 w-24">Tham gia:</span>
                                <span className="text-gray-900">{new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. ĐỔI MẬT KHẨU */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Đổi Mật Khẩu</h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            
                            {/* Mật khẩu cũ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    style={{ fontWeight: 'bold', color: '#333' }}
                                    required
                                />
                            </div>

                            {/* Mật khẩu mới */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    style={{ fontWeight: 'bold', color: '#333' }}
                                    required
                                    minLength="6"
                                />
                            </div>

                            {/* Xác nhận mật khẩu mới */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                                    style={{ fontWeight: 'bold', color: '#333' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#673ab7] hover:bg-[#582fa3] text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center transition"
                            >
                                <Key size={18} className="mr-2" /> Đổi Mật Khẩu
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ProfilePage;