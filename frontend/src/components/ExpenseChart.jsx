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
  // Hàm này không cần thiết vì ReportsPage.jsx đã gửi đi giá trị dạng số
  // const cleanAndParseAmount = (amount) => { ... } 
    
  // Lấy dữ liệu đã được lọc và chuẩn bị từ ReportsPage (chỉ là chi tiêu)
  const expenseData = data
    // ReportsPage.jsx đã đảm bảo dữ liệu là expenseDataForChart (chỉ chi tiêu)
    .map((item, index) => {
      
        // 1. CHUẨN BỊ GIÁ TRỊ: LẤY GIÁ TRỊ TUYỆT ĐỐI (Vì ReportsPage gửi đi giá trị âm)
      const absoluteValue = Math.abs(item.value); 
        
      return {
        name: item.name,
        value: absoluteValue,
        color: COLORS[index % COLORS.length],
      };
    })
    .filter((item) => item.value > 0); // Vẫn lọc các mục chi tiêu bằng 0

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
          {/* SỬA LẠI: Dùng toLocaleString để hiển thị tiền tệ */}
          <p>Số tiền: {data.value.toLocaleString("vi-VN", { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })}</p>
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