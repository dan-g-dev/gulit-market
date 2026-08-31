import pool from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/locations — full location tree (country -> cities -> districts)
export const listLocations = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM locations ORDER BY level, name ASC');

  const cities = rows.filter((r) => r.level === 'city');
  const districts = rows.filter((r) => r.level === 'district');

  const locations = cities.map((city) => ({
    id: city.id,
    name: city.name,
    nameAm: city.name_am,
    districts: districts
      .filter((d) => d.parent_id === city.id)
      .map((d) => ({ id: d.id, name: d.name, nameAm: d.name_am })),
  }));

  res.json({ locations });
});
