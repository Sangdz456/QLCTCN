import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const ReportsPage = () => {
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/reports/breakdown", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi tải báo cáo từ server.");
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setBreakdown(data);
      } else {
        throw new Error("Dữ liệu báo cáo không đúng định dạng mảng.");
      }
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
      setError(err.message || "Tải dữ liệu báo cáo thất bại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    breakdown.forEach((item) => {
      const amount = parseFloat(item.total_amount || 0);

      if (item.transaction_type === "income") {
        income += amount;
      } else if (item.transaction_type === "expense") {
        expense += amount;
      }
    });
    return { totalIncome: income, totalExpense: expense };
  }, [breakdown]);

  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Báo Cáo & Phân Tích
            </h1>
            <p className="text-gray-600">
              Phân tích chi tiêu và thu nhập theo danh mục
            </p>
          </div>

          <button
            onClick={fetchReports}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            disabled={loading}
          >
            <RefreshCw
              size={18}
              className={`${loading ? "animate-spin" : ""}`}
            />
            <span>{loading ? "Đang tải..." : "Tải Lại Báo Cáo"}</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-rose-100 border border-rose-400 text-rose-800 rounded-lg">
            <AlertCircle size={20} className="inline mr-2" />
            <span className="font-medium">Lỗi: {error}</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tổng Chi tiêu (Expense Card) */}
          <div className="p-6 bg-rose-50 rounded-2xl shadow-lg border border-rose-200">
            <p className="text-sm font-medium text-rose-700 mb-1 flex items-center gap-2">
              <TrendingDown size={18} /> Tổng Chi Tiêu
            </p>
            {/* KHẮC PHỤC LỖI: Dùng h3 (hoặc div) thay cho p để chứa <div> loading */}
            <h3 className="text-3xl font-bold text-rose-900">
              {loading ? (
                <div className="h-8 w-1/2 bg-rose-200 animate-pulse rounded"></div>
              ) : (
                formatVND(totalExpense)
              )}
            </h3>
          </div>

          {/* Tổng Thu nhập (Income Card) */}
          <div className="p-6 bg-emerald-50 rounded-2xl shadow-lg border border-emerald-200">
            <p className="text-sm font-medium text-emerald-700 mb-1 flex items-center gap-2">
              <TrendingUp size={18} /> Tổng Thu Nhập
            </p>
            {/* KHẮC PHỤC LỖI */}
            <h3 className="text-3xl font-bold text-emerald-900">
              {loading ? (
                <div className="h-8 w-1/2 bg-emerald-200 animate-pulse rounded"></div>
              ) : (
                formatVND(totalIncome)
              )}
            </h3>
          </div>

          {/* Số dư Ròng (Balance Card) */}
          <div className="p-6 bg-blue-50 rounded-2xl shadow-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-2">
              <BarChart size={18} /> Số Dư Ròng
            </p>
            {/* KHẮC PHỤC LỖI */}
            <h3
              className={`text-3xl font-bold ${
                totalBalance >= 0 ? "text-blue-900" : "text-rose-900"
              }`}
            >
              {loading ? (
                <div className="h-8 w-1/2 bg-blue-200 animate-pulse rounded"></div>
              ) : (
                formatVND(totalBalance)
              )}
            </h3>
          </div>
        </div>

        {/* Main Reports Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. Biểu đồ Phân tích Chi tiêu */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PieChart size={20} /> Phân Tích Chi Tiêu theo Danh Mục
            </h2>
            {loading ? (
              <div className="h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : (
              <ExpenseChart data={breakdown} />
            )}
          </div>

          {/* 2. Bảng Chi tiết Phân tích */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart size={20} /> Chi Tiết Phân Tích
            </h2>

            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            )}

            {!loading && breakdown.length > 0 ? (
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
                      {item.transaction_type === "income" ? "+" : "-"}
                      {formatVND(item.total_amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              !loading &&
              !error &&
              breakdown.length === 0 && (
                <p className="text-gray-500 text-center py-10">
                  Không có dữ liệu chi tiết để hiển thị.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
