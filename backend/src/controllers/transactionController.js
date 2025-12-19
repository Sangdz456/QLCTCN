// src/controllers/transactionController.js
const { pool } = require("../db/db");

// ==========================
// CREATE
// ==========================
exports.createTransaction = async (req, res) => {
    console.log("🔵 Body tạo giao dịch:", req.body);

    const { category_id, amount, date, description } = req.body;

    if (!category_id || !amount || !date) {
        return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    try {
        const sql = `
            INSERT INTO transactions (user_id, category_id, amount, date, description)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            req.user.id,
            category_id,
            amount,
            date,
            description || ""
        ]);

        res.status(201).json({ 
            id: result.insertId, 
            message: "Tạo giao dịch thành công" 
        });

    } catch (error) {
        console.error("❌ Lỗi tạo giao dịch:", error);
        res.status(500).json({ message: "Lỗi server khi tạo giao dịch" });
    }
};


// ==========================
// GET ALL
// ==========================
exports.getTransactions = async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.id, t.amount, t.date, t.description,
                t.created_at, t.category_id,
                c.name AS category_name,
                cg.name AS group_name,
                cg.type AS transaction_type
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            JOIN category_groups cg ON c.group_id = cg.id
            WHERE t.user_id = ?
            ORDER BY t.date DESC, t.created_at DESC
        `;

        const [rows] = await pool.query(sql, [req.user.id]);
        res.status(200).json(rows);

    } catch (error) {
        console.error("❌ Lỗi lấy danh sách giao dịch:", error);
        res.status(500).json({ message: "Lỗi server khi lấy giao dịch" });
    }
};


// ==========================
// GET ONE
// ==========================
exports.getTransactionById = async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM transactions
            WHERE id = ? AND user_id = ?
        `;

        const [rows] = await pool.query(sql, [req.params.id, req.user.id]);

        if (rows.length === 0)
            return res.status(404).json({ message: "Giao dịch không tồn tại" });

        res.json(rows[0]);

    } catch (error) {
        console.error("❌ Lỗi GET ONE:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==========================
// UPDATE
// ==========================
exports.updateTransaction = async (req, res) => {
    const { amount, date, description, category_id } = req.body;

    try {
        const sql = `
            UPDATE transactions
            SET amount = ?, date = ?, description = ?, category_id = ?
            WHERE id = ? AND user_id = ?
        `;

        await pool.query(sql, [
            amount,
            date,
            description,
            category_id,
            req.params.id,
            req.user.id
        ]);

        res.json({ message: "Cập nhật giao dịch thành công" });
    } catch (error) {
        console.error("❌ Lỗi cập nhật:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};


// ==========================
// DELETE
// ==========================
exports.deleteTransaction = async (req, res) => {
    try {
        const sql = `
            DELETE FROM transactions
            WHERE id = ? AND user_id = ?
        `;

        const [result] = await pool.query(sql, [
            req.params.id,
            req.user.id,
        ]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Không tìm thấy giao dịch" });

        res.json({ message: "Xóa thành công" });

    } catch (error) {
        console.error("❌ Lỗi DELETE:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
