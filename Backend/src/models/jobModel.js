const { getDB } = require('../config/db');

function parseJsonValue(value, fallback = []) {
  if (value === undefined || value === null) return fallback;
  if (Array.isArray(value) || typeof value === 'object') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function normalizeJobRow(row) {
  if (!row) return null;

  const normalized = { ...row };
  const jsonFields = [
    'required_skills',
    'preferred_skills',
    'technical_skills',
    'soft_skills',
    'languages_required',
    'benefits',
    'working_days',
    'required_documents',
    'screening_questions',
    'seo_keywords',
  ];

  jsonFields.forEach((field) => {
    const value = normalized[field];
    if (value === null || value === undefined) {
      normalized[field] = Array.isArray(normalized[field]) ? normalized[field] : [];
      return;
    }

    if (typeof value === 'string') {
      try {
        normalized[field] = JSON.parse(value);
      } catch {
        normalized[field] = [];
      }
    }
  });

  normalized.featured_job = normalized.featured_job === 'Yes' || normalized.featured_job === 1 || normalized.featured_job === true ? 'Yes' : 'No';
  normalized.urgent_hiring = normalized.urgent_hiring === 'Yes' || normalized.urgent_hiring === 1 || normalized.urgent_hiring === true ? 'Yes' : 'No';
  normalized.salary_negotiable = normalized.salary_negotiable === 'Yes' || normalized.salary_negotiable === 1 || normalized.salary_negotiable === true ? 'Yes' : 'No';
  normalized.resume_required = normalized.resume_required === 'Yes' || normalized.resume_required === 1 || normalized.resume_required === true ? 'Yes' : 'No';
  normalized.cover_letter_required = normalized.cover_letter_required === 'Yes' || normalized.cover_letter_required === 1 || normalized.cover_letter_required === true ? 'Yes' : 'No';
  normalized.allow_applications = normalized.allow_applications === 'Yes' || normalized.allow_applications === 1 || normalized.allow_applications === true ? 'Yes' : 'No';
  normalized.social_sharing = normalized.social_sharing === 'Yes' || normalized.social_sharing === 1 || normalized.social_sharing === true ? 'Yes' : 'No';
  normalized.auto_expire = normalized.auto_expire === 'Yes' || normalized.auto_expire === 1 || normalized.auto_expire === true ? 'Yes' : 'No';
  normalized.willing_to_relocate = normalized.willing_to_relocate === 'Yes' || normalized.willing_to_relocate === 1 || normalized.willing_to_relocate === true ? 'Yes' : 'No';
  normalized.travel_required = normalized.travel_required === 'Yes' || normalized.travel_required === 1 || normalized.travel_required === true ? 'Yes' : 'No';
  normalized.immediate_joiner = normalized.immediate_joiner === 'Yes' || normalized.immediate_joiner === 1 || normalized.immediate_joiner === true ? 'Yes' : 'No';

  return normalized;
}

function sanitizeArray(value, fallback = []) {
  const parsed = parseJsonValue(value, fallback);
  if (Array.isArray(parsed)) return parsed;
  return fallback;
}

async function getAllJobs() {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM job_posts ORDER BY created_at DESC, id DESC');
  return rows.map(normalizeJobRow);
}

async function getJobById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM job_posts WHERE id = ? LIMIT 1', [id]);
  return normalizeJobRow(rows[0] || null);
}

