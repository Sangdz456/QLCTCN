const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// ==========================
// SUMMARY
// ==========================

// GET /api/summary
router.get('/summary', protect, reportController.getFinancialSummary);

// GET /api/summary/monthly?month=MM&year=YYYY
router.get('/summary/monthly', protect, reportController.getMonthlySummary);

// ==========================
// BREAKDOWN
// ==========================

// GET /api/reports/breakdown
router.get('/reports/breakdown', protect, reportController.getExpenseBreakdown);

// GET /api/reports/breakdown/monthly?month=MM&year=YYYY
router.get(
    '/reports/breakdown/monthly',
    protect,
    reportController.getMonthlyBreakdown
);

module.exports = router;
