const { pool } = require('../db/db');

// ===============================
// CREATE hoặc UPDATE Budget
// ===============================
exports.createOrUpdateBudget = async (req, res) => {
    const userId = req.user.id;
    const { category_id, amount, month, year } = req.body;

    if (!category_id || !amount || !month || !year) {
        return res.status(400).json({ message: 'Thiếu dữ liệu budget' });
    }

    try {
        // Kiểm tra budget đã tồn tại chưa
        const [rows] = await pool.query(
            `
            SELECT id 
            FROM budgets
            WHERE user_id = ? 
              AND category_id = ? 
              AND month = ? 
              AND year = ?
            `,
            [userId, category_id, month, year]
        );

        if (rows.length > 0) {
            // UPDATE
            await pool.query(
                `
                UPDATE budgets 
                SET amount = ?
                WHERE id = ?
                `,
                [amount, rows[0].id]
            );

            return res.json({ message: 'Cập nhật budget thành công' });
        } else {
            // INSERT
            await pool.query(
                `
                INSERT INTO budgets (user_id, category_id, amount, month, year)
                VALUES (?, ?, ?, ?, ?)
                `,
                [userId, category_id, amount, month, year]
            );

            return res.status(201).json({ message: 'Tạo budget thành công' });
        }

    } catch (error) {
        console.error('❌ Lỗi tạo/cập nhật budget:', error);
        res.status(500).json({ message: 'Lỗi server budget' });
    }
};

// ===============================
// GET Budgets theo tháng/năm  ✅ FIX QUAN TRỌNG
// ===============================
exports.getBudgets = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Thiếu month hoặc year' });
    }

    try {
        const [rows] = await pool.query(
            `
            SELECT
                b.id,
                b.amount,
                b.month,
                b.year,
                c.id AS category_id,        -- <<< FIX: BẮT BUỘC
                c.name AS category_name,
                cg.type AS category_type   -- <<< FIX: BẮT BUỘC
            FROM budgets b
            JOIN categories c ON b.category_id = c.id
            JOIN category_groups cg ON c.group_id = cg.id
            WHERE b.user_id = ? 
              AND b.month = ? 
              AND b.year = ?
            `,
            [userId, month, year]
        );

        res.json(rows);

    } catch (error) {
        console.error('❌ Lỗi lấy budgets:', error);
        res.status(500).json({ message: 'Lỗi server budget' });
    }
};

// ===============================
// DELETE Budget
// ===============================
exports.deleteBudget = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    try {
        const [result] = await pool.query(
            `
            DELETE FROM budgets 
            WHERE id = ? AND user_id = ?
            `,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Budget không tồn tại hoặc không có quyền'
            });
        }

        res.json({ message: 'Xóa budget thành công' });

    } catch (error) {
        console.error('❌ Lỗi xóa budget:', error);
        res.status(500).json({ message: 'Lỗi server budget' });
    }
};
