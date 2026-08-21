import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import api from '../api';
import Select from 'react-select';
import OfficeCalendarViewModal from './OfficeCalendarViewModal.jsx';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Sparkles,
  Users,
  Briefcase,
  MapPin,
  Clock3,
  Paperclip,
  Pencil,
  Trash2,
  X,
  BellRing,
  CalendarRange,
  Eye,
  Loader2,
  Building2,
  Plane,
  Gift,
  HeartHandshake,
  GraduationCap,
  ClipboardList,
  CircleAlert,
  CheckSquare,
  Bell,
  ChevronDown,
  Search,
} from 'lucide-react';

const EVENT_TYPES = [
  'Meeting', 'Holiday', 'Office Event', 'Project Deadline', 'Interview'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];
const REMINDERS = ['At time of event', '10 min before', '30 min before', '1 hour before', '1 day before'];

const EVENT_TYPE_META = {
  Meeting: { dot: 'bg-red-500', light: '#ef4444' },
  Holiday: { dot: 'bg-green-500', light: '#22c55e' },
  Leave: { dot: 'bg-violet-500', light: '#8b5cf6' },
  Birthday: { dot: 'bg-pink-500', light: '#ec4899' },
  Anniversary: { dot: 'bg-fuchsia-500', light: '#d946ef' },
  'Client Meeting': { dot: 'bg-indigo-500', light: '#6366f1' },
  Training: { dot: 'bg-emerald-500', light: '#10b981' },
  'Office Event': { dot: 'bg-blue-900', light: '#1e3a8a' },
  'Project Deadline': { dot: 'bg-purple-500', light: '#a855f7' },
  Reminder: { dot: 'bg-orange-400', light: '#f97316' },
  Interview: { dot: 'bg-yellow-500', light: '#eab308' },
  Other: { dot: 'bg-slate-400', light: '#64748b' },
};

const EVENT_TYPE_COLORS = {
  Meeting: '#ef4444', Holiday: '#22c55e', Leave: '#8b5cf6',
  Birthday: '#ec4899', Anniversary: '#d946ef', 'Client Meeting': '#6366f1',
  Training: '#10b981', 'Office Event': '#1e3a8a', 'Project Deadline': '#a855f7',
  Reminder: '#f97316', Interview: '#eab308', Other: '#64748b',
};

const EVENT_TYPE_ICON = {
  Meeting: Briefcase, Holiday: Plane, Leave: HeartHandshake,
  Birthday: Gift, Anniversary: Sparkles, 'Client Meeting': Building2,
  Training: GraduationCap, 'Office Event': CalendarRange,
  'Project Deadline': ClipboardList, Reminder: BellRing,
  Interview: Users, Other: CircleAlert,
};

