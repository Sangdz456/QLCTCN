const { pool } = require("../db/db");

// ==========================
// SUMMARY
// ==========================
exports.getFinancialSummary = async (req, res) => {
    try {
        const sql = `
            SELECT
                SUM(CASE WHEN cg.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN cg.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            JOIN category_groups cg ON c.group_id = cg.id
            WHERE t.user_id = ?
        `;

        const [rows] = await pool.query(sql, [req.user.id]);

        const income = rows[0].total_income || 0;
        const expense = rows[0].total_expense || 0;

        res.status(200).json({
            income,
            expense,
            balance: income - expense
        });

    } catch (error) {
        console.error("❌ Lỗi SUMMARY:", error);
        res.status(500).json({ message: "Lỗi server Summary" });
    }
};

// ==========================
// BREAKDOWN
// ==========================
exports.getExpenseBreakdown = async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.id AS category_id,
                c.name AS category_name,
                cg.type AS transaction_type,
                SUM(t.amount) AS total_amount
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            JOIN category_groups cg ON c.group_id = cg.id
            WHERE t.user_id = ?
            GROUP BY c.id, c.name, cg.type
            ORDER BY total_amount DESC
        `;

        const [rows] = await pool.query(sql, [req.user.id]);

        res.status(200).json(rows);

    } catch (error) {
        console.error("❌ Lỗi Breakdown:", error);
        res.status(500).json({ message: "Lỗi server Breakdown" });
    }
};
