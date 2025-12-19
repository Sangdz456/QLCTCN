import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom"; 
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Tag,
  Calendar,
  User, // Icon User cần thiết cho Navbar
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// --- HÀM ĐỊNH DẠNG TIỀN TỆ VND ---
const formatVND = (amount) => {
    const number = parseFloat(amount || 0);
    const absoluteAmount = Math.abs(number);
    if (isNaN(number)) return "0 ₫";

    const sign = number < 0 ? "-" : "";

    return sign + absoluteAmount.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
// --- END HÀM ĐỊNH DẠNG ---

const DashboardPage = () => {
    const navigate = useNavigate(); // <<< ĐÃ THÊM: Khai báo navigate
    const [summary, setSummary] = useState(null);
    const [breakdown, setBreakdown] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const fetchDashboardData = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            if (!token) throw new Error("Không tìm thấy mã xác thực.");

            // 1. Tổng quan tháng (total_income, total_expense)
            const monthlySummaryPromise = axios.get(
                `${API_BASE_URL}/summary/monthly?month=${currentMonth}&year=${currentYear}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 2. Breakdown (Thu & Chi theo danh mục)
            // API này cần được sửa ở Backend để trả về cả income và expense
            const breakdownPromise = axios.get(
                `${API_BASE_URL}/reports/breakdown/monthly?month=${currentMonth}&year=${currentYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // 3. Giao dịch gần nhất
            const recentTransactionsPromise = axios.get(
                `${API_BASE_URL}/transactions?limit=5`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const [summaryRes, breakdownRes, recentTransRes] = await Promise.all([
                monthlySummaryPromise,
                breakdownPromise,
                recentTransactionsPromise,
            ]);

            // Dữ liệu Tổng quan (Summary Cards)
            const data = summaryRes.data;
            const safeSummary = {
                income: parseFloat(data.income) || 0,
                expense: parseFloat(data.expense) || 0,
                balance: parseFloat(data.balance) || 0,
            };
            setSummary(safeSummary);

            // Dữ liệu Breakdown (Lọc 5 chi tiêu lớn nhất cho cột Thống Kê)
            const expenseBreakdown = breakdownRes.data
                .filter(item => item.transaction_type === 'expense' || !item.transaction_type) 
                // SỬ DỤNG ABS để sắp xếp chi tiêu lớn nhất
                .sort((a, b) => Math.abs(parseFloat(b.total_amount)) - Math.abs(parseFloat(a.total_amount)))
                .slice(0, 5)
                .map(item => ({
                    ...item,
                    total_amount: parseFloat(item.total_amount)
                }));
            setBreakdown(expenseBreakdown);

            // Dữ liệu giao dịch gần đây
            setRecentTransactions(recentTransRes.data);

        } catch (err) {
            console.error("❌ Lỗi tải dữ liệu Dashboard:", err);
            setError(err.message || "Lỗi kết nối hoặc tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    }, [token, currentMonth, currentYear]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Giá trị an toàn
    const income = summary?.income || 0;
    const expense = summary?.expense || 0;
    const balance = summary?.balance || 0;

    // Tính toán Tỷ lệ
    const incomeSafe = income > 0 ? income : 1; 
    const expenseRatio = ((Math.abs(expense) / incomeSafe) * 100).toFixed(1); // Dùng ABS cho chi tiêu
    const netFlow = income - expense;
    const savingsRate = ((netFlow / incomeSafe) * 100).toFixed(1); // Tiết kiệm = Dòng tiền ròng / Thu nhập
    const dailyAvgExpense = Math.abs(expense) > 0 ? Math.abs(expense) / 30 : 0; 

    const renderCardValue = (value) => {
        return loading ? (
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        ) : (
            <h3 className="text-3xl font-bold text-gray-900">{formatVND(value)}</h3>
        );
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    if (loading && !summary) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu tài chính...</p>
                </div>
            </div>
        );
    }
    
    // Hàm hiển thị % chi tiêu cho biểu đồ
    const getTotalPercentage = (total) => {
        // Dùng Math.abs(total) / Math.abs(expense)
        return (Math.abs(total) > 0 && Math.abs(expense) > 0) ? ((Math.abs(total) / Math.abs(expense)) * 100).toFixed(1) : "0";
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />

            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                            Tổng Quan Tài Chính ({currentMonth}/{currentYear})
                        </h1>
                        <p className="text-gray-600">
                            Cái nhìn tổng quát về hiệu suất tài chính của bạn trong tháng này.
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-white hover:bg-gray-50 transition-colors duration-200"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
                        <span>{loading ? "Đang tải..." : "Tải Lại"}</span>
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-rose-100 border border-rose-400 text-rose-800 rounded-lg">
                        <AlertCircle size={20} className="inline mr-2" />
                        <span className="font-medium">Lỗi: {error}</span>
                    </div>
                )}

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* 1. Income Card */}
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-emerald-700 font-medium mb-1">Tổng Thu Nhập</p>
                                {renderCardValue(income)}
                            </div>
                            <div className="p-3 bg-emerald-500 rounded-xl">
                                <TrendingUp className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-emerald-700">
                            <ArrowUpRight size={16} />
                            <span className="text-sm ml-1">Dòng tiền dương</span>
                        </div>
                    </div>

                    {/* 2. Expense Card */}
                    <div className="bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-rose-700 font-medium mb-1">Tổng Chi Tiêu</p>
                                {renderCardValue(expense)}
                            </div>
                            <div className="p-3 bg-rose-500 rounded-xl">
                                <TrendingDown className="text-white" size={24} />
                            </div>
                        </div>
                        <div className="flex items-center text-rose-700">
                            <ArrowDownRight size={16} />
                            <span className="text-sm ml-1">Theo dõi chi tiêu của bạn</span>
                        </div>
                    </div>

                    {/* 3. Balance Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-blue-700 font-medium mb-1">Số Dư Ròng</p>
                                {renderCardValue(balance)}
                            </div>
                            <div className="p-3 bg-blue-500 rounded-xl">
                                <DollarSign className="text-white" size={24} />
                            </div>
                        </div>
                        <div
                            className={`flex items-center ${
                                balance >= 0 ? "text-blue-700" : "text-rose-700"
                            }`}
                        >
                            {balance >= 0 ? (
                                <>
                                    <ArrowUpRight size={16} />
                                    <span className="text-sm ml-1">Số dư lành mạnh</span>
                                </>
                            ) : (
                                <>
                                    <ArrowDownRight size={16} />
                                    <span className="text-sm ml-1">Số dư âm (Cần xem xét)</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Details Grid (New Section) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Statistics Summary */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                            Thống Kê Chi Tiết
                        </h2>
                        <div className="space-y-4">
                            {/* Tỷ lệ Tiết kiệm */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Tỷ lệ Tiết kiệm/Thu nhập</p>
                                <p className="text-2xl font-bold text-emerald-700">
                                    {savingsRate}%
                                </p>
                            </div>

                            {/* Tỷ lệ Chi tiêu */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Tỷ lệ Chi tiêu/Thu nhập</p>
                                <p className="text-2xl font-bold text-rose-700">
                                    {expenseRatio}%
                                </p>
                            </div>

                            {/* Dòng tiền ròng */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Dòng tiền Ròng</p>
                                <p className={`text-2xl font-bold ${netFlow >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                    {formatVND(netFlow)}
                                </p>
                            </div>

                            {/* Chi tiêu TB ngày */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Chi tiêu TB ngày (ước tính)</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {formatVND(dailyAvgExpense)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Top 5 Expense Categories */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                            Chi tiêu Lớn nhất ({currentMonth}/{currentYear})
                        </h2>
                        {breakdown.length > 0 ? (
                            <div className="space-y-3">
                                {breakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                        <div className="flex items-center">
                                            <Tag size={16} className="text-rose-500 mr-2" />
                                            <span className="font-medium text-gray-700">{item.category_name}</span>
                                        </div>
                                        <div className="text-right">
                                            {/* Dùng Math.abs vì chi tiêu lớn nhất cần giá trị tuyệt đối */}
                                            <p className="font-bold text-rose-600">{formatVND(Math.abs(item.total_amount))}</p>
                                            {expense > 0 && (
                                                <p className="text-xs text-gray-500">{getTotalPercentage(item.total_amount)}% tổng chi</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 py-4 text-center">Chưa có giao dịch chi tiêu trong tháng này.</p>
                        )}
                    </div>
                    
                    {/* 3. Recent Transactions */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                            Giao Dịch Gần Nhất
                        </h2>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{tx.description || tx.category_name}</span>
                                            <span className="text-xs text-gray-500 flex items-center mt-1">
                                                <Calendar size={12} className="mr-1" />
                                                {new Date(tx.date).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <span className={`font-bold ${tx.transaction_type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {tx.transaction_type === 'income' ? '+' : '-'} {formatVND(tx.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-gray-500 py-4 text-center">Chưa có giao dịch nào được ghi lại.</p>
                        )}
                    </div>

                </div>

                {/* Empty State */}
                {!loading && !summary?.income && !summary?.expense && !error && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg mt-8">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <DollarSign size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Không có Dữ liệu
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Hãy bắt đầu thêm các giao dịch để xem tổng quan tài chính của bạn
                        </p>
                        <button
                            onClick={() => navigate('/transactions/add')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Thêm Giao Dịch Đầu Tiên
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;