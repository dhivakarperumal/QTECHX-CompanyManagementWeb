const { createServiceRequest, listServiceRequests } = require('../models/serviceRequestModel');

async function getServiceRequests(req, res) {
  try {
    const requests = await listServiceRequests({
      search: String(req.query.search || '').trim(),
      status: String(req.query.status || '').trim(),
    });
    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error('getServiceRequests:', error);
    return res.status(500).json({ success: false, message: 'Failed to load service requests' });
  }
}

async function submitServiceRequest(req, res) {
  const { service_id, service_title, name, email, phone, message } = req.body;

  if (!service_title || !String(name || '').trim() || !String(email || '').trim()) {
    return res.status(400).json({
      success: false,
      message: 'Service, name, and email are required',
    });
  }

  try {
    const request = await createServiceRequest({
      service_id: Number.isInteger(Number(service_id)) ? Number(service_id) : null,
      service_title: String(service_title).trim(),
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      message: String(message || '').trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Service request submitted successfully',
      data: request,
    });
  } catch (error) {
    console.error('submitServiceRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit service request',
    });
  }
}

async function updateServiceRequestStatus(req, res) {
  const { uuid } = req.params;
  const { status } = req.body;
  const VALID = ['New', 'Contacted', 'Converted', 'Closed'];
  if (!status || !VALID.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${VALID.join(', ')}` });
  }
  try {
    const db = require('../config/db').getDB();
    const [result] = await db.execute(
      'UPDATE service_requests SET status = ? WHERE uuid = ?',
      [status, uuid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    const [rows] = await db.execute('SELECT * FROM service_requests WHERE uuid = ? LIMIT 1', [uuid]);
    return res.json({ success: true, message: 'Status updated', data: rows[0] });
  } catch (error) {
    console.error('updateServiceRequestStatus:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}

async function deleteServiceRequest(req, res) {
  const { uuid } = req.params;
  try {
    const db = require('../config/db').getDB();
    const [result] = await db.execute('DELETE FROM service_requests WHERE uuid = ?', [uuid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    return res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    console.error('deleteServiceRequest:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete request' });
  }
}

module.exports = { getServiceRequests, submitServiceRequest, updateServiceRequestStatus, deleteServiceRequest };
