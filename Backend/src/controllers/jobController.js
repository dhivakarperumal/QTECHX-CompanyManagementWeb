const path = require('path');
const jobModel = require('../models/jobModel');

function getUploadedCompanyLogo(req) {
  const file = req.file;
  if (!file) return req.body.company_logo || null;
  const uploadRoot = path.join(__dirname, '../../uploads');
  const relativePath = path.relative(uploadRoot, file.path).split(path.sep).join('/');
  return `/uploads/${relativePath}`;
}

async function listJobs(req, res) {
  try {
    const jobs = await jobModel.getAllJobs();
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch jobs', error: error.message });
  }
}

async function getJob(req, res) {
  try {
    const { id } = req.params;
    const job = await jobModel.getJobById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error('Error fetching job by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch job', error: error.message });
  }
}

async function createJob(req, res) {
  try {
    const actor = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const job = await jobModel.createJob({
      ...req.body,
      company_logo: getUploadedCompanyLogo(req),
      created_by: actor,
      updated_by: actor,
    });
    return res.status(201).json({ success: true, message: 'Job created successfully', data: job });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to create job' });
  }
}

async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const actor = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const job = await jobModel.updateJob(id, {
      ...req.body,
      company_logo: getUploadedCompanyLogo(req),
      updated_by: actor,
    });
    return res.status(200).json({ success: true, message: 'Job updated successfully', data: job });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to update job' });
  }
}

async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    await jobModel.deleteJob(id);
    return res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete job' });
  }
}

module.exports = {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
