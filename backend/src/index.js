const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// DB
const { testConnection } = require('./db/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const budgetRoutes = require('./routes/budgetRoutes'); 
const userRoutes = require('./routes/userRoutes');// ✅ THÊM

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// CORS
// =======================
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// =======================
// Middleware xử lý body
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Routes
// =======================
app.use('/api/auth', authRoutes);
app.use('/api', transactionRoutes);
app.use('/api', categoryRoutes);
app.use('/api', reportRoutes);
app.use('/api', budgetRoutes); // ✅ GẮN ROUTE BUDGET
app.use('/api', userRoutes);

// =======================
// Test API
// =======================
app.get('/', (req, res) => {
    res.send(
        '🚀 Node.js Server đang chạy. ' +
        'Hãy sử dụng /api/auth/login để lấy token.'
    );
});

// =======================
// Start server
// =======================
const startServer = async () => {
    await testConnection();
    app.listen(PORT, () => {
        console.log(`🚀 Server đang lắng nghe tại http://localhost:${PORT}`);
    });
};

startServer();
