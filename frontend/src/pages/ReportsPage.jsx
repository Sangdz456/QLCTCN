import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import ExpenseChart from "../components/ExpenseChart";
import {
  PieChart,
  BarChart,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

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

// Hàm tính tháng/năm trước đó
const getPreviousMonth = (month, year) => {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
    }
    return { prevMonth, prevYear };
};

const ReportsPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [currentDate, setCurrentDate] = useState(new Date());
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const { prevMonth, prevYear } = getPreviousMonth(currentMonth, currentYear);

    const [breakdown, setBreakdown] = useState([]); 
    const [prevBreakdown, setPrevBreakdown] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                navigate("/login");
                return;
            }
            
            // API CALL: Lấy Breakdown cho tháng hiện tại (T) và tháng trước (T-1)
            const currentPromise = axios.get(
                `${API_BASE_URL}/reports/breakdown/monthly?month=${currentMonth}&year=${currentYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const previousPromise = axios.get(
                `${API_BASE_URL}/reports/breakdown/monthly?month=${prevMonth}&year=${prevYear}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const [currentRes, previousRes] = await Promise.all([currentPromise, previousPromise]);

            if (Array.isArray(currentRes.data)) {
                setBreakdown(currentRes.data);
            } else {
                setBreakdown([]);
            }
            
            if (Array.isArray(previousRes.data)) {
                setPrevBreakdown(previousRes.data);
            } else {
                setPrevBreakdown([]);
            }

        } catch (err) {
            console.error("❌ Lỗi tải báo cáo:", err);
            setError(err.response?.data?.message || err.message || "Tải dữ liệu báo cáo thất bại.");
        } finally {
            setLoading(false);
        }
    }, [token, navigate, currentMonth, currentYear, prevMonth, prevYear]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);


    const { totalIncome, totalExpense, totalBalance, comparisonData } = useMemo(() => {
        let income = 0;
        let expense = 0;
        let incomePrev = 0;
        let expensePrev = 0;

        // Tính tổng T (Thu nhập & Chi tiêu)
        breakdown.forEach((item) => {
            const amount = parseFloat(item.total_amount || 0);
            if (item.transaction_type === "income") {
                income += amount;
            } else if (item.transaction_type === "expense") {
                expense += amount;
            }
        });
        
        // Tính tổng T-1
        prevBreakdown.forEach((item) => {
            const amount = parseFloat(item.total_amount || 0);
            if (item.transaction_type === "income") {
                incomePrev += amount;
            } else if (item.transaction_type === "expense") {
                expensePrev += amount;
            }
        });

        const balance = income - expense;

        // Logic So sánh
        const compare = (currentValue, previousValue, isExpense) => {
            const diff = currentValue - previousValue;
            const percent = previousValue !== 0 
                ? ((diff / previousValue) * 100).toFixed(1) 
                : (currentValue !== 0 ? 'Mới' : 'N/A');
            
            const isIncreased = diff > 0;
            
            let statusClass = 'text-gray-600';
            let icon = null;

            if (diff !== 0) {
                const isGood = isExpense ? (diff < 0) : (diff > 0);
                
                statusClass = isGood ? 'text-emerald-600' : 'text-red-600';
                icon = isIncreased ? TrendingUp : TrendingDown;
            } else if (diff === 0 && previousValue !== 0) {
                statusClass = 'text-gray-500';
            }

            return { 
                currentValue,
                previousValue,
                diff, 
                percent, 
                isIncreased, 
                statusClass,
                icon
            };
        };

        const comparisonData = {
            income: compare(income, incomePrev, false),
            expense: compare(expense, expensePrev, true),
            balance: compare(balance, (incomePrev - expensePrev), false), 
        };

        return { totalIncome: income, totalExpense: expense, totalBalance: balance, comparisonData };
    }, [breakdown, prevBreakdown]);


    const handleMonthChange = (direction) => {
        const newDate = new Date(currentDate.getTime());
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };
    
    // Lọc data cho biểu đồ Pie (chỉ lấy expense > 0)
    const expenseDataForChart = useMemo(() => {
        return breakdown
            .filter(item => item.transaction_type === 'expense')
            .map(item => {
                const amount = parseFloat(item.total_amount || 0);
                const absoluteAmount = Math.abs(amount);
                
                if (absoluteAmount > 0) {
                    return {
                        name: item.category_name,
                        value: absoluteAmount, // Biểu đồ cần giá trị dương
                    };
                }
                return null;
            })
            .filter(item => item !== null);
            
    }, [breakdown]);
    
    // Kiểm tra xem có dữ liệu giao dịch nào trong tháng hiện tại không
    const hasData = breakdown.length > 0;
    
    // Kiểm tra xem có dữ liệu chi tiêu nào để vẽ biểu đồ không
    const hasExpenseDataForChart = expenseDataForChart.length > 0; 
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />

            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                            Báo Cáo & Phân Tích
                        </h1>
                        <p className="text-gray-600">
                            Phân tích chi tiêu và thu nhập theo danh mục ({currentMonth}/{currentYear})
                        </p>
                    </div>

                    {/* Bộ lọc tháng và Tải lại */}
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <button 
                            onClick={() => handleMonthChange('prev')} 
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            &larr; Tháng trước
                        </button>
                        
                        <div className="flex items-center gap-2 font-semibold text-gray-800 px-4 py-2 bg-white rounded-lg border border-gray-300 shadow-sm">
                            <Calendar size={18} className="text-blue-500" />
                            {currentMonth}/{currentYear}
                        </div>
                        
                        <button 
                            onClick={() => handleMonthChange('next')} 
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-white hover:bg-gray-50 transition-colors duration-200"
                        >
                            Tháng sau &rarr;
                        </button>
                        
                        <button
                            onClick={fetchReports}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-white hover:bg-gray-50 transition-colors duration-200"
                            disabled={loading}
                        >
                            <RefreshCw
                                size={18}
                                className={`${loading ? "animate-spin" : ""}`}
                            />
                            <span>Tải Lại</span>
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-rose-100 border border-rose-400 text-rose-800 rounded-lg">
                        <AlertCircle size={20} className="inline mr-2" />
                        <span className="font-medium">Lỗi: {error}</span>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu báo cáo...</p>
                    </div>
                )}

                {/* Summary Cards */}
                {!loading && hasData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tổng Chi tiêu (Expense Card) */}
                        <div className="p-6 bg-rose-50 rounded-2xl shadow-lg border border-rose-200">
                            <p className="text-sm font-medium text-rose-700 mb-1 flex items-center gap-2">
                                <TrendingDown size={18} /> Tổng Chi Tiêu
                            </p>
                            <h3 className="text-3xl font-bold text-rose-900">
                                {formatVND(totalExpense)}
                            </h3>
                        </div>

                        {/* Tổng Thu nhập (Income Card) */}
                        <div className="p-6 bg-emerald-50 rounded-2xl shadow-lg border border-emerald-200">
                            <p className="text-sm font-medium text-emerald-700 mb-1 flex items-center gap-2">
                                <TrendingUp size={18} /> Tổng Thu Nhập
                            </p>
                            <h3 className="text-3xl font-bold text-emerald-900">
                                {formatVND(totalIncome)}
                            </h3>
                        </div>

                        {/* Số dư Ròng (Balance Card) */}
                        <div className="p-6 bg-blue-50 rounded-2xl shadow-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-2">
                                <BarChart size={18} /> Số Dư Ròng
                            </p>
                            <h3
                                className={`text-3xl font-bold ${
                                    totalBalance >= 0 ? "text-blue-900" : "text-rose-900"
                                }`}
                            >
                                {formatVND(totalBalance)}
                            </h3>
                        </div>
                    </div>
                )}

                {/* Main Reports Area: Chia 2/3 (Biểu đồ/Bảng) và 1/3 (So sánh) */}
                {!loading && hasData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* CỘT 1 (2/3): Biểu đồ và Chi tiết theo danh mục */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Biểu đồ Phân tích Chi tiêu */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <PieChart size={20} /> Phân Tích Chi Tiêu theo Danh Mục
                                </h2>
                                {/* Chỉ render biểu đồ nếu có dữ liệu chi tiêu (đã lọc) */}
                                {hasExpenseDataForChart ? (
                                    <ExpenseChart data={expenseDataForChart} />
                                ) : (
                                    <p className="text-gray-500 text-center py-10">
                                        Không có giao dịch chi tiêu để hiển thị biểu đồ.
                                    </p>
                                )}
                            </div>
                            
                            {/* Bảng Chi tiết Phân tích (Toàn bộ) */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <BarChart size={20} /> Chi Tiết Thu/Chi theo Danh Mục
                                </h2>

                                <div className="space-y-3">
                                    {/* Header Bảng */}
                                    <div className="flex justify-between font-medium text-xs text-gray-500 border-b pb-1">
                                        <span>Danh mục</span>
                                        <span>Số tiền</span>
                                    </div>

                                    {/* Danh sách các mục phân tích */}
                                    {breakdown.map((item, index) => (
                                        <div
                                            key={item.category_id || index}
                                            className={`flex justify-between p-3 rounded-lg transition-colors duration-150 ${
                                                item.transaction_type === "income"
                                                    ? "bg-emerald-50 hover:bg-emerald-100"
                                                    : "bg-rose-50 hover:bg-rose-100"
                                            }`}
                                        >
                                            <p
                                                className={`font-medium text-sm ${
                                                    item.transaction_type === "income"
                                                        ? "text-emerald-800"
                                                        : "text-rose-800"
                                                }`}
                                            >
                                                {item.category_name}
                                            </p>
                                            <p
                                                className={`font-bold text-sm ${
                                                    item.transaction_type === "income"
                                                        ? "text-emerald-700"
                                                        : "text-rose-700"
                                                }`}
                                            >
                                                {/* Hiển thị dấu âm nếu tổng số tiền là âm (chi tiêu) */}
                                                {item.transaction_type === "income" ? "+" : "-"}
                                                {formatVND(item.total_amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* CỘT 2 (1/3): So sánh Tháng-qua-Tháng */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-20">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                                    So Sánh Tháng {currentMonth}/{currentYear} vs {prevMonth}/{prevYear}
                                </h2>
                                
                                <div className="space-y-4">
                                    {/* Hàm hiển thị chi tiết so sánh */}
                                    {Object.keys(comparisonData).map((key) => {
                                        const item = comparisonData[key];
                                        let title = '';
                                        if (key === 'income') title = 'Thu Nhập';
                                        if (key === 'expense') title = 'Chi Tiêu';
                                        if (key === 'balance') title = 'Số Dư Ròng';

                                        return (
                                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-600 mb-1">Tổng {title}</p>
                                                <p className={`text-2xl font-bold ${item.statusClass}`}>
                                                    {formatVND(item.currentValue)}
                                                </p>
                                                
                                                {item.percent === 'N/A' && item.previousValue === 0 ? (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Chưa có dữ liệu tháng trước.
                                                    </p>
                                                ) : item.percent === 'Mới' ? (
                                                     <p className={`text-sm text-emerald-600 flex items-center mt-1 ${item.statusClass}`}>
                                                        {item.currentValue > 0 ? 'Mục mới' : 'N/A'}
                                                    </p>
                                                ) : (
                                                    <p className={`text-sm flex items-center mt-1 ${item.statusClass}`}>
                                                        {item.icon && <item.icon size={16} className="mr-1" />}
                                                        {Math.abs(item.percent)}% ({formatVND(item.diff)})
                                                        {item.diff > 0 ? ' Tăng' : ' Giảm'} so với T-{prevMonth}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">Tháng trước: {formatVND(item.previousValue)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Empty State TỔNG QUAN (Khi không có bất kỳ dữ liệu nào trong tháng) */}
                {!loading && !hasData && !error && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg mt-8">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <PieChart size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Không có Dữ liệu
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Không tìm thấy giao dịch nào trong tháng {currentMonth}/{currentYear} để tạo báo cáo.
                        </p>
                        <button
                            onClick={() => navigate('/transactions/add')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                            Thêm Giao Dịch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;