async function createJob(data) {
  const db = getDB();
  const payload = {
    job_title: data.job_title || null,
    job_id: data.job_id || null,
    job_code: data.job_code || null,
    job_category: data.job_category || null,
    job_subcategory: data.job_subcategory || null,
    department: data.department || null,
    employment_type: data.employment_type || null,
    job_level: data.job_level || null,
    vacancies: data.vacancies !== undefined && data.vacancies !== null ? Number(data.vacancies) : null,
    company_name: data.company_name || null,
    company_logo: data.company_logo || null,
    company_description: data.company_description || null,
    company_website: data.company_website || null,
    industry: data.industry || null,
    company_email: data.company_email || null,
    company_phone: data.company_phone || null,
    country: data.country || null,
    state: data.state || null,
    city: data.city || null,
    area: data.area || null,
    full_address: data.full_address || null,
    pincode: data.pincode || null,
    work_mode: data.work_mode || null,
    willing_to_relocate: data.willing_to_relocate || 'No',
    travel_required: data.travel_required || 'No',
    short_description: data.short_description || null,
    full_job_description: data.full_job_description || null,
    key_responsibilities: data.key_responsibilities || null,
    daily_duties: data.daily_duties || null,
    required_qualifications: data.required_qualifications || null,
    preferred_qualifications: data.preferred_qualifications || null,
    required_skills: sanitizeArray(data.required_skills, []),
    preferred_skills: sanitizeArray(data.preferred_skills, []),
    technical_skills: sanitizeArray(data.technical_skills, []),
    soft_skills: sanitizeArray(data.soft_skills, []),
    education: data.education || null,
    minimum_experience: data.minimum_experience || null,
    maximum_experience: data.maximum_experience || null,
    certifications: data.certifications || null,
    languages_required: sanitizeArray(data.languages_required, []),
    salary_type: data.salary_type || null,
    minimum_salary: data.minimum_salary !== undefined && data.minimum_salary !== null && data.minimum_salary !== '' ? Number(data.minimum_salary) : null,
    maximum_salary: data.maximum_salary !== undefined && data.maximum_salary !== null && data.maximum_salary !== '' ? Number(data.maximum_salary) : null,
    currency: data.currency || null,
    salary_negotiable: data.salary_negotiable || 'No',
    performance_bonus: data.performance_bonus || null,
    joining_bonus: data.joining_bonus || null,
    benefits: sanitizeArray(data.benefits, []),
    other_compensation: data.other_compensation || null,
    working_days: sanitizeArray(data.working_days, []),
    working_hours: data.working_hours || null,
    shift_type: data.shift_type || null,
    shift_start_time: data.shift_start_time || null,
    shift_end_time: data.shift_end_time || null,
    weekly_off: data.weekly_off || null,
    probation_period: data.probation_period || null,
    notice_period_required: data.notice_period_required || null,
    expected_joining_date: data.expected_joining_date || null,
    immediate_joiner: data.immediate_joiner || 'No',
    application_start_date: data.application_start_date || null,
    application_deadline: data.application_deadline || null,
    application_email: data.application_email || null,
    application_phone: data.application_phone || null,
    application_url: data.application_url || null,
    resume_required: data.resume_required || 'No',
    cover_letter_required: data.cover_letter_required || 'No',
    required_documents: sanitizeArray(data.required_documents, []),
    application_instructions: data.application_instructions || null,
    hiring_contact_person: data.hiring_contact_person || null,
    screening_questions: parseJsonValue(data.screening_questions, []),
    job_status: data.job_status || 'Draft',
    visibility: data.visibility || 'Public',
    featured_job: data.featured_job || 'No',
    urgent_hiring: data.urgent_hiring || 'No',
    allow_applications: data.allow_applications || 'Yes',
    auto_expire: data.auto_expire || 'No',
    publish_date: data.publish_date || null,
    expiry_date: data.expiry_date || null,
    url_slug: data.url_slug || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    seo_keywords: sanitizeArray(data.seo_keywords, []),
    social_share_image: data.social_share_image || null,
    social_sharing: data.social_sharing || 'Yes',
    total_applications: data.total_applications !== undefined && data.total_applications !== null ? Number(data.total_applications) : 0,
    new_applications: data.new_applications !== undefined && data.new_applications !== null ? Number(data.new_applications) : 0,
    shortlisted: data.shortlisted !== undefined && data.shortlisted !== null ? Number(data.shortlisted) : 0,
    interview_scheduled: data.interview_scheduled !== undefined && data.interview_scheduled !== null ? Number(data.interview_scheduled) : 0,
    interview_completed: data.interview_completed !== undefined && data.interview_completed !== null ? Number(data.interview_completed) : 0,
    selected: data.selected !== undefined && data.selected !== null ? Number(data.selected) : 0,
    rejected: data.rejected !== undefined && data.rejected !== null ? Number(data.rejected) : 0,
    hired: data.hired !== undefined && data.hired !== null ? Number(data.hired) : 0,
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
    published_at: data.published_at || null,
    closed_at: data.closed_at || null,
    view_count: data.view_count !== undefined && data.view_count !== null ? Number(data.view_count) : 0,
    application_count: data.application_count !== undefined && data.application_count !== null ? Number(data.application_count) : 0,
  };

  if (!payload.job_title) {
    throw new Error('Job title is required');
  }

  const [existing] = await db.execute('SELECT id FROM job_posts WHERE job_title = ? LIMIT 1', [payload.job_title]);
  if (existing.length) {
    throw new Error('Job title already exists');
  }

  const fields = Object.keys(payload);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map(() => '?').join(', ');

  await db.execute(`INSERT INTO job_posts (${fields.join(', ')}) VALUES (${placeholders})`, values);

  const [rows] = await db.execute('SELECT * FROM job_posts WHERE job_title = ? ORDER BY id DESC LIMIT 1', [payload.job_title]);
  return normalizeJobRow(rows[0] || null);
}

