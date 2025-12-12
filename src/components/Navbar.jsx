import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // THÊM useLocation
import { LogOut, DollarSign } from "lucide-react";

// Định nghĩa các mục điều hướng (đã chuyển sang tiếng Việt)
const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Giao Dịch", path: "/transactions" },
  { name: "Danh Mục", path: "/categories" },
  { name: "Báo Cáo", path: "/reports" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đối tượng location hiện tại

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Hàm kiểm tra nếu đường dẫn hiện tại là active
  const isActive = (path) => {
    // Nếu path là "/" (Dashboard) và pathname hiện tại là "/", thì là active
    if (path === "/") {
      return location.pathname === "/";
    }
    // Đối với các path khác, kiểm tra xem pathname có BẮT ĐẦU bằng path đó không
    // (Ví dụ: /transactions khớp với /transactions/add)
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-md px-6 md:px-10 py-3 flex justify-between items-center sticky top-0 z-40">
      {/* Logo và Tên Ứng dụng */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-extrabold text-gray-800">SAVE APP</h1>
      </div>

      {/* Navigation Links và Logout */}
      <div className="flex items-center space-x-6">
        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1" // ACTIVE STYLE
                  : "text-gray-600 hover:text-blue-500" // DEFAULT STYLE
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg 
                     font-semibold hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <LogOut size={18} />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
