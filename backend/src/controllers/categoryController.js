// src/controllers/categoryController.js
const { pool } = require("../db/db");

// ==========================
// GET ALL CATEGORIES
// ==========================
exports.getCategories = async (req, res) => {
    try {
        const sql = `
            SELECT c.*, cg.name AS group_name, cg.type
            FROM categories c
            JOIN category_groups cg ON c.group_id = cg.id
            WHERE c.user_id IS NULL OR c.user_id = ?
        `;

        const [rows] = await pool.query(sql, [req.user.id]);

        res.json(rows);

    } catch (error) {
        console.error("❌ Lỗi GET CATEGORIES:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==========================
// CREATE CATEGORY
// ==========================
exports.createCategory = async (req, res) => {
    const { name, group_id } = req.body;

    if (!name || !group_id)
        return res.status(400).json({ message: "Thiếu dữ liệu" });

    try {
        const sql = `
            INSERT INTO categories (name, group_id, user_id)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            name,
            group_id,
            req.user.id,
        ]);

        res.status(201).json({
            id: result.insertId,
            message: "Tạo danh mục thành công",
        });

    } catch (error) {
        console.error("❌ Lỗi CREATE CATEGORY:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==========================
// UPDATE
// ==========================
exports.updateCategory = async (req, res) => {
    const { name, group_id } = req.body;

    try {
        const sql = `
            UPDATE categories
            SET name = ?, group_id = ?
            WHERE id = ? AND user_id = ?
        `;

        const [result] = await pool.query(sql, [
            name,
            group_id,
            req.params.id,
            req.user.id,
        ]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Không được phép sửa danh mục chung" });

        res.json({ message: "Cập nhật danh mục thành công" });

    } catch (error) {
        console.error("❌ Lỗi UPDATE CATEGORY:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ==========================
// DELETE
// ==========================
exports.deleteCategory = async (req, res) => {
    try {
        const sql = `
            DELETE FROM categories
            WHERE id = ? AND user_id = ?
        `;

        const [result] = await pool.query(sql, [
            req.params.id,
            req.user.id,
        ]);

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Không thể xóa danh mục chung" });

        res.json({ message: "Xóa danh mục thành công" });

    } catch (error) {
        console.error("❌ Lỗi DELETE CATEGORY:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