async function updateJob(id, data) {
  const db = getDB();
  const updates = {
    job_title: data.job_title,
    job_id: data.job_id,
    job_code: data.job_code,
    job_category: data.job_category,
    job_subcategory: data.job_subcategory,
    department: data.department,
    employment_type: data.employment_type,
    job_level: data.job_level,
    vacancies: data.vacancies !== undefined && data.vacancies !== null ? Number(data.vacancies) : undefined,
    company_name: data.company_name,
    company_logo: data.company_logo,
    company_description: data.company_description,
    company_website: data.company_website,
    industry: data.industry,
    company_email: data.company_email,
    company_phone: data.company_phone,
    country: data.country,
    state: data.state,
    city: data.city,
    area: data.area,
    full_address: data.full_address,
    pincode: data.pincode,
    work_mode: data.work_mode,
    willing_to_relocate: data.willing_to_relocate,
    travel_required: data.travel_required,
    short_description: data.short_description,
    full_job_description: data.full_job_description,
    key_responsibilities: data.key_responsibilities,
    daily_duties: data.daily_duties,
    required_qualifications: data.required_qualifications,
    preferred_qualifications: data.preferred_qualifications,
    required_skills: data.required_skills !== undefined ? sanitizeArray(data.required_skills, []) : undefined,
    preferred_skills: data.preferred_skills !== undefined ? sanitizeArray(data.preferred_skills, []) : undefined,
    technical_skills: data.technical_skills !== undefined ? sanitizeArray(data.technical_skills, []) : undefined,
    soft_skills: data.soft_skills !== undefined ? sanitizeArray(data.soft_skills, []) : undefined,
    education: data.education,
    minimum_experience: data.minimum_experience,
    maximum_experience: data.maximum_experience,
    certifications: data.certifications,
    languages_required: data.languages_required !== undefined ? sanitizeArray(data.languages_required, []) : undefined,
    salary_type: data.salary_type,
    minimum_salary: data.minimum_salary !== undefined && data.minimum_salary !== null && data.minimum_salary !== '' ? Number(data.minimum_salary) : undefined,
    maximum_salary: data.maximum_salary !== undefined && data.maximum_salary !== null && data.maximum_salary !== '' ? Number(data.maximum_salary) : undefined,
    currency: data.currency,
    salary_negotiable: data.salary_negotiable,
    performance_bonus: data.performance_bonus,
    joining_bonus: data.joining_bonus,
    benefits: data.benefits !== undefined ? sanitizeArray(data.benefits, []) : undefined,
    other_compensation: data.other_compensation,
    working_days: data.working_days !== undefined ? sanitizeArray(data.working_days, []) : undefined,
    working_hours: data.working_hours,
    shift_type: data.shift_type,
    shift_start_time: data.shift_start_time,
    shift_end_time: data.shift_end_time,
    weekly_off: data.weekly_off,
    probation_period: data.probation_period,
    notice_period_required: data.notice_period_required,
    expected_joining_date: data.expected_joining_date,
    immediate_joiner: data.immediate_joiner,
    application_start_date: data.application_start_date,
    application_deadline: data.application_deadline,
    application_email: data.application_email,
    application_phone: data.application_phone,
    application_url: data.application_url,
    resume_required: data.resume_required,
    cover_letter_required: data.cover_letter_required,
    required_documents: data.required_documents !== undefined ? sanitizeArray(data.required_documents, []) : undefined,
    application_instructions: data.application_instructions,
    hiring_contact_person: data.hiring_contact_person,
    screening_questions: data.screening_questions !== undefined ? parseJsonValue(data.screening_questions, []) : undefined,
    job_status: data.job_status,
    visibility: data.visibility,
    featured_job: data.featured_job,
    urgent_hiring: data.urgent_hiring,
    allow_applications: data.allow_applications,
    auto_expire: data.auto_expire,
    publish_date: data.publish_date,
    expiry_date: data.expiry_date,
    url_slug: data.url_slug,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    seo_keywords: data.seo_keywords !== undefined ? sanitizeArray(data.seo_keywords, []) : undefined,
    social_share_image: data.social_share_image,
    social_sharing: data.social_sharing,
    total_applications: data.total_applications !== undefined && data.total_applications !== null ? Number(data.total_applications) : undefined,
    new_applications: data.new_applications !== undefined && data.new_applications !== null ? Number(data.new_applications) : undefined,
    shortlisted: data.shortlisted !== undefined && data.shortlisted !== null ? Number(data.shortlisted) : undefined,
    interview_scheduled: data.interview_scheduled !== undefined && data.interview_scheduled !== null ? Number(data.interview_scheduled) : undefined,
    interview_completed: data.interview_completed !== undefined && data.interview_completed !== null ? Number(data.interview_completed) : undefined,
    selected: data.selected !== undefined && data.selected !== null ? Number(data.selected) : undefined,
    rejected: data.rejected !== undefined && data.rejected !== null ? Number(data.rejected) : undefined,
    hired: data.hired !== undefined && data.hired !== null ? Number(data.hired) : undefined,
    updated_by: data.updated_by || null,
    published_at: data.published_at,
    closed_at: data.closed_at,
    view_count: data.view_count !== undefined && data.view_count !== null ? Number(data.view_count) : undefined,
    application_count: data.application_count !== undefined && data.application_count !== null ? Number(data.application_count) : undefined,
  };

  const fields = Object.keys(updates).filter((key) => updates[key] !== undefined && updates[key] !== null);
  if (!fields.length) return getJobById(id);

  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => updates[field]);
  values.push(id);

  await db.execute(`UPDATE job_posts SET ${assignments} WHERE id = ?`, values);
  return getJobById(id);
}

async function deleteJob(id) {
  const db = getDB();
  await db.execute('DELETE FROM job_posts WHERE id = ?', [id]);
  return true;
}

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
