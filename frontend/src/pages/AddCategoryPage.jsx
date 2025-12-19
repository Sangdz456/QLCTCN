import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Tag,
  Plus,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

// --- HÀM MAPPING CHUYỂN ĐỔI ---
const groupMap = {
  // API YÊU CẦU: group_id (integer)
  typeToId: {
    income: 1, // Giả định Thu nhập là group_id 1
    expense: 2, // Giả định Chi tiêu là group_id 2
  },
};
// --- END MAPPING ---

const AddCategoryPage = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense"); // Thêm state cho Loại (Thu/Chi)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }

    // Ánh xạ type sang group_id
    const group_id = groupMap.typeToId[type];
    if (!group_id) {
      setError("Lỗi xác định nhóm danh mục. Vui lòng thử lại.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Dữ liệu gửi lên API: name và group_id
      const categoryData = {
        name: name.trim(),
        group_id: group_id,
      };

      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/categories", {
          state: { message: "Thêm danh mục thành công!" },
        });
      } else {
        // Lỗi từ server (ví dụ: tên danh mục trùng, group_id không hợp lệ)
        throw new Error(data.message || "Thêm danh mục thất bại.");
      }
    } catch (err) {
      console.error("Lỗi tạo danh mục:", err);
      setError(err.message || "Lỗi server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const submitButtonClass =
    type === "income"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-4 md:p-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6 font-medium text-sm"
          >
            <ArrowLeft size={18} />
            <span>Quay lại Quản lý Danh mục</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-md">
              <Tag className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Thêm Danh Mục Mới
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Thêm một danh mục mới để phân loại giao dịch
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-xl space-y-5"
        >
          {/* Tên Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Tag size={14} className="inline mr-1" /> Tên Danh mục *
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Tiền Lương, Tiền thuê nhà, Ăn uống"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
              required
            />
          </div>

          {/* Loại (Thu nhập / Chi tiêu) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại Giao Dịch *
            </label>
            <div className="flex gap-4">
              {/* Expense Button (Chi Tiêu) */}
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 w-1/2 justify-center ${
                  type === "expense"
                    ? "border-rose-500 bg-rose-50 text-rose-700 font-semibold shadow-sm"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <TrendingDown size={20} /> Chi Tiêu
              </button>

              {/* Income Button (Thu Nhập) */}
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 w-1/2 justify-center ${
                  type === "income"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold shadow-sm"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <TrendingUp size={20} /> Thu Nhập
              </button>
            </div>
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
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-colors duration-200 shadow-md disabled:bg-gray-400 ${submitButtonClass}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Đang thêm...
                </>
              ) : (
                <>
                  <Plus size={20} /> Thêm Danh Mục
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryPage;
