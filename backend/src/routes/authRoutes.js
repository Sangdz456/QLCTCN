// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Import toàn bộ module Controller và Middleware protect
const authController = require('../controllers/authController'); 
const { protect } = require('../middleware/authMiddleware'); 

// POST /api/auth/register
// Lỗi xảy ra tại dòng 13, tôi sửa lại cách gọi để Express chắc chắn nhận được hàm
router.post('/register', function(req, res) {
    authController.registerUser(req, res);
});

// POST /api/auth/login 
router.post('/login', function(req, res) {
    authController.loginUser(req, res);
}); 

// GET /api/auth/profile - ROUTE BẢO VỆ (Kiểm tra Token)
router.get('/profile', protect, (req, res) => {
    // Nếu code chạy đến đây, User đã được xác thực
    res.json({
        id: req.user.id,
        email: req.user.email,
        message: 'Thông tin cá nhân được bảo vệ.'
    });
});

module.exports = router;