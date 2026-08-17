const { getDB } = require('../config/db');

function normalizeReviewRow(row) {
  if (!row) return null;

  const normalized = { ...row };
  normalized.featured = Number(normalized.featured) === 1 || normalized.featured === true;
  normalized.rating = Number(normalized.rating || 5);
  return normalized;
}

async function getAllReviews() {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM reviews ORDER BY created_at DESC');
  return rows.map(normalizeReviewRow);
}

async function getReviewById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
  return normalizeReviewRow(rows[0] || null);
}

async function createReview(data) {
  const db = getDB();
  const payload = {
    customer_name: (data.customer_name || '').trim(),
    product_name: (data.product_name || '').trim(),
    rating: Number(data.rating || 5),
    review_title: (data.review_title || '').trim(),
    review: (data.review || '').trim(),
    admin_reply: (data.admin_reply || '').trim(),
    status: data.status || 'Pending',
    featured: data.featured ? 1 : 0,
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  };

  if (!payload.customer_name) throw new Error('Customer name is required');
  if (!payload.review) throw new Error('Review is required');

  const fields = Object.keys(payload);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map(() => '?').join(', ');

  await db.execute(`INSERT INTO reviews (${fields.join(', ')}) VALUES (${placeholders})`, values);

  const [rows] = await db.execute('SELECT * FROM reviews WHERE customer_name = ? ORDER BY id DESC LIMIT 1', [payload.customer_name]);
  return normalizeReviewRow(rows[0] || null);
}

async function updateReview(id, data) {
  const db = getDB();
  const updates = {
    customer_name: (data.customer_name || '').trim() || undefined,
    product_name: (data.product_name || '').trim() || undefined,
    rating: data.rating !== undefined ? Number(data.rating) : undefined,
    review_title: (data.review_title || '').trim() || undefined,
    review: (data.review || '').trim() || undefined,
    admin_reply: (data.admin_reply || '').trim() || undefined,
    status: data.status || undefined,
    featured: data.featured !== undefined ? (data.featured ? 1 : 0) : undefined,
    updated_by: data.updated_by || null,
  };

  const fields = Object.keys(updates).filter((key) => updates[key] !== undefined && updates[key] !== null);
  if (!fields.length) return getReviewById(id);

  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => updates[field]);
  values.push(id);

  await db.execute(`UPDATE reviews SET ${assignments} WHERE id = ?`, values);
  return getReviewById(id);
}

async function deleteReview(id) {
  const db = getDB();
  await db.execute('DELETE FROM reviews WHERE id = ?', [id]);
  return true;
}

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
