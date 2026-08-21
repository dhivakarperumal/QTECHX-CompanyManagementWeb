const {
  createContactRequest,
  listContactRequests,
  getContactRequestByUuid,
  updateContactRequestStatus: updateStatusInDb,
  deleteContactRequest: deleteInDb,
} = require('../models/contactRequestModel');

const VALID_STATUSES = ['New', 'Contacted', 'In Progress', 'Resolved', 'Closed'];

async function getContactRequests(req, res) {
  try {
    const requests = await listContactRequests({
      search: String(req.query.search || '').trim(),
      status: String(req.query.status || '').trim(),
    });
    return res.json({ success: true, data: requests });
  } catch (error) {
    console.error('getContactRequests error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load contact requests' });
  }
}

async function getContactRequest(req, res) {
  const { uuid } = req.params;
  try {
    const request = await getContactRequestByUuid(uuid);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Contact request not found' });
    }
    return res.json({ success: true, data: request });
  } catch (error) {
    console.error('getContactRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch contact request' });
  }
}

async function submitContactRequest(req, res) {
  const { name, email, mobile, phone, subject, message } = req.body;

  if (!String(name || '').trim() || !String(email || '').trim() || !String(message || '').trim()) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required',
    });
  }

  try {
    const request = await createContactRequest({
      name: String(name).trim(),
      email: String(email).trim(),
      mobile: mobile || phone || null,
      subject: String(subject || 'General Inquiry').trim(),
      message: String(message).trim(),
      status: 'New',
    });

    return res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully',
      data: request,
    });
  } catch (error) {
    console.error('submitContactRequest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact request',
    });
  }
}

async function updateContactRequestStatus(req, res) {
  const { uuid } = req.params;
  const { status, admin_notes } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  try {
    const updated = await updateStatusInDb(uuid, status, admin_notes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Contact request not found' });
    }
    return res.json({ success: true, message: 'Status updated successfully', data: updated });
  } catch (error) {
    console.error('updateContactRequestStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}

async function deleteContactRequest(req, res) {
  const { uuid } = req.params;
  try {
    const success = await deleteInDb(uuid);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Contact request not found' });
    }
    return res.json({ success: true, message: 'Contact request deleted successfully' });
  } catch (error) {
    console.error('deleteContactRequest error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete contact request' });
  }
}

module.exports = {
  getContactRequests,
  getContactRequest,
  submitContactRequest,
  updateContactRequestStatus,
  deleteContactRequest,
};