const QUICK_ACTIONS = [
  { label: 'Add Event', icon: Plus, color: 'text-indigo-400 bg-indigo-500/10' },
  { label: 'Add Meeting', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
  { label: 'Add Task', icon: CheckSquare, color: 'text-green-400 bg-green-500/10' },
  { label: 'Add Reminder', icon: Bell, color: 'text-amber-400 bg-amber-500/10' },
];

const LEGEND = [
  { label: 'Meeting', color: '#ef4444' },
  { label: 'Holiday', color: '#22c55e' },
  { label: 'Office Event', color: '#1e3a8a' },
  { label: 'Project Deadline', color: '#a855f7' },
  { label: 'Interview', color: '#eab308' },
];

const defaultForm = {
  title: '', eventType: 'Meeting', description: '',
  startDate: dayjs().format('YYYY-MM-DD'), endDate: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00', endTime: '10:00', allDay: false,
  priority: 'Medium', status: 'Scheduled', location: '', meetingLink: '',
  project: '', color: '', reminder: '30 min before',
  participants: [], departments: [], teams: [],
  externalGuests: false, guestEmailAddresses: [], attendanceRequired: true,
  organizerName: '', organizerDepartment: '', createdBy: '',
  organizerContactNumber: '', organizerEmail: '', attachments: [], notes: '',
  reason: '', meetingPurpose: '', interviewPerson: '',
};

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
      ? '#f97316'
      : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid #f97316',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

const getEventColor = (eventType, customColor) =>
  customColor || EVENT_TYPE_COLORS[eventType] || '#3b82f6';

/* ─────────────────────────────────────── COMPONENT ─────────────────────────────────────── */
const OfficeCalendar = () => {
  const [events, setEvents] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [apiProjects, setApiProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mode, setMode] = useState('create');
  const [formData, setFormData] = useState(defaultForm);
  const [filters, setFilters] = useState({
    eventType: 'all', project: 'all', department: 'all',
    employee: 'all', priority: 'all', status: 'all',
  });
  const [draggingEventId, setDraggingEventId] = useState(null);
  const [resizingEventId, setResizingEventId] = useState(null);
  const [miniCalDate, setMiniCalDate] = useState(dayjs());
  const [showEmpSelector, setShowEmpSelector] = useState(false);

  /* ── data fetching ── */
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setAllEmployees(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) { console.error(e); }
  };

  const fetchApiProjects = async () => {
    try {
      const res = await api.get('/projects?limit=100&page=1');
      setApiProjects(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); fetchEmployees(); fetchApiProjects(); }, []);

  /* ── helpers ── */
  const ensureArrayField = (v) => {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  const getEmployeeFullName = (emp) => {
    if (!emp) return '';
    if (typeof emp === 'string') return emp;
    return emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.employee_code || '';
  };

  const isToday = (date) => dayjs(date).isSame(dayjs(), 'day');

  /* ── derived data ── */
  const birthdayEvents = useMemo(() => {
    const year = currentDate.year();
    return allEmployees.filter(emp => emp.dob).map(emp => {
      const dobDate = dayjs(emp.dob);
      if (!dobDate.isValid()) return null;
      const bdayThisYear = dobDate.year(year).format('YYYY-MM-DD');
      return {
        _id: `bday-${emp.employee_id || emp.id}`,
        title: `${getEmployeeFullName(emp)}'s Birthday`,
        eventType: 'Birthday',
        startDate: bdayThisYear,
        endDate: bdayThisYear,
        allDay: true,
        priority: 'Low',
        status: 'Scheduled',
        isVirtual: true,
        description: `Wish ${getEmployeeFullName(emp)} a happy birthday!`,
        participants: [
          {
            user_id: emp.employee_id || emp.id,
            name: getEmployeeFullName(emp),
            email: emp.personal_email || '',
          }
        ],
      };
    }).filter(Boolean);
  }, [allEmployees, currentDate]);

  const combinedEvents = useMemo(() => [...events, ...birthdayEvents], [events, birthdayEvents]);


  const filteredEvents = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return combinedEvents.filter(ev => {
      const parts = Array.isArray(ev.participants)
        ? ev.participants.map(p => typeof p === 'object' ? p.name : p).filter(Boolean)
        : typeof ev.participants === 'string' && ev.participants
          ? ev.participants.split(',').map(s => s.trim()).filter(Boolean) : [];
      const depts = Array.isArray(ev.departments)
        ? ev.departments.filter(Boolean)
        : typeof ev.departments === 'string' && ev.departments
          ? ev.departments.split(',').map(s => s.trim()).filter(Boolean) : [];
      const hay = [ev.title, ev.description, ev.project, depts[0], parts.join(' ')].filter(Boolean).join(' ');
      return (
        (!search || hay.toLowerCase().includes(search)) &&
        (filters.eventType === 'all' || ev.eventType === filters.eventType) &&
        (filters.project === 'all' || ev.project === filters.project) &&
        (filters.department === 'all' || depts[0] === filters.department) &&
        (filters.employee === 'all' || parts.some(p => p === filters.employee)) &&
        (filters.priority === 'all' || ev.priority === filters.priority) &&
        (filters.status === 'all' || ev.status === filters.status)
      );
    });
  }, [combinedEvents, filters, searchText]);

  const visibleEvents = useMemo(() => {
    const cur = currentDate;
    return filteredEvents.filter(ev => {
      const s = dayjs(ev.startDate).valueOf(), e = dayjs(ev.endDate).valueOf();
      if (viewMode === 'month') {
        const ms = cur.startOf('month').valueOf(), me = cur.endOf('month').valueOf();
        return (s >= ms && s <= me) || (e >= ms && e <= me) || (s < ms && e > me);
      }
      if (viewMode === 'week') {
        const ws = cur.startOf('week').valueOf(), we = cur.endOf('week').valueOf();
        return (s >= ws && s <= we) || (e >= ws && e <= we) || (s < ws && e > we);
      }
      if (viewMode === 'day') {
        const ds = cur.startOf('day').valueOf(), de = cur.endOf('day').valueOf();
        return (s >= ds && s <= de) || (e >= ds && e <= de) || (s < ds && e > de);
      }
      return true;
    });
  }, [filteredEvents, currentDate, viewMode]);

  const monthDays = useMemo(() => {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');
    const days = []; let cur = start;
    while (cur.isBefore(end) || cur.isSame(end)) { days.push(cur); cur = cur.add(1, 'day'); }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    const t = currentDate.format('YYYY-MM-DD');
    return visibleEvents.filter(ev => {
      const s = dayjs(ev.startDate || t).valueOf();
      const e = dayjs(ev.endDate || t).valueOf();
      const d = dayjs(t).startOf('day').valueOf();
      return d >= s && d <= e;
    }).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [visibleEvents, currentDate]);

  const upcomingChronological = useMemo(() =>
    [...combinedEvents].sort((a, b) =>
      dayjs(`${a.startDate} ${a.startTime || '00:00'}`).valueOf() -
      dayjs(`${b.startDate} ${b.startTime || '00:00'}`).valueOf()
    ).slice(0, 10),
    [combinedEvents]);

  const todayEvents = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return combinedEvents.filter(ev => {
      const s = dayjs(ev.startDate).format('YYYY-MM-DD');
      const e = dayjs(ev.endDate).format('YYYY-MM-DD');
      return s <= today && e >= today;
    }).slice(0, 5);
  }, [combinedEvents]);

  const departments = useMemo(() => Array.from(new Set(combinedEvents.flatMap(ev =>
    Array.isArray(ev.departments) ? ev.departments.filter(Boolean)
      : typeof ev.departments === 'string' && ev.departments ? [ev.departments] : []
  ))), [combinedEvents]);

  const projects = useMemo(() => Array.from(new Set(combinedEvents.map(ev => ev.project).filter(Boolean))), [combinedEvents]);
  const employees = useMemo(() => Array.from(new Set(combinedEvents.flatMap(ev =>
    Array.isArray(ev.participants) ? ev.participants.map(p => typeof p === 'object' ? p.name : p).filter(Boolean)
      : typeof ev.participants === 'string' && ev.participants
        ? ev.participants.split(',').map(s => s.trim()).filter(Boolean) : []
  ))), [combinedEvents]);

  const miniCalDays = useMemo(() => {
    const start = miniCalDate.startOf('month').startOf('week');
    const end = miniCalDate.endOf('month').endOf('week');
    const days = []; let cur = start;
    while (cur.isBefore(end) || cur.isSame(end)) { days.push(cur); cur = cur.add(1, 'day'); }
    return days;
  }, [miniCalDate]);

  /* ── actions ── */
  const navigateView = (dir) =>
    setCurrentDate(c => c.add(dir, viewMode === 'month' ? 'month' : viewMode === 'week' ? 'week' : 'day'));

  const openCreateModal = (date = dayjs().format('YYYY-MM-DD')) => {
    setMode('create');
    setSelectedDate(date);
    setFormData({ ...defaultForm, startDate: date, endDate: date });
    setShowModal(true);
  };

  const normalizeEvent = (ev) => ({
    ...ev,
    participants: ensureArrayField(ev?.participants),
    departments: ensureArrayField(ev?.departments),
    teams: ensureArrayField(ev?.teams),
    guestEmailAddresses: ensureArrayField(ev?.guestEmailAddresses),
    attachments: ensureArrayField(ev?.attachments),
    comments: ensureArrayField(ev?.comments),
    activity: ensureArrayField(ev?.activity),
  });

  const openEditModal = (ev) => {
    const n = normalizeEvent(ev);
    setMode('edit'); setSelectedEvent(n); setFormData(n); setShowModal(true);
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(c => ({ ...c, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayInput = (e, field) => {
    const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(c => ({ ...c, [field]: vals }));
  };

  const handleToggleParticipant = (empObj) => {
    setFormData(c => {
      const parts = c.participants || [];
      const empName = getEmployeeFullName(empObj);
      const exists = parts.some(p => typeof p === 'object' ? p.user_id === empObj.employee_id : p === empName);
      if (exists) {
        return { ...c, participants: parts.filter(p => typeof p === 'object' ? p.user_id !== empObj.employee_id : p !== empName) };
      }
      const newParticipant = {
        user_id: empObj.employee_id,
        name: empName,
        email: empObj.email || '',
        phone: empObj.phone_number || empObj.phone || '',
        role: empObj.role || ''
      };
      return { ...c, participants: [...parts, newParticipant] };
    });
  };

  const handleRemoveParticipant = (p) =>
    setFormData(c => ({
      ...c,
      participants: (c.participants || []).filter(x => typeof x === 'object' && typeof p === 'object' ? x.user_id !== p.user_id : x !== p)
    }));

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files || []).map(f => f.name);
    setFormData(c => ({ ...c, attachments: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ([formData.title, formData.eventType, formData.startDate, formData.endDate].some(v => !v)) {
      toast.error('Please complete required fields.'); return;
    }
    if (dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
      toast.error('End date before start date.'); return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        color: formData.color || getEventColor(formData.eventType, formData.color),
        updatedDate: dayjs().format('YYYY-MM-DD'),
      };
      delete payload.id; delete payload._id;
      if (mode === 'edit' && selectedEvent) {
        const id = selectedEvent._id || selectedEvent.id;
        const res = await api.put(`/events/${id}`, payload);
        setEvents(c => c.map(x => x._id === id ? res.data : x));
        setSelectedEvent(res.data);
        toast.success('Event updated.');
      } else {
        payload.createdDate = dayjs().format('YYYY-MM-DD');
        const res = await api.post('/events', payload);
        setEvents(c => [res.data, ...c]);
        setSelectedEvent(res.data);
        toast.success('Event created.');
      }
      setShowModal(false); setShowDrawer(true);
    } catch (err) {
      console.error(err); toast.error('Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm('Delete this event permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${selectedEvent._id}`);
      setEvents(c => c.filter(x => x._id !== selectedEvent._id));
      setShowDrawer(false); setSelectedEvent(null);
      toast.success('Event deleted.');
    } catch (err) {
      console.error(err); toast.error('Failed to delete event.');
    }
  };

  const handleDrop = async (date) => {
    if (!draggingEventId) return;
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    try {
      const res = await axios.put(`http://localhost:5000/api/events/${draggingEventId}`, { startDate: targetDate, endDate: targetDate });
      setEvents(c => c.map(x => x._id === draggingEventId ? res.data : x));
      toast.success('Event moved.');
    } catch { toast.error('Failed to move event.'); }
    finally { setDraggingEventId(null); }
  };

  useEffect(() => {
    if (!resizingEventId) return;
    const onMove = (e) => {
      const t = e.target.closest('[data-day]');
      if (!t) return;
      const next = t.getAttribute('data-date');
      if (!next) return;
      setEvents(c => c.map(x => x._id === resizingEventId && dayjs(next).isAfter(dayjs(x.startDate)) ? { ...x, endDate: next } : x));
    };
    const onUp = () => setResizingEventId(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [resizingEventId]);

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', minHeight: '100vh', background: 'transparent', fontFamily: 'Poppins, sans-serif' }}>
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 60, background: 'rgba(255,255,255,0.05)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ width: 250, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  /* ── RENDER ── */
  return (
    <>
      <style>{`
        .oc * { box-sizing: border-box; }
        .oc {
          font-family: 'Poppins', -apple-system, sans-serif;
          display: flex; gap: 24px; height: 100%; min-height: calc(100vh - 100px);
          background: transparent; color: #fff;
          margin: -1rem; /* Adjusting for padding in the main layout if necessary, assuming it fills the space */
        }

        /* ── Main calendar column ── */
        .oc-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-radius: 1.25rem; }

        /* ── Toolbar ── */
        .oc-toolbar {
          padding: 16px 20px; background: rgba(255, 255, 255, 0.025); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          flex-shrink: 0; backdrop-filter: blur(4px);
        }
        .oc-toolbar-left  { display: flex; align-items: center; gap: 10px; }
        .oc-toolbar-right { display: flex; align-items: center; gap: 8px; }
        .oc-month-title { font-size: 20px; font-weight: 700; color: #fff; }
        .oc-nav-arrow {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255, 255, 255, 0.7); transition: all .15s;
        }
        .oc-nav-arrow:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-today-btn {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 6px 14px;
          font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.7); cursor: pointer;
          font-family: inherit; transition: all .15s;
        }
        .oc-today-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-view-tabs { display: flex; background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 3px; border: 1px solid rgba(255, 255, 255, 0.05); }
        .oc-view-tab {
          border: none; background: none; border-radius: 8px; padding: 5px 14px;
          font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.6); cursor: pointer;
          font-family: inherit; transition: all .15s;
        }
        .oc-view-tab.active { background: #F8740E; color: #fff; font-weight: 600; shadow: 0 4px 10px rgba(248,116,14,0.3); }
        .oc-search {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px;
          padding: 6px 12px; min-width: 200px;
        }
        .oc-search input {
          border: none; background: transparent; outline: none;
          font-size: 13px; color: #fff; width: 100%; font-family: inherit;
        }
        .oc-search input::placeholder { color: rgba(255, 255, 255, 0.3); }
        .oc-filter-toggle {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 6px 12px;
          font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.7); cursor: pointer; font-family: inherit;
          transition: all .15s;
        }
        .oc-filter-toggle:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-filter-toggle.active { background: rgba(248, 116, 14, 0.15); color: #F8740E; border-color: rgba(248, 116, 14, 0.3); }
        .oc-add-btn {
          display: flex; align-items: center; gap: 6px;
          background: #F8740E; color: #fff;
          border: none; border-radius: 8px; padding: 7px 16px;
          font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: opacity .15s; box-shadow: 0 4px 12px rgba(248, 116, 14, 0.3);
        }
        .oc-add-btn:hover { opacity: .9; }

        /* ── Filter bar ── */
        .oc-filter-bar {
          background: rgba(19, 20, 26, 0.8); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 20px; display: flex; gap: 12px; flex-wrap: wrap; backdrop-filter: blur(8px);
        }
        .oc-filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 130px; }
        .oc-filter-lbl { font-size: 10.5px; font-weight: 600; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: .06em; }
        .oc-filter-sel {
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 5px 8px;
          font-size: 12.5px; color: #fff; background: rgba(255, 255, 255, 0.05); outline: none;
          font-family: inherit; cursor: pointer;
        }
        .oc-filter-sel:focus { border-color: #F8740E; }
        .oc-filter-sel option { background: #13141a; color: #fff; }

        /* ── Calendar body ── */
        .oc-body { flex: 1; overflow: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

        /* ── Day headers ── */
        .oc-day-hdrs { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px; }
        .oc-day-hdr {
          text-align: center; font-size: 11.5px; font-weight: 600; color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase; letter-spacing: .06em; padding: 6px 0;
        }
        .oc-day-hdr.rd { color: rgba(244, 63, 94, 0.8); } /* Rose tint for weekends */

        /* ── Month grid ── */
        .oc-month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .oc-day-cell {
          min-height: 110px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px; padding: 8px 6px; cursor: pointer;
          transition: all .15s; position: relative; overflow: hidden;
        }
        .oc-day-cell:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.15); }
        .oc-day-cell.today { border-color: #F8740E; background: rgba(248, 116, 14, 0.05); }
        .oc-day-cell.other-m { background: rgba(0, 0, 0, 0.2); }
        .oc-day-cell.other-m .oc-day-num { color: rgba(255, 255, 255, 0.2); }
        .oc-day-num {
          font-size: 13px; font-weight: 600; color: rgba(255, 255, 255, 0.8);
          display: inline-flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 50%; margin-bottom: 4px;
        }
        .oc-day-num.t { background: #F8740E; color: #fff; box-shadow: 0 0 10px rgba(248,116,14,0.4); }
        .oc-day-num.rd { color: rgba(244, 63, 94, 0.8); }
        .oc-day-count {
          position: absolute; top: 8px; right: 6px;
          background: rgba(248, 116, 14, 0.15); color: #F8740E; font-size: 10px; font-weight: 700;
          border-radius: 20px; padding: 1px 6px;
        }
        .oc-chip {
          display: flex; align-items: center; gap: 4px; padding: 2px 5px;
          border-radius: 5px; margin-bottom: 2px; font-size: 10.5px; font-weight: 500;
          cursor: pointer; overflow: hidden; transition: opacity .1s;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .oc-chip:hover { opacity: .82; border-color: rgba(255,255,255,0.2); }
        .oc-chip-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .oc-chip-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
        .oc-chip-time { font-size: 9.5px; opacity: .72; white-space: nowrap; }
        .oc-more { font-size: 10px; color: rgba(255, 255, 255, 0.5); padding: 0 2px; font-weight: 500; }

        /* ── Agenda ── */
        .oc-agenda { display: flex; flex-direction: column; gap: 8px; }
        .oc-ag-item {
          display: flex; align-items: flex-start; gap: 12px;
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 12px;
          padding: 12px 16px; cursor: pointer;
          transition: all .15s;
        }
        .oc-ag-item:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); }
        .oc-ag-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .oc-ag-meta { flex: 1; min-width: 0; }
        .oc-ag-title { font-size: 14px; font-weight: 600; color: #fff; }
        .oc-ag-desc  { font-size: 12.5px; color: rgba(255, 255, 255, 0.6); margin-top: 2px; }
        .oc-ag-foot  { display: flex; gap: 12px; margin-top: 4px; flex-wrap: wrap; }
        .oc-ag-det   { font-size: 11.5px; color: rgba(255, 255, 255, 0.4); }
        .oc-pri-badge { font-size: 10.5px; font-weight: 600; border-radius: 20px; padding: 2px 10px; white-space: nowrap; align-self: center; }
        .oc-pri-critical { background: rgba(220, 38, 38, 0.15); color: #fca5a5; border: 1px solid rgba(220, 38, 38, 0.3); }
        .oc-pri-high     { background: rgba(217, 119, 6, 0.15); color: #fcd34d; border: 1px solid rgba(217, 119, 6, 0.3); }
        .oc-pri-medium   { background: rgba(22, 163, 74, 0.15); color: #86efac; border: 1px solid rgba(22, 163, 74, 0.3); }
        .oc-pri-low      { background: rgba(100, 116, 139, 0.15); color: #cbd5e1; border: 1px solid rgba(100, 116, 139, 0.3); }

        /* ── Day view ── */
        .oc-day-list { display: flex; flex-direction: column; gap: 8px; }
        .oc-day-row {
          display: flex; gap: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px; padding: 12px 16px; cursor: pointer; transition: all .15s;
        }
        .oc-day-row:hover { background: rgba(255, 255, 255, 0.08); }
        .oc-day-time  { font-size: 12px; font-weight: 600; color: rgba(255, 255, 255, 0.5); min-width: 80px; }
        .oc-day-info  { flex: 1; }
        .oc-day-title { font-size: 14px; font-weight: 600; color: #fff; }
        .oc-day-desc  { font-size: 12px; color: rgba(255, 255, 255, 0.6); margin-top: 2px; }

        /* ── Empty ── */
        .oc-empty {
          text-align: center; padding: 40px 16px; color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .oc-empty p:first-child { font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.6); margin-bottom: 4px; }
        .oc-empty p { font-size: 12.5px; margin: 0; }

        /* ── Legend ── */
        .oc-legend { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; padding: 4px 0; }
        .oc-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: rgba(255, 255, 255, 0.6); font-weight: 500; }
        .oc-legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ── Type badge (inline) ── */
        .oc-type-badge {
          font-size: 10.5px; font-weight: 700; border-radius: 20px;
          padding: 2px 10px; border: 1px solid; text-transform: uppercase; letter-spacing: .06em;
          display: inline-block;
        }

        /* ── Right panel ── */
        .oc-right {
          width: 260px; min-width: 260px; background: rgba(255, 255, 255, 0.02);
          display: flex; flex-direction: column; padding: 20px 16px;
          overflow-y: auto; gap: 24px; flex-shrink: 0; backdrop-filter: blur(4px);
        }
        .oc-right::-webkit-scrollbar { display: none; }
        .oc-right { scrollbar-width: none; -ms-overflow-style: none; }

        /* Mini calendar */
        .oc-mini-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .oc-mini-month { font-size: 13px; font-weight: 700; color: #fff; }
        .oc-mini-nav {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; color: rgba(255, 255, 255, 0.7);
          padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
          transition: all .15s;
        }
        .oc-mini-nav:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-mini-day-hdrs { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-bottom: 3px; }
        .oc-mini-dh { font-size: 10px; font-weight: 600; color: rgba(255, 255, 255, 0.4); }
        .oc-mini-dh.rd { color: rgba(244, 63, 94, 0.8); }
        .oc-mini-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; }
        .oc-mini-d {
          background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 11.5px; font-weight: 500; color: rgba(255, 255, 255, 0.8);
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 1px auto; position: relative; transition: all .1s;
        }
        .oc-mini-d:hover { background: rgba(255, 255, 255, 0.1); }
        .oc-mini-d.other-m { color: rgba(255, 255, 255, 0.2); }
        .oc-mini-d.today-m { background: #F8740E; color: #fff; font-weight: 700; box-shadow: 0 0 10px rgba(248,116,14,0.4); }
        .oc-mini-d.rd-d:not(.today-m) { color: rgba(244, 63, 94, 0.8); }

        /* Section titles */
        .oc-sec-title { font-size: 13.5px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .oc-sec-sub   { font-size: 11px; color: rgba(255, 255, 255, 0.4); margin-bottom: 10px; margin-top: -4px; }

        /* Today events */
        .oc-te-item {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: background .15s;
          border-radius: 8px;
        }
        .oc-te-item:hover { background: rgba(255, 255, 255, 0.05); }
        .oc-te-item:last-child { border-bottom: none; }
        .oc-te-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
        .oc-te-body { flex: 1; min-width: 0; }
        .oc-te-title { font-size: 12.5px; font-weight: 600; color: #fff; }
        .oc-te-time  { font-size: 11px; color: rgba(255, 255, 255, 0.5); margin-top: 1px; }
        .oc-te-loc   { font-size: 11px; color: rgba(255, 255, 255, 0.4); margin-top: 1px; display: flex; align-items: center; gap: 3px; }
        .oc-view-all {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 600; color: #F8740E;
          margin-top: 8px; cursor: pointer; background: none; border: none;
          font-family: inherit; padding: 0;
        }
        .oc-view-all:hover { text-decoration: underline; }

        /* Quick actions */
        .oc-qa-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .oc-qa-btn {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 6px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 12px;
          padding: 12px 8px; cursor: pointer; font-family: inherit;
          transition: all .15s;
        }
        .oc-qa-btn:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); }
        .oc-qa-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .oc-qa-lbl { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.8); text-align: center; }

        /* ── MODAL ── */
        .oc-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .oc-modal {
          background: #13141a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; width: 100%; max-width: 760px;
          max-height: 92vh; overflow-y: auto; padding: 28px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.5); color: #fff;
        }
        .oc-modal::-webkit-scrollbar { display: none; }
        .oc-modal { scrollbar-width: none; -ms-overflow-style: none; }
        .oc-modal-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
        .oc-modal-sub { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
        .oc-modal-ttl { font-size: 20px; font-weight: 700; color: #fff; }
        .oc-modal-close {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255, 255, 255, 0.7); flex-shrink: 0; transition: all .15s;
        }
        .oc-modal-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-form { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
        .oc-full { grid-column: 1 / -1; }
        .oc-flbl { font-size: 12.5px; font-weight: 600; color: rgba(255, 255, 255, 0.8); margin-bottom: 5px; display: block; }
        .oc-finput {
          width: 100%; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px;
          padding: 8px 12px; font-size: 13px; color: #fff;
          outline: none; background: rgba(255, 255, 255, 0.05); font-family: inherit; transition: all .15s;
        }
        .oc-finput:focus { border-color: #F8740E; background: rgba(255, 255, 255, 0.08); }
        .oc-finput::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
        .oc-fsel {
          width: 100%; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px;
          padding: 8px 12px; font-size: 13px; color: #fff;
          outline: none; background: rgba(255, 255, 255, 0.05); font-family: inherit; cursor: pointer; transition: all .15s;
        }
        .oc-fsel:focus { border-color: #F8740E; background: rgba(255, 255, 255, 0.08); }
        .oc-fsel option { background: #13141a; color: #fff; }
        .oc-ftarea {
          width: 100%; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px;
          padding: 8px 12px; font-size: 13px; color: #fff;
          outline: none; background: rgba(255, 255, 255, 0.05); font-family: inherit; resize: vertical; transition: all .15s;
        }
        .oc-ftarea:focus { border-color: #F8740E; background: rgba(255, 255, 255, 0.08); }
        .oc-section-ttl {
          font-size: 13px; font-weight: 700; color: #F8740E;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 7px;
          grid-column: 1 / -1; margin-top: 4px;
        }
        .oc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .oc-c-chip {
          display: flex; align-items: center; gap: 4px;
          background: rgba(248, 116, 14, 0.15); border: 1px solid rgba(248, 116, 14, 0.3);
          border-radius: 20px; padding: 3px 10px; font-size: 12px; color: #F8740E; font-weight: 500;
        }
        .oc-c-chip-rm { background: none; border: none; cursor: pointer; color: rgba(255, 255, 255, 0.5); padding: 0; font-size: 14px; line-height: 1; transition: color .15s;}
        .oc-c-chip-rm:hover { color: #fff; }
        .oc-chk-lbl { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255, 255, 255, 0.8); cursor: pointer; }
        .oc-form-actions { display: flex; justify-content: flex-end; gap: 10px; grid-column: 1 / -1; margin-top: 4px; }
        .oc-btn-cancel {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 8px 20px;
          font-size: 13.5px; font-weight: 600; color: rgba(255, 255, 255, 0.8); cursor: pointer; font-family: inherit; transition: all .15s;
        }
        .oc-btn-cancel:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-btn-save {
          background: #F8740E; border: none; border-radius: 10px;
          padding: 8px 24px; font-size: 13.5px; font-weight: 700; color: #fff;
          cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all .15s;
          box-shadow: 0 4px 15px rgba(248, 116, 14, 0.3);
        }
        .oc-btn-save:disabled { opacity: .65; cursor: not-allowed; }
        .oc-btn-save:hover:not(:disabled) { opacity: .9; box-shadow: 0 6px 20px rgba(248, 116, 14, 0.4); }

        /* ── DRAWER ── */
        .oc-drawer {
          position: fixed; top: 0; bottom: 0; right: 0; z-index: 9998; width: 100%; max-width: 420px;
          background: #13141a; border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; flex-direction: column; padding: 24px; overflow-y: auto;
          box-shadow: -8px 0 32px rgba(0,0,0,0.5); color: #fff;
        }
        .oc-drawer::-webkit-scrollbar { display: none; }
        .oc-drawer { scrollbar-width: none; -ms-overflow-style: none; }
        .oc-drawer-hdr { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
        .oc-drawer-sub { font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 3px; }
        .oc-drawer-ttl { font-size: 18px; font-weight: 700; color: #fff; }
        .oc-dr-close {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255, 255, 255, 0.7); transition: all .15s;
        }
        .oc-dr-close:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .oc-dr-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 14px; padding: 14px; margin-bottom: 12px; }
        .oc-dr-card-ttl { font-size: 11.5px; font-weight: 700; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .oc-dr-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255, 255, 255, 0.8); margin-bottom: 6px; }
        .oc-dr-row:last-child { margin-bottom: 0; }
        .oc-tag { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 3px 10px; font-size: 11.5px; color: rgba(255, 255, 255, 0.8); font-weight: 500; }
        .oc-dr-actions { display: flex; gap: 10px; margin-top: 4px; }
        .oc-btn-edit {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #F8740E; color: #fff; border: none; border-radius: 10px;
          padding: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s;
        }
        .oc-btn-edit:hover { opacity: .9; box-shadow: 0 4px 15px rgba(248, 116, 14, 0.3); }
        .oc-btn-del {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: rgba(220, 38, 38, 0.15); color: #fca5a5; border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 10px;
          padding: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity .15s;
        }
        .oc-btn-del:hover { opacity: .9; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>

      <Toaster position="top-right" toastOptions={{ style: { background: '#13141a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Poppins,sans-serif', borderRadius: '12px', fontSize: '13px' } }} />

      <div className="oc">
        {/* ═══════════════════════ MAIN CALENDAR ═══════════════════════ */}
        <div className="oc-main glass-container">

          {/* Toolbar */}
          <div className="oc-toolbar" style={{ borderRadius: '1.25rem 1.25rem 0 0' }}>
            <div className="oc-toolbar-left">
              <span className="oc-month-title">
                {viewMode === 'day'
                  ? currentDate.format('dddd, MMMM D, YYYY')
                  : viewMode === 'week'
                    ? `${currentDate.startOf('week').format('MMM D')} – ${currentDate.endOf('week').format('MMM D, YYYY')}`
                    : currentDate.format('MMMM YYYY')}
              </span>
              <button className="oc-nav-arrow" onClick={() => navigateView(-1)}><ChevronLeft size={14} /></button>
              <button className="oc-nav-arrow" onClick={() => navigateView(1)}><ChevronRight size={14} /></button>
              <button className="oc-today-btn" onClick={() => setCurrentDate(dayjs())}>Today</button>
            </div>
            <div className="oc-toolbar-right">
              <div className="oc-search">
                <Search size={13} color="rgba(255, 255, 255, 0.5)" />
                <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search events…" />
              </div>
              <div className="oc-view-tabs">
                {['month', 'week', 'day', 'agenda'].map(v => (
                  <button key={v} className={`oc-view-tab${viewMode === v ? ' active' : ''}`} onClick={() => setViewMode(v)}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <button
                className={`oc-filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(f => !f)}
              >
                <Filter size={13} /> Filters
              </button>
              <button className="oc-add-btn" onClick={() => openCreateModal(selectedDate)}>
                <Plus size={14} /> Add Event
              </button>
            </div>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="oc-filter-bar">
              {[
                { key: 'eventType', label: 'Type', opts: EVENT_TYPES.map(t => ({ v: t, l: t })) },
                { key: 'priority', label: 'Priority', opts: PRIORITIES.map(p => ({ v: p, l: p })) },
                { key: 'status', label: 'Status', opts: STATUSES.map(s => ({ v: s, l: s })) },
                { key: 'project', label: 'Project', opts: projects.map(p => ({ v: p, l: p })) },
                { key: 'department', label: 'Department', opts: departments.map(d => ({ v: d, l: d })) },
                { key: 'employee', label: 'Employee', opts: employees.map(e => ({ v: e, l: e })) },
              ].map(({ key, label, opts }) => (
                <div key={key} className="oc-filter-group">
                  <div className="oc-filter-lbl">{label}</div>
                  <Select
                    styles={{
                      ...customSelectStyles,
                      control: (provided, state) => ({ ...provided, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: state.isFocused ? '#F8740E' : 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', minHeight: '32px', boxShadow: 'none' })
                    }}
                    value={{ value: filters[key], label: filters[key] === 'all' ? 'All' : (opts.find(o => o.v === filters[key])?.l || filters[key]) }}
                    onChange={option => setFilters({ ...filters, [key]: option ? option.value : 'all' })}
                    options={[{ value: 'all', label: 'All' }, ...opts.map(o => ({ value: o.v, label: o.l }))]}
                    isSearchable={false}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="oc-body">

            {/* MONTH / WEEK */}
            {(viewMode === 'month' || viewMode === 'week') && (
              <>
                <div className="oc-day-hdrs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                    <div key={d} className={`oc-day-hdr${i === 0 || i === 6 ? ' rd' : ''}`}>{d}</div>
                  ))}
                </div>
                <div className="oc-month-grid">
                  {(viewMode === 'week' ? weekDays : monthDays).map(date => {
                    const dateStr = date.format('YYYY-MM-DD');
                    const dEvs = visibleEvents.filter(ev => {
                      const s = dayjs(ev.startDate).valueOf(), e = dayjs(ev.endDate).valueOf();
                      const d = dayjs(date).startOf('day').valueOf();
                      return d >= s && d <= e;
                    });
                    const isOther = date.month() !== currentDate.month() && viewMode === 'month';
                    const dOW = date.day();
                    const isWE = dOW === 0 || dOW === 6;
                    return (
                      <div
                        key={dateStr}
                        data-day="true" data-date={dateStr}
                        className={`oc-day-cell${isToday(date) ? ' today' : ''}${isOther ? ' other-m' : ''}`}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(dateStr)}
                        onClick={() => { setSelectedDate(dateStr); openCreateModal(dateStr); }}
                      >
                        <span className={`oc-day-num${isToday(date) ? ' t' : ''}${!isToday(date) && isWE && !isOther ? ' rd' : ''}`}>
                          {date.format('D')}
                        </span>
                        {dEvs.length > 0 && <span className="oc-day-count">{dEvs.length}</span>}
                        {dEvs.slice(0, 3).map(ev => {
                          const color = ev.color || (EVENT_TYPE_META[ev.eventType]?.light) || '#3b82f6';
                          // Darken the background color slightly for the chip
                          return (
                            <div
                              key={ev._id || ev.id}
                              className="oc-chip"
                              draggable
                              onDragStart={() => setDraggingEventId(ev._id)}
                              style={{ background: `${color}22`, color, borderColor: `${color}44` }}
                              onClick={e => { e.stopPropagation(); setSelectedEvent(ev); setShowDrawer(true); }}
                            >
                              <span className="oc-chip-dot" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
                              <span className="oc-chip-title">{ev.title}</span>
                              {ev.startTime && (
                                <span className="oc-chip-time">{dayjs(`2000-01-01 ${ev.startTime}`).format('h:mmA')}</span>
                              )}
                            </div>
                          );
                        })}
                        {dEvs.length > 3 && (
                          <div
                            className="oc-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentDate(dayjs(dateStr));
                              setSelectedDate(dateStr);
                              setViewMode('day');
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            +{dEvs.length - 3} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* DAY */}
            {viewMode === 'day' && (
              <div className="oc-day-list">
                {dayEvents.length === 0
                  ? <div className="oc-empty"><p>No events for this day.</p><p>Click any date to add an event.</p></div>
                  : dayEvents.map(ev => {
                    const color = ev.color || EVENT_TYPE_META[ev.eventType]?.light || '#3b82f6';
                    return (
                      <div key={ev._id} className="oc-day-row" style={{ borderLeft: `4px solid ${color}` }}
                        onClick={() => { setSelectedEvent(ev); setShowDrawer(true); }}>
                        <div className="oc-day-time">{ev.allDay ? 'All day' : `${ev.startTime || '--:--'} – ${ev.endTime || '--:--'}`}</div>
                        <div className="oc-day-info">
                          <div className="oc-day-title">{ev.title}</div>
                          <div className="oc-day-desc">{ev.description || 'No description.'}</div>
                        </div>
                        <span className="oc-type-badge" style={{ background: `${color}22`, color, borderColor: `${color}55` }}>
                          {ev.eventType}
                        </span>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* AGENDA */}
            {viewMode === 'agenda' && (
              <div className="oc-agenda">
                {upcomingChronological.length === 0
                  ? <div className="oc-empty"><p>Nothing scheduled yet.</p><p>Create an event to populate the agenda.</p></div>
                  : upcomingChronological.map(ev => {
                    const Icon = EVENT_TYPE_ICON[ev.eventType] || CalendarDays;
                    const color = ev.color || EVENT_TYPE_META[ev.eventType]?.light || '#3b82f6';
                    const priCls = ev.priority === 'Critical' ? 'oc-pri-critical' : ev.priority === 'High' ? 'oc-pri-high' : ev.priority === 'Low' ? 'oc-pri-low' : 'oc-pri-medium';
                    return (
                      <div key={ev._id} className="oc-ag-item" onClick={() => { setSelectedEvent(ev); setShowDrawer(true); }}>
                        <div className="oc-ag-icon" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                          <Icon size={17} color={color} />
                        </div>
                        <div className="oc-ag-meta">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span className="oc-ag-title">{ev.title}</span>
                            <span className="oc-type-badge" style={{ background: `${color}22`, color, borderColor: `${color}55` }}>{ev.eventType}</span>
                          </div>
                          <div className="oc-ag-desc">{ev.description || 'No description.'}</div>
                          <div className="oc-ag-foot">
                            <span className="oc-ag-det">📅 {dayjs(ev.startDate).format('MMM D, YYYY')}</span>
                            {ev.startTime && <span className="oc-ag-det">⏰ {ev.startTime} – {ev.endTime || '—'}</span>}
                            {ev.location && <span className="oc-ag-det">📍 {ev.location}</span>}
                          </div>
                        </div>
                        <span className={`oc-pri-badge ${priCls}`}>{ev.priority}</span>
                      </div>
                    );
                  })
                }
              </div>
            )}

            {/* Legend */}
            <div className="oc-legend">
              {LEGEND.map(({ label, color }) => (
                <div key={label} className="oc-legend-item">
                  <span className="oc-legend-dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════ RIGHT PANEL ═══════════════════════ */}
        <aside className="oc-right glass-container" style={{ borderRadius: '1.25rem' }}>

          {/* Mini Calendar */}
          <div>
            <div className="oc-mini-hdr">
              <button className="oc-mini-nav" onClick={() => setMiniCalDate(d => d.subtract(1, 'month'))}><ChevronLeft size={13} /></button>
              <span className="oc-mini-month">{miniCalDate.format('MMMM YYYY')}</span>
              <button className="oc-mini-nav" onClick={() => setMiniCalDate(d => d.add(1, 'month'))}><ChevronRight size={13} /></button>
            </div>
            <div className="oc-mini-day-hdrs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <div key={d} className={`oc-mini-dh${i === 0 || i === 6 ? ' rd' : ''}`}>{d}</div>
              ))}
            </div>
            <div className="oc-mini-days">
              {miniCalDays.map(date => {
                const isOther = date.month() !== miniCalDate.month();
                const todM = isToday(date);
                const dOW = date.day();
                const isRD = dOW === 0 || dOW === 6;
                const hasEv = events.some(e => {
                  const s = dayjs(e.startDate).format('YYYY-MM-DD');
                  const en = dayjs(e.endDate).format('YYYY-MM-DD');
                  const d2 = date.format('YYYY-MM-DD');
                  return s <= d2 && en >= d2;
                });
                return (
                  <button
                    key={date.format('YYYY-MM-DD')}
                    className={`oc-mini-d${isOther ? ' other-m' : ''}${todM ? ' today-m' : ''}${!todM && isRD && !isOther ? ' rd-d' : ''}`}
                    onClick={() => { setCurrentDate(date); setSelectedDate(date.format('YYYY-MM-DD')); }}
                    title={date.format('MMM D, YYYY')}
                  >
                    {date.format('D')}
                    {hasEv && !todM && !isOther && (
                      <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#F8740E', display: 'block', boxShadow: '0 0 4px #F8740E' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Events */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div className="oc-sec-title" style={{ marginBottom: 0 }}>Today's Events</div>
              {todayEvents.length > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, background: 'rgba(248,116,14,0.15)',
                  color: '#f97316', border: '1px solid rgba(248,116,14,0.25)',
                  borderRadius: '20px', padding: '2px 8px'
                }}>{todayEvents.length}</span>
              )}
            </div>
            <div className="oc-sec-sub">{dayjs().format('dddd, MMMM D, YYYY')}</div>

            {todayEvents.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '20px 12px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                border: '1px dashed rgba(255,255,255,0.08)', marginTop: '6px',
              }}>
                <CalendarDays size={22} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>No events today</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {todayEvents.map(ev => {
                  const color = ev.color || EVENT_TYPE_META[ev.eventType]?.light || '#3b82f6';
                  const TypeIcon = EVENT_TYPE_ICON[ev.eventType] || CalendarRange;
                  return (
                    <div
                      key={ev._id}
                      onClick={() => { setSelectedEvent(ev); setShowDrawer(true); }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid rgba(255,255,255,0.08)`,
                        borderLeft: `3px solid ${color}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        transition: 'all .15s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderLeftColor = color; }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <TypeIcon size={14} style={{ color }} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '12.5px', fontWeight: 700, color: '#fff',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{ev.title}</div>

                        {!ev.allDay && ev.startTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Clock3 size={9} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                            <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)' }}>
                              {ev.startTime} – {ev.endTime || '—'}
                            </span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em',
                            background: `${color}18`, color, border: `1px solid ${color}30`,
                            borderRadius: '20px', padding: '1px 7px',
                          }}>{ev.eventType}</span>

                          {ev.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                              <MapPin size={9} />{ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="oc-view-all" style={{ marginTop: '10px' }} onClick={() => setViewMode('agenda')}>
              View All Events <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />
            </button>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="oc-sec-title">Quick Actions</div>
            <div className="oc-qa-grid">
              {QUICK_ACTIONS.map(({ label, icon: Icon, color }) => (
                <button key={label} className="oc-qa-btn" onClick={() => openCreateModal(dayjs().format('YYYY-MM-DD'))}>
                  <div className={`oc-qa-icon ${color}`}><Icon size={16} /></div>
                  <span className="oc-qa-lbl">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ═══════════════════════ MODAL ═══════════════════════ */}
      {showModal && createPortal(
        <div className="oc-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="oc-modal">
            <div className="oc-modal-hdr">
              <div>
                <div className="oc-modal-sub">{mode === 'edit' ? 'Edit Event' : 'New Event'}</div>
                <div className="oc-modal-ttl">{mode === 'edit' ? 'Update scheduling details' : 'Create a new office event'}</div>
              </div>
              <button className="oc-modal-close" onClick={() => setShowModal(false)}><X size={15} /></button>
            </div>

            <form className="oc-form" onSubmit={handleSubmit}>
              <div className="oc-full">
                <label className="oc-flbl">Event Title *</label>
                <input required name="title" value={formData.title} onChange={handleFieldChange} className="oc-finput" placeholder="Enter event title" />
              </div>
              <div>
                <label className="oc-flbl">Event Type *</label>
                <Select
                  styles={customSelectStyles}
                  name="eventType"
                  value={formData.eventType ? { value: formData.eventType, label: formData.eventType } : null}
                  onChange={option => handleFieldChange({ target: { name: 'eventType', value: option ? option.value : '' } })}
                  options={EVENT_TYPES.map(t => ({ value: t, label: t }))}
                  placeholder="Select Type"
                  isClearable
                  required
                />
              </div>

              {formData.eventType === 'Meeting' && (
                <>
                  <div>
                    <label className="oc-flbl">Date *</label>
                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">Meeting Link</label>
                    <input name="meetingLink" value={formData.meetingLink} onChange={handleFieldChange} className="oc-finput" placeholder="https://" />
                  </div>
                  <div>
                    <label className="oc-flbl">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Meeting Purpose</label>
                    <textarea name="meetingPurpose" value={formData.meetingPurpose} onChange={handleFieldChange} rows="2" className="oc-ftarea" placeholder="Meeting purpose…" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleFieldChange} rows="2" className="oc-ftarea" placeholder="Notes…" />
                  </div>

                  <div className="oc-section-ttl">Participants</div>
                  <div className="oc-full" style={{ position: 'relative' }}>
                    <label className="oc-flbl">Add Employees</label>

                    <div className="oc-chips" style={{ marginBottom: 12 }}>
                      {(Array.isArray(formData.participants) ? formData.participants : []).map((p, i) => {
                        const displayName = typeof p === 'object' ? p.name : p;
                        return (
                          <span key={typeof p === 'object' ? p.user_id : `${p}-${i}`} className="oc-c-chip">
                            {displayName}<button type="button" className="oc-c-chip-rm" onClick={() => handleRemoveParticipant(p)}>×</button>
                          </span>
                        );
                      })}
                      <button type="button" onClick={() => setShowEmpSelector(!showEmpSelector)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(248,116,14,0.15)', color: '#F8740E', border: '1px dashed rgba(248,116,14,0.4)', borderRadius: 20, padding: '4px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={12} /> Add Employee
                      </button>
                    </div>

                    {showEmpSelector && (
                      <div style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0, background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: 220, overflowY: 'auto' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Select Employees</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                          {Array.isArray(allEmployees) ? allEmployees.map((emp, i) => {
                            const name = getEmployeeFullName(emp);
                            if (!name) return null;
                            const isSel = (formData.participants || []).some(p => typeof p === 'object' ? p.user_id === emp.employee_id : p === name);
                            return (
                              <div key={emp.employee_id || `${name}-${i}`} onClick={() => handleToggleParticipant(emp)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: isSel ? 'rgba(248,116,14,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isSel ? 'rgba(248,116,14,0.3)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: isSel ? '#F8740E' : '#fff', transition: 'all .15s' }}>
                                <div style={{ width: 12, height: 12, borderRadius: 3, border: `1px solid ${isSel ? '#F8740E' : 'rgba(255,255,255,0.3)'}`, background: isSel ? '#F8740E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 'bold', color: '#fff' }}>
                                  {isSel && '✓'}
                                </div>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                              </div>
                            );
                          }) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {formData.eventType === 'Holiday' && (
                <>
                  <div>
                    <label className="oc-flbl">Start Date *</label>
                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">End Date *</label>
                    <input required type="date" name="endDate" value={formData.endDate} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Reason</label>
                    <input name="reason" value={formData.reason} onChange={handleFieldChange} className="oc-finput" placeholder="Holiday reason" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleFieldChange} rows="2" className="oc-ftarea" placeholder="Description…" />
                  </div>
                </>
              )}

              {formData.eventType === 'Office Event' && (
                <>
                  <div className="oc-full">
                    <label className="oc-flbl">Date *</label>
                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleFieldChange} rows="2" className="oc-ftarea" placeholder="Description…" />
                  </div>
                </>
              )}

              {formData.eventType === 'Interview' && (
                <>
                  <div className="oc-full">
                    <label className="oc-flbl">Person Name</label>
                    <input name="interviewPerson" value={formData.interviewPerson} onChange={handleFieldChange} className="oc-finput" placeholder="Name of interviewee" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Date *</label>
                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">Start Time</label>
                    <input type="time" name="startTime" value={formData.startTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">End Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                </>
              )}

              {formData.eventType === 'Project Deadline' && (
                <>
                  <div className="oc-full">
                    <label className="oc-flbl">Project</label>
                    <Select
                      styles={customSelectStyles}
                      name="project"
                      value={formData.project ? { value: formData.project, label: formData.project } : null}
                      onChange={option => handleFieldChange({ target: { name: 'project', value: option ? option.value : '' } })}
                      options={apiProjects.map(p => ({ value: p.project_name, label: p.project_name }))}
                      placeholder="Select project"
                      isClearable
                    />
                  </div>
                  <div>
                    <label className="oc-flbl">Date *</label>
                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div>
                    <label className="oc-flbl">Deadline Time</label>
                    <input type="time" name="endTime" value={formData.endTime} onChange={handleFieldChange} className="oc-finput" />
                  </div>
                  <div className="oc-full">
                    <label className="oc-flbl">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleFieldChange} rows="2" className="oc-ftarea" placeholder="Description…" />
                  </div>
                </>
              )}

              <div>
                <label className="oc-flbl">Color</label>
                <input
                  type="color"
                  name="color"
                  value={formData.color || getEventColor(formData.eventType)}
                  onChange={handleFieldChange}
                  className="oc-finput"
                  style={{
                    height: 42,
                    width: '30%',
                    padding: '4px 8px',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div className="oc-full">
                <label className="oc-flbl">Attachments</label>
                <input type="file" multiple onChange={handleAttachmentChange} className="oc-finput" style={{ cursor: 'pointer' }} />
                {formData.attachments && formData.attachments.length > 0 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{formData.attachments.join(', ')}</div>}
              </div>

              <div className="oc-form-actions">
                <button type="button" className="oc-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="oc-btn-save">
                  {isSubmitting
                    ? <><Loader2 size={14} className="spin" /> Saving…</>
                    : mode === 'edit' ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════ DRAWER / VIEW MODAL ═══════════════════════ */}
      {showDrawer && selectedEvent && (
        <OfficeCalendarViewModal
          open={showDrawer}
          onClose={() => setShowDrawer(false)}
          event={selectedEvent}
          onEdit={(evt) => { setShowDrawer(false); openEditModal(evt); }}
          onDelete={() => handleDelete()}
          canEdit={true}
        />
      )}
    </>
  );
};

export default OfficeCalendar;
