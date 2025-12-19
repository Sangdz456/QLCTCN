import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CategoryCard from "../components/CategoryCard";
import {
  Plus,
  Tags,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Không tìm thấy mã xác thực.");
      }

      // ĐẢM BẢO CHỈ GỌI API DANH SÁCH CHUNG: /api/categories
      const res = await fetch("http://localhost:5000/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi tải danh mục từ server.");
      }

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      setError(error.message || "Tải danh mục thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý SỬA: Chuyển hướng đến trang chỉnh sửa (Logic này tạm thời không hoạt động vì đã xóa Route)
  const handleEditCategory = (category) => {
    // Dù Route đã bị xóa, ta vẫn giữ logic để dễ dàng kích hoạt lại
    navigate(`/categories/edit/${category.id}`, { state: { category } });
  };

  // Xử lý XÓA: Gọi API DELETE và cập nhật danh sách
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Xóa danh mục thất bại.");
      }

      setCategories(categories.filter((cat) => cat.id !== id));
      alert("Danh mục đã được xóa thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Tiêu đề */}
            <div>
              <div className="flex items-center gap-3">
                <Tags className="text-blue-600" size={28} />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Quản Lý Danh Mục
                </h1>
              </div>
              <p className="text-gray-600 mt-1">
                Phân loại các khoản thu nhập và chi tiêu của bạn
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchCategories}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <RefreshCw size={18} />
                <span>Tải Lại</span>
              </button>

              <Link
                to="/categories/add"
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-gray-900 rounded-xl border border-blue-400 hover:bg-blue-200 transition-all duration-200 shadow-sm"
              >
                <Plus size={18} />
                <span>Thêm Danh Mục</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 bg-rose-100 border border-rose-400 text-rose-800 rounded-xl mb-6">
            <AlertCircle size={20} className="inline mr-2" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl shadow-lg">
            <Search size={40} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có danh mục nào được tạo
            </h3>
            <p className="text-gray-500 mb-6">
              Bắt đầu bằng cách thêm danh mục đầu tiên của bạn để phân loại giao
              dịch
            </p>
            <Link
              to="/categories/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
            >
              <Plus size={18} />
              Thêm Danh Mục Ngay
            </Link>
          </div>
        )}

        {/* Danh Sách Danh Mục */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onDelete={handleDeleteCategory}
              onEdit={handleEditCategory} // Truyền hàm Edit (hiện tại sẽ không hoạt động nếu Route đã bị xóa)
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
