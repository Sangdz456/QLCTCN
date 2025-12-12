import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // --- VALIDATION FRONTEND ---
    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp nhau.");
      return;
    }
    if (!username.trim()) {
      setError("Vui lòng nhập tên người dùng.");
      return;
    }
    // --- END VALIDATION ---

    setLoading(true);

    try {
      // Dữ liệu gửi đi: bao gồm username, email, và password
      const userData = {
        username: username.trim(),
        email: email.trim(),
        password: password,
      };

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        // Lỗi từ server (ví dụ: email đã tồn tại, username đã tồn tại)
        setError(data.message || "Đăng ký thất bại.");
      }
    } catch {
      setError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300">
        <h2 className="text-3xl font-extrabold mb-2 text-center text-gray-800">
          Đăng Ký Tài Khoản
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Bắt đầu quản lý chi tiêu của bạn ngay hôm nay
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Error Message */}
          {error && (
            <p className="p-3 bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-sm">
              {error}
            </p>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên người dùng
            </label>
            <input
              type="text"
              placeholder="Nhập tên người dùng"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-900"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-900"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Tạo mật khẩu an toàn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-900 ${
                password && password !== confirmPassword
                  ? "border-rose-500"
                  : "border-gray-300"
              }`}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150 text-gray-900 ${
                password && password !== confirmPassword
                  ? "border-rose-500"
                  : "border-gray-300"
              }`}
              required
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-rose-500 text-xs mt-1">Mật khẩu không khớp.</p>
            )}
          </div>

          {/* Register Button */}
          <button
            disabled={loading || (password && password !== confirmPassword)}
            className="w-full flex items-center justify-center bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Đăng Ký"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
