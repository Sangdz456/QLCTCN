import React, { useState, useRef, useEffect } from "react"; 
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import { LogOut, DollarSign, User } from "lucide-react"; 

// Định nghĩa các mục điều hướng (GIỮ NGUYÊN /budgets)
const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Giao Dịch", path: "/transactions" },
    { name: "Danh Mục", path: "/categories" },
    { name: "Báo Cáo", path: "/reports" },
    { name: "Ngân Sách", path: "/budgets" }, // <<< GIỮ NGUYÊN /budgets
];

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const menuRef = useRef(null); 

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Hàm đóng menu khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    // Hàm kiểm tra nếu đường dẫn hiện tại là active
    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bg-white shadow-md px-6 md:px-10 py-3 flex justify-between items-center sticky top-0 z-40">
            
            {/* Logo và Tên Ứng dụng */}
            <div className="flex items-center gap-2">
                <Link 
                    to="/" 
                    className="flex items-center gap-2 cursor-pointer transition-opacity duration-200 hover:opacity-80"
                    title="Trang chủ / Tải lại Dashboard"
                >
                    <DollarSign size={24} className="text-blue-600" />
                    <h1 className="text-xl font-extrabold text-gray-800">SAVE APP</h1>
                </Link>
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
                                    ? "text-blue-600 font-bold border-b-2 border-blue-600 pb-1"
                                    : "text-gray-600 hover:text-blue-500"
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* DROPDOWN MENU CHO PROFILE VÀ ĐĂNG XUẤT */}
                <div 
                    className="relative"
                    ref={menuRef} 
                >
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        // Style nút Tài Khoản (Đã giữ nguyên theo yêu cầu)
                        className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg 
                                   font-semibold hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <User size={18} />
                        <span>Tài Khoản</span> 
                    </button>
                    
                    {isMenuOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 origin-top-right animate-fade-in"
                        >
                            
                            {/* Nút Thông Tin Cá Nhân */}
                            <Link
                                to="/profile" 
                                // ĐÃ SỬA: Mặc định chữ xám, hover nền sáng, chữ xanh mạnh
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-100 transition"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User size={18} className="mr-2 text-blue-500" />
                                Thông Tin Cá Nhân
                            </Link>

                            {/* Nút Đăng Xuất */}
                            <button
                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                // ĐÃ SỬA: Mặc định chữ đỏ, hover nền sáng, chữ đỏ mạnh
                                className="w-full text-left flex items-center px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-b-md transition"
                            >
                                <LogOut size={18} className="mr-2" />
                                Đăng Xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;