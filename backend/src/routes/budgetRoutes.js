const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

// GET budgets theo tháng/năm
router.get('/budgets', protect, budgetController.getBudgets);

// CREATE hoặc UPDATE budget
router.post('/budgets', protect, budgetController.createOrUpdateBudget);

// DELETE budget
router.delete('/budgets/:id', protect, budgetController.deleteBudget);

module.exports = router;
