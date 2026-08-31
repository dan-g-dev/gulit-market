import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/categories — top-level categories with their subcategories nested
export const listCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY parent_id IS NULL DESC, name ASC');

  const topLevel = rows.filter((r) => r.parent_id === null);
  const children = rows.filter((r) => r.parent_id !== null);

  const categories = topLevel.map((cat) => ({
    id: cat.id,
    name: cat.name,
    nameAm: cat.name_am,
    slug: cat.slug,
    icon: cat.icon,
    subcategories: children
      .filter((c) => c.parent_id === cat.id)
      .map((c) => ({ id: c.id, name: c.name, nameAm: c.name_am, slug: c.slug })),
  }));

  res.json({ categories });
});

// POST /api/admin/categories — admin only
export const createCategory = asyncHandler(async (req, res) => {
  const { name, nameAm, slug, icon, parentId } = req.body;
  if (!name || !slug) throw new ApiError(400, 'name and slug are required');

  const [result] = await pool.query(
    `INSERT INTO categories (parent_id, name, name_am, slug, icon)
     VALUES (:parentId, :name, :nameAm, :slug, :icon)`,
    { parentId: parentId ?? null, name, nameAm: nameAm ?? null, slug, icon: icon ?? null }
  );
  res.status(201).json({ id: result.insertId });
});

// DELETE /api/admin/categories/:id — admin only
export const deleteCategory = asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM categories WHERE id = :id', { id: req.params.id });
  if (!result.affectedRows) throw new ApiError(404, 'Category not found');
  res.status(204).send();
});
