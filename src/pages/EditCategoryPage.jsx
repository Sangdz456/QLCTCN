import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Edit,
  Tag,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// --- HÀM MAPPING CHUYỂN ĐỔI: KHỚP VỚI CẤU TRÚC category_group ---
const groupMap = {
  // 1. Ánh xạ từ Type (Form) sang Group ID (API)
  typeToId: {
    income: 1, // ID 1: Thu nhập
    expense: 2, // ID 2: Chi tiêu thiết yếu (Chọn làm mặc định cho Form)
  },
  // 2. Ánh xạ ngược từ Group ID (API) sang Type (Form)
  idToType: {
    1: "income",
    2: "expense",
    3: "expense", // Chi tiêu cá nhân cũng hiển thị là 'expense' trên Form
    4: "expense", // Nợ & Tiết kiệm (saving) cũng hiển thị là 'expense' trên Form
  },
};
// --- END MAPPING ---

const EditCategoryPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialCategory = location.state?.category;

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Nếu có ID, bắt đầu tải dữ liệu
    if (id) {
      fetchCategoryData();
    } else {
      // Trường hợp không có ID (lỗi điều hướng)
      navigate("/categories");
    }
  }, [id]);

  const fetchCategoryData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      let categoryData = initialCategory;

      // Nếu không có dữ liệu từ state, fetch chi tiết danh mục
      if (!categoryData || !categoryData.name) {
        const res = await fetch(
          `http://localhost:5000/api/categories/${id}/details`,
          {
            // Giả định API chi tiết
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // LƯU Ý: Nếu bạn chỉ có API GET /api/categories/:id, hãy dùng nó.
        // Tuy nhiên, hàm này cần phải tải được trường group_id.
        const resDetail = await fetch(
          `http://localhost:5000/api/categories/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!resDetail.ok) throw new Error("Không thể tải chi tiết danh mục.");
        categoryData = await resDetail.json();

        // Kiểm tra dữ liệu trả về có phải mảng hay không
        if (Array.isArray(categoryData)) {
          categoryData = categoryData[0];
        }
        if (!categoryData) throw new Error("Dữ liệu danh mục không hợp lệ.");
      }

      // LOGIC TẢI: Ánh xạ group_id (từ API) sang type (cho form)
      // categoryData.group_id là trường Backend trả về
      const determinedType =
        groupMap.idToType[categoryData.group_id] || "expense";

      setFormData({
        name: categoryData.name || "",
        type: determinedType,
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu danh mục:", error);
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

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên danh mục.");
      return;
    }
    if (!formData.type) {
      setError("Vui lòng chọn loại giao dịch.");
      return;
    }

    // TRƯỚC KHI GỬI: Chuyển đổi type (form) sang group_id (API)
    const group_id = groupMap.typeToId[formData.type];
    if (!group_id) {
      setError("Lỗi xác định nhóm danh mục. Vui lòng thử lại.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      // DỮ LIỆU GỬI LÊN API PUT: SỬ DỤNG group_id và name
      const categoryData = {
        name: formData.name.trim(),
        group_id: group_id, // GỬI GROUP_ID ĐÃ ÁNH XẠ
      };

      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Không thể cập nhật danh mục.");
      }

      navigate("/categories", {
        state: {
          message: "Đã cập nhật danh mục thành công!",
          type: "success",
        },
      });
    } catch (error) {
      console.error("Lỗi cập nhật danh mục:", error);
      setError(
        error.message || "Cập nhật danh mục thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const typeColorClass =
    formData.type === "income"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-blue-600 hover:bg-blue-700";

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
        {/* Header (Mẫu đã tối ưu) */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <button
            onClick={() => navigate("/categories")}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6 font-medium text-sm"
          >
            <ArrowLeft size={18} />
            <span>Quay lại Quản lý Danh mục</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md">
              <Tag className="text-white" size={24} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Chỉnh Sửa Danh Mục
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Cập nhật danh mục ID:
                <span className="font-semibold text-blue-600 ml-1">#{id}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Chỉnh sửa */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            {/* Tên Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Tag size={14} className="inline mr-1" /> Tên Danh mục *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Lương, Hóa đơn, Ăn uống"
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
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "expense" }))
                  }
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 w-1/2 justify-center ${
                    formData.type === "expense"
                      ? "border-rose-500 bg-rose-50 text-rose-700 font-semibold shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <TrendingDown size={20} /> Chi Tiêu
                </button>

                {/* Income Button (Thu Nhập) */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: "income" }))
                  }
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 w-1/2 justify-center ${
                    formData.type === "income"
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
                disabled={submitting || loading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-400 shadow-md ${typeColorClass}`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Đang cập
                    nhật...
                  </>
                ) : (
                  <>
                    <Edit size={20} /> Cập Nhật Danh Mục
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

export default EditCategoryPage;
