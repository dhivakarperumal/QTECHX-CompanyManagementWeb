const { createServiceRequest } = require('../models/serviceRequestModel');

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

module.exports = { submitServiceRequest };
