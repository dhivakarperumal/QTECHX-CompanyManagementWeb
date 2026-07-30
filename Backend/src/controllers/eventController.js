const { createEvent: createEventModel, getAllEvents: getAllEventsModel, getEventById: getEventByIdModel, updateEvent: updateEventModel, deleteEvent: deleteEventModel } = require('../models/eventModel');

const createEvent = async (req, res) => {
  try {
    const savedEvent = await createEventModel(req.body);
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
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
    const updatedEvent = await updateEventModel(req.params.id, req.body);
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
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
