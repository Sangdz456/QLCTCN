// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/db');

// --- HÀM HỖ TRỢ JWT ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};

// --- CHỨC NĂNG ĐĂNG KÝ (REGISTER) ---
exports.registerUser = async (req, res) => {
    // 1. LẤY username, email, password
    const { email, password, username } = req.body; 

    // Kiểm tra dữ liệu đầu vào (Cập nhật kiểm tra)
    if (!email || !password || !username) {
        // Trả về lỗi rõ ràng để Frontend biết thiếu trường nào
        return res.status(400).json({ message: 'Vui lòng cung cấp Email, Mật khẩu và Tên người dùng.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Kiểm tra Email đã tồn tại chưa
        const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email này đã được đăng ký.' });
        }

        // 2. Băm Mật Khẩu (Hashing)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. LƯU USER VÀO DATABASE (Cập nhật câu lệnh INSERT)
        const [result] = await connection.execute(
            'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
            [email, hashedPassword, username] // Chèn cả username
        );
        const userId = result.insertId;

        // 4. Trả về thông tin và Token
        res.status(201).json({
            id: userId,
            email: email,
            username: username,
            message: 'Đăng ký thành công!',
            token: generateToken(userId),
        });

    } catch (error) {
        // Lỗi 500, chi tiết lỗi SQL sẽ nằm ở đây
        console.error('LỖI KHI ĐĂNG KÝ (SQL Error):', error.message); 
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    } finally {
        if (connection) connection.release();
    }
};

// --- CHỨC NĂNG ĐĂNG NHẬP (LOGIN) ---
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    let connection;
    try {
        connection = await pool.getConnection();

        // 1. Tìm User bằng Email
        const [users] = await connection.execute('SELECT id, email, password, username FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (user) {
            // 2. So sánh Mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // 3. Cấp JWT Token và trả về thành công
                res.json({
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    message: 'Đăng nhập thành công!',
                    token: generateToken(user.id),
                });
            } else {
                // Sai mật khẩu
                res.status(401).json({ message: 'Email hoặc Mật khẩu không đúng.' });
            }
        } else {
            // Không tìm thấy user
            res.status(401).json({ message: 'Email hoặc Mật khẩu không đúng.' });
        }

    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    } finally {
        if (connection) connection.release();
    }
};