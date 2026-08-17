const { getDB } = require('../config/db');

function jsonValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'object' ? parsed : trimmed;
    } catch {
      return trimmed;
    }
  }
  if (Array.isArray(value) || typeof value === 'object') {
    return value;
  }
  return value;
}

function normalizeServiceRow(row) {
  if (!row) return null;

  const normalized = { ...row };
  const jsonFields = [
    'singlepageimage',
    'what_we_offer',
    'key_features',
    'why_choose_us',
    'technologies_we_use',
    'service_process',
    'industries',
    'project_type',
    'pricing',
    'duration',
    'seo',
  ];

  jsonFields.forEach((field) => {
    const value = normalized[field];
    if (value === null || value === undefined) {
      normalized[field] = field === 'why_choose_us' || field === 'pricing' || field === 'duration' || field === 'seo' ? {} : [];
      return;
    }

    if (typeof value === 'string') {
      try {
        normalized[field] = JSON.parse(value);
      } catch {
        normalized[field] = field === 'why_choose_us' || field === 'pricing' || field === 'duration' || field === 'seo' ? {} : [];
      }
    }
  });

  normalized.featured = Number(normalized.featured) === 1;
  return normalized;
}

async function getAllServices() {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM services ORDER BY display_order ASC, id DESC');
  return rows.map(normalizeServiceRow);
}

async function getServiceById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM services WHERE id = ? LIMIT 1', [id]);
  return normalizeServiceRow(rows[0] || null);
}

async function getServiceByCode(serviceCode) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM services WHERE service_code = ? LIMIT 1', [serviceCode]);
  return normalizeServiceRow(rows[0] || null);
}

async function createService(data) {
  const db = getDB();
  const payload = {
    service_code: data.service_code || null,
    icon: data.icon || null,
    icon1: data.icon1 || null,
    image: data.image || null,
    singlepageimage: jsonValue(data.singlepageimage) || [],
    title: data.title || null,
    category: data.category || null,
    subcategory: data.subcategory || null,
    tagline: data.tagline || null,
    short_description: data.short_description || null,
    description: data.description || null,
    detailed_description: data.detailed_description || null,
    what_we_offer: jsonValue(data.what_we_offer) || [],
    key_features: jsonValue(data.key_features) || [],
    why_choose_us: jsonValue(data.why_choose_us) || {},
    technologies_we_use: jsonValue(data.technologies_we_use) || [],
    service_process: jsonValue(data.service_process) || [],
    industries: jsonValue(data.industries) || [],
    project_type: jsonValue(data.project_type) || [],
    pricing: jsonValue(data.pricing) || {},
    duration: jsonValue(data.duration) || {},
    cta_button: data.cta_button || 'Get in Touch',
    cta_link: data.cta_link || '/contact',
    seo: jsonValue(data.seo) || {},
    status: data.status || 'active',
    featured: Number(Boolean(data.featured)),
    display_order: Number(data.display_order || 0),
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  };

  if (!payload.service_code) {
    throw new Error('Service code is required');
  }
  if (!payload.title) {
    throw new Error('Service title is required');
  }

  const [existing] = await db.execute('SELECT id FROM services WHERE service_code = ? LIMIT 1', [payload.service_code]);
  if (existing.length) {
    throw new Error('Service code already exists');
  }

  const fields = Object.keys(payload);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map(() => '?').join(', ');

  await db.execute(`INSERT INTO services (${fields.join(', ')}) VALUES (${placeholders})`, values);

  const [rows] = await db.execute('SELECT * FROM services WHERE service_code = ? ORDER BY id DESC LIMIT 1', [payload.service_code]);
  return normalizeServiceRow(rows[0] || null);
}

async function updateService(id, data) {
  const db = getDB();
  const updates = {
    service_code: data.service_code,
    icon: data.icon,
    icon1: data.icon1,
    image: data.image,
    singlepageimage: jsonValue(data.singlepageimage),
    title: data.title,
    category: data.category,
    subcategory: data.subcategory,
    tagline: data.tagline,
    short_description: data.short_description,
    description: data.description,
    detailed_description: data.detailed_description,
    what_we_offer: jsonValue(data.what_we_offer),
    key_features: jsonValue(data.key_features),
    why_choose_us: jsonValue(data.why_choose_us),
    technologies_we_use: jsonValue(data.technologies_we_use),
    service_process: jsonValue(data.service_process),
    industries: jsonValue(data.industries),
    project_type: jsonValue(data.project_type),
    pricing: jsonValue(data.pricing),
    duration: jsonValue(data.duration),
    cta_button: data.cta_button,
    cta_link: data.cta_link,
    seo: jsonValue(data.seo),
    status: data.status,
    featured: data.featured !== undefined ? Number(Boolean(data.featured)) : undefined,
    display_order: data.display_order !== undefined ? Number(data.display_order) : undefined,
    updated_by: data.updated_by || null,
  };

  const fields = Object.keys(updates).filter((key) => updates[key] !== undefined && updates[key] !== null);
  if (!fields.length) return getServiceById(id);

  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => updates[field]);
  values.push(id);

  await db.execute(`UPDATE services SET ${assignments} WHERE id = ?`, values);
  return getServiceById(id);
}

async function deleteService(id) {
  const db = getDB();
  await db.execute('DELETE FROM services WHERE id = ?', [id]);
  return true;
}

module.exports = {
  getAllServices,
  getServiceById,
  getServiceByCode,
  createService,
  updateService,
  deleteService,
};
