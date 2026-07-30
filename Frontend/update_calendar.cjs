const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'Admin', 'OfficeCalendar.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Import axios
content = content.replace("import { Toaster, toast } from 'react-hot-toast';", "import { Toaster, toast } from 'react-hot-toast';\nimport axios from 'axios';");

// 2. Update defaultForm
const defaultForm_replacement = `const defaultForm = {
  title: '',
  eventType: 'Meeting',
  description: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '10:00',
  allDay: false,
  priority: 'Medium',
  status: 'Scheduled',
  location: '',
  meetingLink: '',
  project: '',
  color: '',
  reminder: '30 min before',
  participants: [],
  departments: [],
  teams: [],
  externalGuests: false,
  guestEmailAddresses: [],
  attendanceRequired: true,
  organizerName: '',
  organizerDepartment: '',
  createdBy: '',
  organizerContactNumber: '',
  organizerEmail: '',
  attachments: [],
  notes: '',
};`;
content = content.replace(/const defaultForm = \{[\s\S]*?\};/, defaultForm_replacement);

// 3. Update useEffect and add fetchEvents
const use_effect_replacement = `  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
`;
content = content.replace(/  useEffect\(\(\) => \{[\s\S]*?  \}, \[events\]\);/, use_effect_replacement);

// 4. Update handleSubmit
const handle_submit_replacement = `  const handleSubmit = async (event) => {
    event.preventDefault();
    const required = [formData.title, formData.eventType, formData.startDate, formData.endDate];
    if (required.some((value) => !value)) {
      toast.error('Please complete the required fields before saving.');
      return;
    }

    if (dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
      toast.error('End date cannot be earlier than the start date.');
      return;
    }

    if (!formData.allDay && formData.endTime && formData.startTime && formData.endTime < formData.startTime) {
      toast.error('End time cannot be earlier than the start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        color: formData.color || getEventColor(formData.eventType, formData.color),
        updatedDate: dayjs().format('YYYY-MM-DD'),
      };
      if (mode === 'edit' && selectedEvent) {
        const res = await axios.put(\`http://localhost:5000/api/events/\${selectedEvent._id}\`, payload);
        setEvents((current) => current.map((item) => (item._id === selectedEvent._id ? res.data : item)));
        setSelectedEvent(res.data);
        toast.success('Event updated successfully.');
      } else {
        payload.createdDate = dayjs().format('YYYY-MM-DD');
        const res = await axios.post('http://localhost:5000/api/events', payload);
        setEvents((current) => [res.data, ...current]);
        setSelectedEvent(res.data);
        toast.success('Event created successfully.');
      }
      setShowModal(false);
      setShowDrawer(true);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };`;
content = content.replace(/  const handleSubmit = \(event\) => \{[\s\S]*?  \};/, handle_submit_replacement);

// 5. Update handleDelete
const handle_delete_replacement = `  const handleDelete = async () => {
    if (!selectedEvent) return;
    const confirmed = window.confirm('Delete this event permanently?');
    if (!confirmed) return;
    try {
      await axios.delete(\`http://localhost:5000/api/events/\${selectedEvent._id}\`);
      setEvents((current) => current.filter((event) => event._id !== selectedEvent._id));
      setShowDrawer(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully.');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event.');
    }
  };`;
content = content.replace(/  const handleDelete = \(\) => \{[\s\S]*?  \};/, handle_delete_replacement);

// 6. Update handleDrop
const handle_drop_replacement = `  const handleDrop = async (date) => {
    if (!draggingEventId) return;
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    try {
      const res = await axios.put(\`http://localhost:5000/api/events/\${draggingEventId}\`, { startDate: targetDate, endDate: targetDate });
      setEvents((current) => current.map((event) => event._id === draggingEventId ? res.data : event));
      toast.success('Event date updated.');
    } catch (error) {
      toast.error('Failed to update event date.');
    } finally {
      setDraggingEventId(null);
    }
  };`;
content = content.replace(/  const handleDrop = \(date\) => \{[\s\S]*?  \};/, handle_drop_replacement);

// ID replacements
content = content.replace(/item\.id ===/g, 'item._id ===');
content = content.replace(/event\.id ===/g, 'event._id ===');
content = content.replace(/event\.id !==/g, 'event._id !==');
content = content.replace(/event\.id/g, 'event._id');
content = content.replace(/selectedEvent\?\.id/g, 'selectedEvent?._id');

fs.writeFileSync(filePath, content, 'utf-8');
