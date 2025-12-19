const { pool } = require("../db/db");

// ==========================
// SUMMARY (ALL TIME)
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

        res.json({
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
// MONTHLY SUMMARY
// ==========================
exports.getMonthlySummary = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: "Thiếu month hoặc year" });
    }

    try {
        const sql = `
            SELECT
                SUM(CASE WHEN cg.type = 'income' THEN t.amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN cg.type = 'expense' THEN t.amount ELSE 0 END) AS total_expense
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            JOIN category_groups cg ON c.group_id = cg.id
            WHERE t.user_id = ?
              AND MONTH(t.date) = ?
              AND YEAR(t.date) = ?
        `;

        const [rows] = await pool.query(sql, [userId, month, year]);

        const income = rows[0].total_income || 0;
        const expense = rows[0].total_expense || 0;

        res.json({
            month,
            year,
            income,
            expense,
            balance: income - expense
        });

    } catch (error) {
        console.error("❌ Lỗi MONTHLY SUMMARY:", error);
        res.status(500).json({ message: "Lỗi server Monthly Summary" });
    }
};

// ==========================
// BREAKDOWN (ALL TIME)
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

        res.json(rows);

    } catch (error) {
        console.error("❌ Lỗi Breakdown:", error);
        res.status(500).json({ message: "Lỗi server Breakdown" });
    }
};

exports.getMonthlyBreakdown = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: "Thiếu month hoặc year" });
    }

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
  AND MONTH(t.date) = ?
  AND YEAR(t.date) = ?
GROUP BY c.id, c.name, cg.type
ORDER BY total_amount DESC
`; // <<< ĐÃ SỬA: Loại bỏ tất cả thụt lề/ký tự thừa

        const [rows] = await pool.query(sql, [userId, month, year]);

        // Áp dụng ép kiểu cho Frontend
        const result = rows.map(row => ({
            category_id: row.category_id,
            category_name: row.category_name,
            transaction_type: row.transaction_type, 
            total_amount: parseFloat(row.total_amount) || 0 
        }));

        res.json(result);

    } catch (error) {
        console.error("❌ Lỗi MONTHLY BREAKDOWN:", error);
        res.status(500).json({ message: "Lỗi server Monthly Breakdown" });
    }
};


