import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Edit,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

const EditTransactionPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialTransaction = location.state?.transaction;

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category_id: "",
    date: "",
    notes: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // 1. Tải danh mục
      const resCategories = await fetch(
        "http://localhost:5000/api/categories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const dataCategories = await resCategories.json();
      setCategories(dataCategories);

      // 2. Lấy dữ liệu giao dịch hiện tại
      let transactionData = initialTransaction;

      if (!transactionData) {
        const resTransaction = await fetch(
          `http://localhost:5000/api/transactions/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!resTransaction.ok)
          throw new Error("Không thể tải chi tiết giao dịch.");
        transactionData = await resTransaction.json();
      }

      // 3. Điền dữ liệu vào form
      setFormData({
        description: transactionData.description || "",
        amount: String(transactionData.amount || ""),
        category_id: String(transactionData.category_id || ""),
        date: transactionData.date
          ? transactionData.date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: transactionData.notes || "",
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setError(error.message || "Tải dữ liệu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả.");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        date: formData.date,
        notes: formData.notes || "",
      };

      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể cập nhật giao dịch.");
      }

      navigate("/transactions", {
        state: {
          message: "Đã cập nhật giao dịch thành công!",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Lỗi cập nhật giao dịch:", error);
      setError(
        error.message || "Cập nhật giao dịch thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-4 md:p-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6 font-medium text-sm"
          >
            <ArrowLeft size={18} />
            <span>Quay lại Danh sách Giao dịch</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md">
              <Edit className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Chỉnh Sửa Giao Dịch
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Cập nhật giao dịch ID:
                <span className="font-semibold text-blue-600 ml-1">#{id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Chỉnh sửa */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <FileText size={14} className="inline mr-1" /> Mô tả *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả giao dịch"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <DollarSign size={14} className="inline mr-1" /> Số tiền *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Tag size={14} className="inline mr-1" /> Danh mục *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
                required
              >
                <option value="" disabled>
                  Chọn danh mục
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} (
                    {category.type === "income" ? "Thu" : "Chi"})
                  </option>
                ))}
              </select>
              {categories.length === 0 && !loading && (
                <p className="text-xs text-rose-500 mt-1">
                  Lỗi: Không tải được danh mục.
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Calendar size={14} className="inline mr-1" /> Ngày *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
                required
              />
            </div>

            {/* Notes (Tùy chọn) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ghi chú (Tùy chọn)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                <AlertCircle size={16} className="inline mr-2" /> {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Đang cập
                    nhật...
                  </>
                ) : (
                  <>
                    <Edit size={20} /> Cập Nhật Giao Dịch
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionPage;
