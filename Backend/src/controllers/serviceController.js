const serviceModel = require('../models/serviceModel');
const path = require('path');

function getUploadedFiles(req) {
  const uploadedFiles = {};
  const uploadRoot = path.join(__dirname, '../../uploads');
  const getFilePath = (file) => {
    const relativePath = path.relative(uploadRoot, file.path).split(path.sep).join('/');
    return `/uploads/${relativePath}`;
  };

  // Handle icon (single file)
  if (req.files?.icon?.[0]) {
    uploadedFiles.icon = getFilePath(req.files.icon[0]);
  }

  // Handle icon1 (single file)
  if (req.files?.icon1?.[0]) {
    uploadedFiles.icon1 = getFilePath(req.files.icon1[0]);
  }

  // Handle singlepageimage (multiple files)
  if (req.files?.singlepageimage?.length) {
    uploadedFiles.singlepageimage = req.files.singlepageimage.map((file) =>
      getFilePath(file)
    );
  }

  return uploadedFiles;
}

async function listServices(req, res) {
  try {
    const services = await serviceModel.getAllServices();
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services', error: error.message });
  }
}

async function getService(req, res) {
  try {
    const { id } = req.params;
    const service = await serviceModel.getServiceById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.status(200).json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch service', error: error.message });
  }
}

async function createService(req, res) {
  try {
    const uploadedFiles = getUploadedFiles(req);
    const service = await serviceModel.createService({
      ...req.body,
      ...uploadedFiles,
      singlepageimage: uploadedFiles.singlepageimage || (req.body.singlepageimage || []),
      created_by: req.user?.employee_id || req.user?.id || req.user?.user_id || 1,
      updated_by: req.user?.employee_id || req.user?.id || req.user?.user_id || 1,
    });
    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create service' });
  }
}

async function updateService(req, res) {
  try {
    const { id } = req.params;
    const uploadedFiles = getUploadedFiles(req);
    const service = await serviceModel.updateService(id, {
      ...req.body,
      ...uploadedFiles,
      singlepageimage: uploadedFiles.singlepageimage || (req.body.singlepageimage || []),
      updated_by: req.user?.employee_id || req.user?.id || req.user?.user_id || 1,
    });
    res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update service' });
  }
}

async function deleteService(req, res) {
  try {
    const { id } = req.params;
    await serviceModel.deleteService(id);
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to delete service' });
  }
}

module.exports = {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
};
