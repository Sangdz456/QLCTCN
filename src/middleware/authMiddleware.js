// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { pool } = require('../db/db');

const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra header Authorization
    // Định dạng: Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header (loại bỏ phần 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Giải mã Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            

            // 3. Tìm User trong DB dựa trên ID đã giải mã
            let connection;
            try {
                connection = await pool.getConnection();
                const [users] = await connection.execute(
                    'SELECT id, email FROM users WHERE id = ?',
                    [decoded.id]
                );
                
                // Gán thông tin người dùng vào object request
                // để Controller có thể truy cập (req.user)
                if (users.length > 0) {
                    req.user = users[0];
                    next(); // Cho phép request đi tiếp
                } else {
                    res.status(401).json({ message: 'Người dùng không tồn tại' });
                }
            } finally {
                if (connection) connection.release();
            }

        } catch (error) {
            console.error('Lỗi xác thực Token:', error);
            res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không tìm thấy Token, không có quyền truy cập.' });
    }
};

module.exports = { protect };