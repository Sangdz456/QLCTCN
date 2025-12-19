import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Thực hiện Fetch
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // 2. Kiểm tra Response OK (200-299)
      if (!res.ok) {
        // Cố gắng đọc lỗi từ JSON nếu server gửi
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Đăng nhập thất bại. Mã lỗi: " + res.status
        );
      }

      // 3. Xử lý thành công (res.ok là true)
      const data = await res.json();

      localStorage.setItem("token", data.token);
      navigate("/"); // Điều hướng về trang chủ
    } catch (err) {
      // Xử lý lỗi (kết nối hoặc lỗi từ Server)
      console.error("Login error:", err);
      setError(err.message || "Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Container chính */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 transform hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-600 rounded-xl mb-3 shadow-md">
            <User className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Đăng Nhập</h2>
          <p className="text-gray-500 mt-1">
            Quản lý tài chính cá nhân hiệu quả
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900 bg-gray-50"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-gray-900 bg-gray-50"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
