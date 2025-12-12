import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#FF4C65",
  "#FF8A00",
  "#FFCD28",
  "#63A69F",
  "#396A9F",
  "#7A63FF",
];

// Component Biểu đồ Tròn
const ExpenseChart = ({ data }) => {
  // --- LÀM SẠCH DỮ LIỆU ĐỂ TRÁNH LỖI PARSING ---
  const cleanAndParseAmount = (amount) => {
    if (typeof amount === "string") {
      // Loại bỏ dấu phẩy (,) và ký hiệu tiền tệ ($, VNĐ) trước khi parse
      amount = amount.replace(/[^0-9.-]+/g, "");
    }
    return parseFloat(amount) || 0;
  };
  // ----------------------------------------------

  // Lọc chỉ lấy các mục chi tiêu (expense) và chuẩn bị dữ liệu
  const expenseData = data
    .filter((item) => item.transaction_type === "expense") // Lọc theo loại
    .map((item, index) => {
      const parsedValue = cleanAndParseAmount(item.total_amount);
      return {
        name: item.category_name,
        value: parsedValue,
        color: COLORS[index % COLORS.length],
      };
    })
    .filter((item) => item.value > 0); // Chỉ giữ lại các mục có giá trị > 0

  // ----------------------------------------------------
  // KHỐI HIỂN THỊ KHI KHÔNG CÓ DỮ LIỆU CHI TIÊU
  // ----------------------------------------------------
  if (expenseData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">
            Không có dữ liệu chi tiêu để vẽ biểu đồ.
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Hãy thêm giao dịch Chi tiêu (Expense) để xem phân tích.
          </p>
        </div>
      </div>
    );
  }
  // ----------------------------------------------------

  // Custom Tooltip formatter để hiển thị VND
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = expenseData.reduce((sum, item) => sum + item.value, 0);
      const percentage = (data.value / total) * 100;
      return (
        <div className="bg-white p-2 border border-gray-300 rounded-lg shadow-md text-sm">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p>Số tiền: {data.value.toLocaleString("vi-VN")} VNĐ</p>
          <p className="text-gray-500">Chiếm: {percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={expenseData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          fill="#8884d8"
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
        >
          {expenseData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
