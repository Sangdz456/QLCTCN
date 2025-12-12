import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import TransactionCard from "../components/TransactionCard";
import {
  Plus,
  Filter,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Calendar,
} from "lucide-react";

// Component hiển thị thông báo (nếu có từ navigate state)
const AlertMessage = ({ message, type }) => {
  if (!message) return null;
  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-emerald-100" : "bg-rose-100";
  const textColor = isSuccess ? "text-emerald-700" : "text-rose-700";

  return (
    <div className={`p-3 rounded-lg border ${bgColor} mb-6`}>
      <div className={`flex items-center gap-2 ${textColor}`}>
        <AlertCircle size={16} />
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
};

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

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("dateDesc");

  const navigate = useNavigate();
  const location = useLocation();
  const { message: navigateMessage, type: messageType } = location.state || {};

  // Clear state sau khi hiển thị
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch Transactions and Categories concurrently
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!transactionsRes.ok) throw new Error("Không thể tải giao dịch.");
      if (!categoriesRes.ok) throw new Error("Không thể tải danh mục.");

      const transactionsData = await transactionsRes.json();
      const categoriesData = await categoriesRes.json();

      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm ánh xạ category_id sang tên category và type
  const getCategoryDetails = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return {
      name: category ? category.name : "Không rõ",
      type: category ? category.type : "expense",
    };
  };

  // Lọc, tìm kiếm và Sắp xếp giao dịch
  const processedTransactions = useMemo(() => {
    let list = transactions.map((tx) => ({
      ...tx,
      // ÁNH XẠ: SỬ DỤNG description
      description: tx.description || "Không có mô tả",
      categoryName: getCategoryDetails(tx.category_id).name,
      type: getCategoryDetails(tx.category_id).type,
    }));

    // 1. Lọc theo loại
    if (filterType !== "all") {
      list = list.filter((tx) => tx.type === filterType);
    }

    // 2. Tìm kiếm theo mô tả/tên danh mục
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      list = list.filter(
        (tx) =>
          // TÌM KIẾM THEO DESCRIPTION
          tx.description?.toLowerCase().includes(lowerCaseSearch) ||
          tx.categoryName?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 3. Sắp xếp
    return list.sort((a, b) => {
      if (sortBy === "dateDesc") {
        return new Date(b.date) - new Date(a.date);
      }
      if (sortBy === "amountDesc") {
        return b.amount - a.amount;
      }
      if (sortBy === "amountAsc") {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, categories, filterType, searchTerm, sortBy]);

  // --- HÀM XỬ LÝ HÀNH ĐỘNG ---

  // Xóa giao dịch
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Xóa giao dịch thất bại.");

      setTransactions(transactions.filter((tx) => tx.id !== id));

      navigate(location.pathname, {
        replace: true,
        state: { message: "Đã xóa giao dịch thành công.", type: "success" },
      });
    } catch (error) {
      console.error("Lỗi khi xóa giao dịch:", error);
      navigate(location.pathname, {
        replace: true,
        state: {
          message: error.message || "Xóa giao dịch thất bại.",
          type: "error",
        },
      });
    }
  };

  // Chỉnh sửa giao dịch
  const handleEdit = (transaction) => {
    navigate(`/transactions/edit/${transaction.id}`, {
      state: {
        transaction: {
          ...transaction,
          // ĐẢM BẢO TRUYỀN description
          description: transaction.description || "",
          categoryName: getCategoryDetails(transaction.category_id).name,
          type: getCategoryDetails(transaction.category_id).type,
        },
      },
    });
  };

  // Tính toán tổng số dư (Balance - UI Only)
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const details = getCategoryDetails(tx.category_id);
      const amount = parseFloat(tx.amount || 0);

      if (details.type === "income") {
        income += amount;
      } else {
        expense += amount;
      }
    });

    return { totalIncome: income, totalExpense: expense };
  }, [transactions, categories]);

  const totalBalance = totalIncome - totalExpense;

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-lg text-gray-600">
            Đang tải giao dịch...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Message Alert */}
        <AlertMessage message={navigateMessage} type={messageType} />

        {/* Header and Actions */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sổ Giao Dịch</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Quản lý {transactions.length} giao dịch chi tiêu và thu nhập
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={fetchInitialData}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />{" "}
              Tải lại
            </button>
            <button
              onClick={() => navigate("/transactions/add")}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-colors duration-200 text-sm font-medium"
            >
              <Plus size={18} />
              Thêm Giao Dịch
            </button>
          </div>
        </div>

        {/* 3. Balance Summary Cards (ĐÃ DÙNG formatVND) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Balance */}
          <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-1">Tổng Số Dư</p>
            <p
              className={`text-2xl font-extrabold ${
                totalBalance >= 0 ? "text-blue-600" : "text-rose-600"
              }`}
            >
              {formatVND(totalBalance)}
            </p>
          </div>

          {/* Income */}
          <div className="p-4 bg-emerald-50 rounded-xl shadow-lg border border-emerald-200">
            <p className="text-sm font-medium text-emerald-700 flex items-center gap-1 mb-1">
              <TrendingUp size={16} /> Thu Nhập
            </p>
            <p className="text-xl font-bold text-emerald-800">
              {formatVND(totalIncome)}
            </p>
          </div>

          {/* Expense */}
          <div className="p-4 bg-rose-50 rounded-xl shadow-lg border border-rose-200">
            <p className="text-sm font-medium text-rose-700 flex items-center gap-1 mb-1">
              <TrendingDown size={16} /> Chi Tiêu
            </p>
            <p className="text-xl font-bold text-rose-800">
              {formatVND(totalExpense)}
            </p>
          </div>
        </div>

        {/* 4. Filter, Search, and Content Area */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          {/* Filter and Search Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-5 border-b pb-4">
            {/* Search Input */}
            <div className="relative w-full md:w-1/3">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex gap-3 w-full md:w-auto">
              {/* Filter Type */}
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Loại: Tất cả</option>
                  <option value="income">Loại: Thu Nhập</option>
                  <option value="expense">Loại: Chi Tiêu</option>
                </select>
                <Filter
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="dateDesc">Sắp xếp: Mới nhất</option>
                  <option value="amountDesc">Sắp xếp: Số tiền (Giảm)</option>
                  <option value="amountAsc">Sắp xếp: Số tiền (Tăng)</option>
                </select>
                <TrendingUp
                  size={16}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 py-3 border-b border-gray-100 font-semibold text-gray-500 text-sm">
            <div className="col-span-4">Tiêu đề / Mô tả</div>
            <div className="col-span-2">Danh mục</div>
            <div className="col-span-2">Ngày</div>
            <div className="col-span-2 text-right">Số tiền</div>
            <div className="col-span-2 text-right">Hành động</div>
          </div>

          {/* Transaction List */}
          {processedTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {processedTransactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={{
                    ...tx,
                    // TRUYỀN SỐ TIỀN ĐÃ ĐỊNH DẠNG VÀO TRANSACTION OBJECT
                    formattedAmount: formatVND(tx.amount),
                  }}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-gray-500">
              <Calendar size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">
                Không tìm thấy giao dịch nào.
              </p>
              <p className="text-sm">
                Hãy thử thay đổi bộ lọc hoặc thêm giao dịch mới.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
