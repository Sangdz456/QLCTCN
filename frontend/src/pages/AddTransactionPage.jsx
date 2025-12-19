import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Plus,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  Hash,
} from "lucide-react";

const AddTransactionPage = () => {
  const [formData, setFormData] = useState({
    description: "", // ĐÃ SỬA: Dùng description
    amount: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
    note: "", // ĐÃ SỬA: Dùng note
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);

      if (data && data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({
          ...prev,
          category_id: data[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Không thể tải danh mục.");
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
      // Dùng description
      setError("Vui lòng nhập mô tả giao dịch.");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ (> 0).");
      return;
    }

    if (!formData.category_id) {
      setError("Vui lòng chọn một danh mục.");
      return;
    }

    if (!formData.date) {
      setError("Vui lòng chọn ngày giao dịch.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // DỮ LIỆU GỬI LÊN API: SỬ DỤNG description VÀ note
      const transactionData = {
        description: formData.description.trim(), // ĐÃ SỬA: Gửi description
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        date: formData.date,
        note: formData.note || "", // ĐÃ SỬA: Gửi note
      };

      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });

      if (!res.ok) {
        let message = "Lỗi server khi tạo giao dịch.";
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch (e) {}
        throw new Error(message);
      }

      navigate("/transactions", {
        state: {
          message: "Đã thêm giao dịch thành công!",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Lỗi khi thêm giao dịch:", error);
      setError(error.message || "Thêm giao dịch thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    return category ? category.name : "Chưa chọn";
  };

  const getCategoryType = (categoryId) => {
    const category = categories.find((cat) => cat.id.toString() === categoryId);
    return category?.type || "expense";
  };

  const categoryType = getCategoryType(formData.category_id);
  const typeColor =
    categoryType === "income" ? "text-emerald-600" : "text-rose-600";
  const typeBg = categoryType === "income" ? "bg-emerald-100" : "bg-rose-100";
  const typeBorder =
    categoryType === "income" ? "border-emerald-200" : "border-rose-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 mb-4 text-sm transition-colors duration-200"
          >
            <ArrowLeft size={18} />
            <span>Quay lại Danh sách Giao dịch</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <Plus className="text-white" size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Thêm Giao Dịch Mới
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Ghi lại thu nhập hoặc chi tiêu của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* Transaction Type Display (UI ONLY) */}
                <div className="mb-6">
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl border-2 ${typeBorder} ${typeBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-full ${
                          categoryType === "income"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                      >
                        {categoryType === "income" ? (
                          <TrendingUp className="text-white" size={18} />
                        ) : (
                          <TrendingDown className="text-white" size={18} />
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {categoryType === "income" ? "Thu nhập" : "Chi tiêu"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      (Xác định bởi Danh mục)
                    </p>
                  </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} />
                        Mô tả *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="description" // ĐÃ SỬA NAME
                      value={formData.description} // ĐÃ SỬA VALUE
                      onChange={handleChange}
                      placeholder="VD: Mua sắm tạp hóa, Thanh toán lương"
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={14} />
                        Số tiền *
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-base">
                        $
                      </div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Ngày *
                      </span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Tag size={14} />
                        Danh mục *
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full appearance-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer text-gray-900"
                        required
                        disabled={loading}
                      >
                        <option value="" className="text-gray-900">
                          Chọn danh mục
                        </option>
                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                            className="text-gray-900"
                          >
                            {category.name} (
                            {category.type === "income" ? "Thu" : "Chi"})
                          </option>
                        ))}
                      </select>
                      {loading && (
                        <Loader2
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400"
                          size={16}
                        />
                      )}
                    </div>
                  </div>

                  {/* Note */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Hash size={14} />
                        Ghi chú (Tùy chọn)
                      </span>
                    </label>
                    <textarea
                      name="note" // ĐÃ SỬA NAME
                      value={formData.note} // ĐÃ SỬA VALUE
                      onChange={handleChange}
                      placeholder="Thêm ghi chú bổ sung về giao dịch này..."
                      rows="2"
                      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mt-6 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertCircle size={16} />
                      <span className="font-medium text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : categoryType === "income"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    } text-white shadow-md hover:shadow-lg text-base`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Đang thêm...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        <span>Thêm Giao Dịch</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-5 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Xem trước Giao dịch
              </h2>

              {/* Preview Card */}
              <div className={`rounded-xl p-4 ${typeBg} ${typeBorder}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        categoryType === "income"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                    >
                      {categoryType === "income" ? (
                        <TrendingUp className="text-white" size={18} />
                      ) : (
                        <TrendingDown className="text-white" size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {formData.description || "Mô tả sẽ hiển thị ở đây"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getCategoryName(formData.category_id)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ml-4 ${typeColor}`}>
                    {categoryType === "income" ? "+" : "-"}$
                    {formData.amount || "0.00"}
                  </span>
                </div>

                <div className="space-y-1 text-sm pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Ngày:</span>
                    <span className="font-medium text-gray-800 text-xs">
                      {formData.date
                        ? new Date(formData.date).toLocaleDateString("vi-VN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Hôm nay"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Loại:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBg} ${typeColor}`}
                    >
                      {categoryType === "income" ? "Thu nhập" : "Chi tiêu"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Categories - Đặt ở cột bên phải cho tiện lợi */}
            {categories.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-5">
                <h3 className="text-md font-bold text-gray-800 mb-3">
                  Danh mục Phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          category_id: category.id.toString(),
                        }))
                      }
                      className={`px-3 py-1 rounded-full text-xs transition-colors duration-200 ${
                        formData.category_id === category.id.toString()
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPage;
