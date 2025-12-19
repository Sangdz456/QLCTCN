import React from "react";
import { Tag, Edit, Trash2 } from "lucide-react";

// ĐÃ XÓA onEdit KHỎI PROPS
const CategoryCard = ({ category, onDelete }) => {
  // Xác định loại và màu sắc
  const isIncome = category.type === "income";
  const typeColor = isIncome ? "text-emerald-700" : "text-rose-700";
  const typeBg = isIncome ? "bg-emerald-50" : "bg-rose-50";

  // HÀM handleEditClick ĐÃ BỊ XÓA BỎ

  // Hàm gọi onDelete với ID
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // QUAN TRỌNG: Ngăn chặn lỗi click
    if (onDelete) {
      onDelete(category.id);
    }
  };

  return (
    <div
      className={`p-4 rounded-xl shadow-md border ${typeBg} border-gray-200 flex flex-col justify-between transition-shadow duration-200 hover:shadow-lg h-32`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <Tag size={20} className={typeColor} />
          <p className="font-semibold text-lg text-gray-900">
            {category.name || "Tên danh mục"}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto">
        {/* Loại (Income/Expense) */}
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${typeColor} ${typeBg} border border-transparent`}
        >
          {isIncome ? "Thu nhập" : "Chi tiêu"}
        </span>

        {/* Hành động: Chỉ còn Xóa */}
        <div className="flex gap-2">
          {/* NÚT SỬA ĐÃ BỊ XÓA BỎ HOÀN TOÀN */}
          <button
            onClick={handleDeleteClick} // SỬ DỤNG HÀM XỬ LÝ MỚI
            className="text-gray-500 hover:text-rose-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Xóa danh mục"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
