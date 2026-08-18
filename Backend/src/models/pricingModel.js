const { getDB } = require('../config/db');

function jsonValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : trimmed;
    } catch {
      return trimmed;
    }
  }
  if (Array.isArray(value)) return value;
  return value;
}

function normalizePricingRow(row) {
  if (!row) return null;

  const normalized = { ...row };
  if (normalized.features === null || normalized.features === undefined) {
    normalized.features = [];
  } else if (typeof normalized.features === 'string') {
    try {
      normalized.features = JSON.parse(normalized.features);
    } catch {
      normalized.features = [];
    }
  }

  if (!Array.isArray(normalized.features)) {
    normalized.features = [];
  }

  return normalized;
}

async function getAllPricing() {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM pricing_plans ORDER BY display_order ASC, id DESC');
  return rows.map(normalizePricingRow);
}

async function getPricingById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM pricing_plans WHERE id = ? LIMIT 1', [id]);
  return normalizePricingRow(rows[0] || null);
}

async function createPricing(data) {
  const db = getDB();
  const payload = {
    plan_title: data.plan_title || null,
    price: data.price || null,
    audience: data.audience || null,
    description: data.description || null,
    features: jsonValue(data.features) || [],
    status: data.status || 'active',
    display_order: Number(data.display_order || 0),
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  };

  if (!payload.plan_title) {
    throw new Error('Plan title is required');
  }

  const [existing] = await db.execute('SELECT id FROM pricing_plans WHERE plan_title = ? LIMIT 1', [payload.plan_title]);
  if (existing.length) {
    throw new Error('Pricing plan already exists');
  }

  const fields = Object.keys(payload);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map(() => '?').join(', ');

  await db.execute(`INSERT INTO pricing_plans (${fields.join(', ')}) VALUES (${placeholders})`, values);

  const [rows] = await db.execute('SELECT * FROM pricing_plans WHERE plan_title = ? ORDER BY id DESC LIMIT 1', [payload.plan_title]);
  return normalizePricingRow(rows[0] || null);
}

async function updatePricing(id, data) {
  const db = getDB();
  const updates = {
    plan_title: data.plan_title,
    price: data.price,
    audience: data.audience,
    description: data.description,
    features: jsonValue(data.features),
    status: data.status,
    display_order: data.display_order !== undefined ? Number(data.display_order) : undefined,
    updated_by: data.updated_by || null,
  };

  const fields = Object.keys(updates).filter((key) => updates[key] !== undefined && updates[key] !== null);
  if (!fields.length) return getPricingById(id);

  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => updates[field]);
  values.push(id);

  await db.execute(`UPDATE pricing_plans SET ${assignments} WHERE id = ?`, values);
  return getPricingById(id);
}

async function deletePricing(id) {
  const db = getDB();
  await db.execute('DELETE FROM pricing_plans WHERE id = ?', [id]);
  return true;
}

module.exports = {
  getAllPricing,
  getPricingById,
  createPricing,
  updatePricing,
  deletePricing,
};
