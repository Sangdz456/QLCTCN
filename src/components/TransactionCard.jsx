import React from "react";
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const TransactionCard = ({ transaction, onDelete, onEdit }) => {
  // Lấy chi tiết giao dịch
  const {
    id,
    description, // ĐÃ SỬA: Dùng description
    categoryName,
    date,
    formattedAmount,
    type,
    amount, // Lấy amount gốc để xác định dấu
  } = transaction;

  const isIncome = type === "income";
  const amountClass = isIncome ? "text-emerald-700" : "text-rose-700";

  // Hàm gọi onEdit
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(transaction);
    }
  };

  // Hàm gọi onDelete
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    // Bố cục grid phải khớp với header trong TransactionsPage (12 cột)
    <div className="grid grid-cols-12 gap-4 py-3 items-center hover:bg-gray-50 transition-colors duration-150">
      {/* Tiêu đề / Mô tả (4 cột) */}
      <div className="col-span-4 flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isIncome ? "bg-emerald-100" : "bg-rose-100"
          } ${isIncome ? "text-emerald-600" : "text-rose-600"}`}
        >
          {isIncome ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {description || "Không có mô tả"} {/* HIỂN THỊ DESCRIPTION */}
          </p>
          <p className="text-xs text-gray-500">ID: {id}</p>
        </div>
      </div>

      {/* Danh mục (2 cột) */}
      <div className="col-span-2 text-sm text-gray-700">
        {categoryName || "N/A"}
      </div>

      {/* Ngày (2 cột) */}
      <div className="col-span-2 text-sm text-gray-600">{formatDate(date)}</div>

      {/* Số tiền (2 cột) */}
      <div className="col-span-2 text-right">
        <p className={`font-semibold text-sm md:text-base ${amountClass}`}>
          {/* Hiển thị dấu + hoặc - dựa trên loại giao dịch */}
          {isIncome ? "+" : "-"}
          {formattedAmount}
        </p>
      </div>

      {/* Hành động (2 cột) */}
      <div className="col-span-2 flex justify-end gap-2 pr-2">
        {/* Nút Sửa */}
        <button
          onClick={handleEditClick}
          className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Sửa giao dịch"
        >
          <Edit size={16} />
        </button>
        {/* Nút Xóa */}
        <button
          onClick={handleDeleteClick}
          className="text-gray-500 hover:text-rose-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="Xóa giao dịch"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;
