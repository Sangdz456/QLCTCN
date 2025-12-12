// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware'); 

// GET /api/summary - Lấy tóm tắt tài chính (Tổng thu, tổng chi, số dư)
router.get('/summary', protect, reportController.getFinancialSummary);

// GET /api/reports/breakdown - API mới cho biểu đồ phân tích chi tiêu chi tiết
router.get('/reports/breakdown', protect, reportController.getExpenseBreakdown);

module.exports = router;