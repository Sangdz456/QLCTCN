// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware'); 

// GET /api/categories - Lấy danh sách tất cả danh mục (chung và cá nhân)
router.get('/categories', protect, categoryController.getCategories);

// POST /api/categories - Tạo danh mục cá nhân mới
router.post('/categories', protect, categoryController.createCategory);

// PUT /api/categories/:id - Cập nhật danh mục cá nhân
// DELETE /api/categories/:id - Xóa danh mục cá nhân
router.route('/categories/:id')
    .put(protect, categoryController.updateCategory)
    .delete(protect, categoryController.deleteCategory);

module.exports = router;