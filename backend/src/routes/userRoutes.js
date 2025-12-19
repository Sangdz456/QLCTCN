// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// ===============================
// PROFILE
// ===============================

// GET profile
router.get('/users/profile', protect, userController.getProfile);

// UPDATE username
router.put('/users/profile', protect, userController.updateProfile);

// CHANGE password
router.put('/users/password', protect, userController.changePassword);

module.exports = router;
