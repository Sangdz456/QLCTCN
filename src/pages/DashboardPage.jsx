import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

// --- HÀM ĐỊNH DẠNG TIỀN TỆ VND ---
const formatVND = (amount) => {
  const number = parseFloat(amount || 0);
  const absoluteAmount = Math.abs(number);
  if (isNaN(number)) return "0 VNĐ";

  return absoluteAmount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
// --- END HÀM ĐỊNH DẠNG ---

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy mã xác thực.");
      }

      const res = await fetch("http://localhost:5000/api/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi tải dữ liệu tổng quan.");
      }

      const data = await res.json();

      // Đảm bảo các giá trị là số và tồn tại
      const safeData = {
        income: parseFloat(data.income) || 0,
        expense: parseFloat(data.expense) || 0,
        balance: parseFloat(data.balance) || 0,
        // ... các trường khác nếu có
      };
      setSummary(safeData);
    } catch (err) {
      console.error("Lỗi tải dữ liệu tổng quan:", err);
      setError(err.message || "Lỗi kết nối hoặc tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = () => {
    fetchSummary();
  };

  // Lấy giá trị an toàn
  const income = summary?.income || 0;
  const expense = summary?.expense || 0;
  const balance = summary?.balance || 0;

  // Tính toán Tỷ lệ
  const expenseRatio = income > 0 ? ((expense / income) * 100).toFixed(1) : "0";
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : "0";
  const netFlow = income - expense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Tổng Quan Tài Chính
            </h1>
            <p className="text-gray-600">
              Cái nhìn tổng quát về hiệu suất tài chính của bạn
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            disabled={loading}
          >
            <RefreshCw
              size={18}
              className={`${loading ? "animate-spin" : ""}`}
            />
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
                <p className="text-emerald-700 font-medium mb-1">
                  Tổng Thu Nhập
                </p>
                {loading ? (
                  <div className="h-10 w-32 bg-emerald-200 rounded animate-pulse"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-emerald-900">
                    {formatVND(income)}
                  </h3>
                )}
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
                {loading ? (
                  <div className="h-10 w-32 bg-rose-200 rounded animate-pulse"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-rose-900">
                    {formatVND(expense)}
                  </h3>
                )}
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
                <p className="text-blue-700 font-medium mb-1">Số Dư Hiện Tại</p>
                {loading ? (
                  <div className="h-10 w-32 bg-blue-200 rounded animate-pulse"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-blue-900">
                    {formatVND(balance)}
                  </h3>
                )}
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

        {/* Additional Info Section */}
        {summary && !loading && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Thông Tin Chi Tiết
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 1. Tỷ lệ Tiết kiệm */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Tỷ lệ Tiết kiệm</p>
                <p className="text-2xl font-bold text-gray-800">
                  {savingsRate}%
                </p>
              </div>

              {/* 2. Tỷ lệ Chi tiêu */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Tỷ lệ Chi tiêu</p>
                <p className="text-2xl font-bold text-gray-800">
                  {expenseRatio}%
                </p>
              </div>

              {/* 3. Dòng tiền ròng */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">Dòng tiền Ròng</p>
                <p
                  className={`text-2xl font-bold ${
                    netFlow >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {formatVND(netFlow)}
                </p>
              </div>

              {/* 4. Chi tiêu TB ngày */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  Chi tiêu TB ngày (ước tính)
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatVND(expense > 0 ? expense / 30 : 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !summary && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu tài chính...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !summary && !error && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
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
              onClick={() => {
                /* Thêm logic chuyển hướng đến trang Thêm Giao dịch */
              }}
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
