// src/controllers/userController.js
const bcrypt = require('bcrypt');
const { pool } = require('../db/db');

// ===============================
// GET PROFILE
// ===============================
// GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            `
            SELECT id, username, email, created_at
            FROM users
            WHERE id = ?
            `,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('❌ Lỗi lấy profile:', error);
        res.status(500).json({ message: 'Lỗi server profile' });
    }
};

// ===============================
// UPDATE USERNAME
// ===============================
// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Thiếu username' });
    }

    try {
        await pool.query(
            `
            UPDATE users
            SET username = ?
            WHERE id = ?
            `,
            [username, userId]
        );

        res.json({ message: 'Cập nhật username thành công' });
    } catch (error) {
        console.error('❌ Lỗi cập nhật profile:', error);
        res.status(500).json({ message: 'Lỗi server profile' });
    }
};

// ===============================
// CHANGE PASSWORD
// ===============================
// PUT /api/users/password
exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Thiếu mật khẩu cũ hoặc mới' });
    }

    try {
        // Lấy mật khẩu hiện tại
        const [rows] = await pool.query(
            `SELECT password FROM users WHERE id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [hashedPassword, userId]
        );

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('❌ Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server đổi mật khẩu' });
    }
};
