// db/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Tạo pool kết nối, hiệu quả hơn là tạo kết nối đơn lẻ
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Hàm để kiểm tra kết nối khi khởi động server
const testConnection = async () => {
    try {
        await pool.getConnection();
        console.log('✅ MySQL đã kết nối thành công!');
    } catch (error) {
        console.error('❌ LỖI KẾT NỐI MySQL:', error.message);
        process.exit(1); // Thoát nếu lỗi kết nối nghiêm trọng
    }
};

module.exports = {
    pool,
    testConnection
};