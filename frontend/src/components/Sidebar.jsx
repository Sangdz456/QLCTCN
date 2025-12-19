import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Repeat2,
  Tags,
  BarChart,
  LogOut,
  DollarSign, // Thêm icon logo cho ứng dụng
} from "lucide-react";

// Định nghĩa các mục menu
const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Giao Dịch", path: "/transactions", icon: Repeat2 },
  { name: "Danh Mục", path: "/categories", icon: Tags },
  { name: "Báo Cáo", path: "/reports", icon: BarChart },
];

const Sidebar = () => {
  // Hàm xử lý Đăng xuất (Đơn giản)
  const handleLogout = () => {
    localStorage.removeItem("token");
    // Chuyển hướng đến trang đăng nhập (Giả định bạn có navigate nếu dùng useLocation)
    window.location.href = "/login";
  };

  return (
    // Sidebar cố định, nền trắng, đổ bóng nhẹ
    <div className="w-64 bg-white h-screen p-5 shadow-lg flex flex-col justify-between">
      {/* Logo và Menu Chính */}
      <div>
        {/* Logo/Tên Ứng dụng */}
        <div className="flex items-center gap-2 mb-8 p-1">
          <DollarSign className="text-blue-600" size={24} />
          <h2 className="text-xl font-extrabold text-gray-800">
            Money Manager
          </h2>
        </div>

        {/* Thanh điều hướng */}
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              // Thêm các lớp CSS cho hiệu ứng hover và padding đẹp mắt
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium 
                                       hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
            >
              <item.icon
                size={20}
                className="text-gray-500 hover:text-blue-600"
              />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Phần Đăng xuất */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-rose-600 font-medium 
                               hover:bg-rose-50 transition-colors duration-200"
        >
          <LogOut size={20} className="text-rose-500" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
