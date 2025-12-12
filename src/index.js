// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Các lệnh require bây giờ phải sử dụng đường dẫn tương đối (./)
// vì tất cả các thư mục logic (db, routes, controllers) đều ngang cấp với index.js
const { testConnection } = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); 
const reportRoutes = require('./routes/reportRoutes'); 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));
// 1. Middleware: PHẢI ĐẶT TRƯỚC TẤT CẢ CÁC ROUTES
app.use(express.json()); // Cho phép server đọc body là JSON
app.use(express.urlencoded({ extended: true })); // <-- Bổ sung: Cho phép đọc dữ liệu form encoded

// 2. Routes: Phải nằm SAU các Middleware xử lý Body
app.use('/api/auth', authRoutes); // Tích hợp các route đăng nhập/đăng ký
app.use('/api', transactionRoutes); // Sử dụng base path /api cho giao dịch
app.use('/api', categoryRoutes);    // Sử dụng base path /api cho danh mục
app.use('/api', reportRoutes);      // Sử dụng base path /api cho báo cáo

// 3. Test API cơ bản
app.get('/', (req, res) => {
    res.send('Node.js Server đang chạy. Vui lòng truy cập /api/auth/register hoặc /api/auth/login để bắt đầu.');
});

// 4. Khởi động Server và Test DB Connection
const startServer = () => {
    testConnection(); // Kiểm tra kết nối DB
    app.listen(PORT, () => {
        console.log(`🚀 Server đang lắng nghe tại http://localhost:${PORT}`);
    });
};

startServer();