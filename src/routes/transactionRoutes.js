// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Tạo và Lấy danh sách giao dịch
router.route('/transactions')
    .post(protect, transactionController.createTransaction) // CREATE
    .get(protect, transactionController.getTransactions);    // READ ALL

router.route('/transactions/:id')
    .get(protect, transactionController.getTransactionById)  // READ ONE
    .put(protect, transactionController.updateTransaction)   // UPDATE
    .delete(protect, transactionController.deleteTransaction); // DELETE

module.exports = router;