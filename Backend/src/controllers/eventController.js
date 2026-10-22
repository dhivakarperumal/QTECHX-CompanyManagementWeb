const { createEvent: createEventModel, getAllEvents: getAllEventsModel, getEventById: getEventByIdModel, updateEvent: updateEventModel, deleteEvent: deleteEventModel } = require('../models/eventModel');
const { notifySafely, participantIds } = require('../utils/notificationService');

function notifyEventParticipants(req, event, context, previousEvent = null) {
  const isMeeting = [event?.eventType, previousEvent?.eventType]
    .some((eventType) => String(eventType || '').toLowerCase().includes('meeting'));
  const recipients = [
    ...participantIds(event?.participants),
    ...participantIds(previousEvent?.participants),
  ];
  return notifySafely(req, recipients, {
    type: isMeeting ? 'meeting_assigned' : 'calendar_updated',
    title: isMeeting ? 'Meeting scheduled or updated' : 'Office calendar updated',
    message: isMeeting
      ? `${event.title || 'A meeting'} has been scheduled or updated${event.startDate ? ` for ${event.startDate}` : ''}.`
      : `${event.title || 'An office calendar event'} has been added or updated${event.startDate ? ` for ${event.startDate}` : ''}.`,
    link: '/employee/meetings',
    relatedId: event.id,
  }, context);
}

const validateEventPayload = (payload) => {
  const requiredFields = ['title', 'eventType', 'startDate', 'endDate'];
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value.toString().trim() === '';
  });

  if (missingFields.length) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }

  if (payload.id !== undefined && payload.id !== null && payload.id.toString().trim() === '') {
    return 'Event id must not be empty.';
  }

  if (payload._id !== undefined && payload._id !== null && payload._id.toString().trim() === '') {
    return 'Event _id must not be empty.';
  }

  return null;
};

const createEvent = async (req, res) => {
  const validationError = validateEventPayload(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const savedEvent = await createEventModel(req.body);
    await notifyEventParticipants(req, savedEvent, 'office calendar event');
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Event creation failed:', error);
    res.status(500).json({ message: 'Unable to create event. Please try again later.' });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await getAllEventsModel();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await getEventByIdModel(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const previousEvent = await getEventByIdModel(req.params.id);
    if (!previousEvent) return res.status(404).json({ message: 'Event not found' });
    const updatedEvent = await updateEventModel(req.params.id, req.body);
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    await notifyEventParticipants(req, updatedEvent, 'office calendar update', previousEvent);
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const existing = await getEventByIdModel(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Event not found' });
    await deleteEventModel(req.params.id);
    const isMeeting = String(existing.eventType || '').toLowerCase().includes('meeting');
    await notifySafely(req, participantIds(existing.participants), {
      type: isMeeting ? 'meeting_cancelled' : 'calendar_event_cancelled',
      title: isMeeting ? 'Meeting cancelled' : 'Office calendar event cancelled',
      message: `${existing.title || (isMeeting ? 'A meeting' : 'An office calendar event')} has been cancelled.`,
      link: '/employee/meetings',
      relatedId: existing.id,
    }, 'office calendar cancellation');
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
