const {
  createMyEvent: createMyEventModel,
  getAllMyEvents: getAllMyEventsModel,
  getMyEventById: getMyEventByIdModel,
  updateMyEvent: updateMyEventModel,
  deleteMyEvent: deleteMyEventModel,
} = require('../models/myEventModel');

const attachUploadedDocument = (req, payload) => {
  if (!req.file) {
    return payload;
  }

  const uploadedDocument = {
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/myevents/${req.file.filename}`,
    uploadedAt: new Date().toISOString(),
  };

  const existingAttachments = payload.attachments;
  let attachments = [];

  if (Array.isArray(existingAttachments)) {
    attachments = existingAttachments;
  } else if (typeof existingAttachments === 'string' && existingAttachments.trim()) {
    try {
      const parsed = JSON.parse(existingAttachments);
      if (Array.isArray(parsed)) {
        attachments = parsed;
      } else {
        attachments = [parsed];
      }
    } catch (error) {
      attachments = [];
    }
  }

  attachments = [uploadedDocument, ...attachments];
  payload.attachments = attachments;
  return payload;
};

const normalizeIncomingPayload = (req) => {
  const body = req.body || {};
  const payload = { ...body };

  if (req.file && typeof payload === 'object') {
    const fileFields = ['planTitle', 'description', 'planDate', 'startTime', 'endTime', 'estimatedDuration', 'category', 'priority', 'status', 'project', 'module', 'task', 'dailyGoal', 'expectedOutcome', 'checklistItems', 'reminderDate', 'reminderTime', 'location', 'meetingLink', 'notes', 'tags', 'progress', 'plannedHours', 'workedHours', 'breakStartTime', 'breakEndTime', 'energyLevel', 'todaysAchievement', 'challenges', 'tomorrowsPlan'];
    fileFields.forEach((field) => {
      if (payload[field] === undefined && req.body?.[field] === undefined) {
        payload[field] = '';
      }
    });
  }

  if (payload.planTitle === undefined || payload.planTitle === null) payload.planTitle = '';
  if (payload.planDate === undefined || payload.planDate === null) payload.planDate = '';
  if (payload.startTime === undefined || payload.startTime === null) payload.startTime = '';
  if (payload.endTime === undefined || payload.endTime === null) payload.endTime = '';

  if (typeof payload.checklistItems === 'string' && payload.checklistItems.trim()) {
    try {
      payload.checklistItems = JSON.parse(payload.checklistItems);
    } catch (error) {
      payload.checklistItems = payload.checklistItems.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  if (typeof payload.tags === 'string' && payload.tags.trim()) {
    try {
      payload.tags = JSON.parse(payload.tags);
    } catch (error) {
      payload.tags = payload.tags.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  if (payload.checklistItems === undefined || payload.checklistItems === null || payload.checklistItems === '') {
    payload.checklistItems = [];
  }
  if (payload.tags === undefined || payload.tags === null || payload.tags === '') {
    payload.tags = [];
  }
  if (payload.attachments === undefined || payload.attachments === null || payload.attachments === '') {
    payload.attachments = [];
  }

  return payload;
};

const validateMyEventPayload = (payload) => {
  const requiredFields = ['planTitle', 'planDate', 'startTime', 'endTime'];
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    if (value === undefined || value === null) return true;
    if (typeof value === 'string') return value.trim() === '';
    return false;
  });

  if (missingFields.length) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  return null;
};

const createMyEvent = async (req, res) => {
  const payload = normalizeIncomingPayload(req);
  const validationError = validateMyEventPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const payload = attachUploadedDocument(req, normalizeIncomingPayload(req));
    const savedEvent = await createMyEventModel(payload);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('MyEvent creation failed:', error);
    res.status(500).json({
      message: 'Unable to create plan. Please try again later.',
      error: error.message,
    });
  }
};

const getAllMyEvents = async (req, res) => {
  try {
    const events = await getAllMyEventsModel();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan events', error: error.message });
  }
};

const getMyEventById = async (req, res) => {
  try {
    const event = await getMyEventByIdModel(req.params.id);
    if (!event) return res.status(404).json({ message: 'Plan event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plan event', error: error.message });
  }
};

const updateMyEvent = async (req, res) => {
  try {
    const payload = attachUploadedDocument(req, normalizeIncomingPayload(req));
    const updatedEvent = await updateMyEventModel(req.params.id, payload);
    if (!updatedEvent) return res.status(404).json({ message: 'Plan event not found' });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan event', error: error.message });
  }
};

const deleteMyEvent = async (req, res) => {
  try {
    const existing = await getMyEventByIdModel(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Plan event not found' });
    await deleteMyEventModel(req.params.id);
    res.status(200).json({ message: 'Plan event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting plan event', error: error.message });
  }
};

module.exports = {
  createMyEvent,
  getAllMyEvents,
  getMyEventById,
  updateMyEvent,
  deleteMyEvent,
};
