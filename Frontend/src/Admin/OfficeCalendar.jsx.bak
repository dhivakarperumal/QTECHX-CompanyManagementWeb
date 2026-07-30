import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Toaster, toast } from 'react-hot-toast';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
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
  BadgeCheck,
  CalendarRange,
  ListChecks,
  Eye,
  Loader2,
  Moon,
  SunMedium,
  Building2,
  Plane,
  Gift,
  HeartHandshake,
  GraduationCap,
  ClipboardList,
  CircleAlert,
} from 'lucide-react';

const EVENT_TYPES = [
  'Meeting',
  'Holiday',
  'Leave',
  'Birthday',
  'Anniversary',
  'Client Meeting',
  'Training',
  'Office Event',
  'Project Deadline',
  'Reminder',
  'Interview',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];
const REMINDERS = ['At time of event', '10 min before', '30 min before', '1 hour before', '1 day before'];

const EVENT_TYPE_META = {
  Meeting: { accent: 'bg-sky-500/15 text-sky-400 border-sky-500/30', dot: 'bg-sky-500' },
  Holiday: { accent: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-500' },
  Leave: { accent: 'bg-violet-500/15 text-violet-400 border-violet-500/30', dot: 'bg-violet-500' },
  Birthday: { accent: 'bg-pink-500/15 text-pink-400 border-pink-500/30', dot: 'bg-pink-500' },
  Anniversary: { accent: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30', dot: 'bg-fuchsia-500' },
  'Client Meeting': { accent: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', dot: 'bg-indigo-500' },
  Training: { accent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  'Office Event': { accent: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', dot: 'bg-cyan-500' },
  'Project Deadline': { accent: 'bg-red-500/15 text-red-400 border-red-500/30', dot: 'bg-red-500' },
  Reminder: { accent: 'bg-stone-500/15 text-stone-400 border-stone-500/30', dot: 'bg-stone-500' },
  Interview: { accent: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-500' },
  Other: { accent: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-500' },
};

const EVENT_TYPE_COLORS = {
  Meeting: '#3b82f6',
  Holiday: '#f59e0b',
  Leave: '#8b5cf6',
  Birthday: '#ec4899',
  Anniversary: '#d946ef',
  'Client Meeting': '#6366f1',
  Training: '#10b981',
  'Office Event': '#06b6d4',
  'Project Deadline': '#ef4444',
  Reminder: '#64748b',
  Interview: '#2563eb',
  Other: '#64748b',
};

const EVENT_TYPE_ICON = {
  Meeting: Briefcase,
  Holiday: Plane,
  Leave: HeartHandshake,
  Birthday: Gift,
  Anniversary: Sparkles,
  'Client Meeting': Building2,
  Training: GraduationCap,
  'Office Event': CalendarRange,
  'Project Deadline': ClipboardList,
  Reminder: BellRing,
  Interview: Users,
  Other: CircleAlert,
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeSeedEvents = () => {
  const today = dayjs();
  return [
    {
      id: createId(),
      title: 'Leadership Sync',
      eventType: 'Meeting',
      description: 'Weekly leadership alignment across departments.',
      startDate: today.format('YYYY-MM-DD'),
      endDate: today.format('YYYY-MM-DD'),
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      priority: 'High',
      status: 'Scheduled',
      location: 'Executive Room',
      meetingLink: 'https://meet.example.com/leadership',
      project: 'Q-Techx Web',
      department: 'Operations',
      assignedEmployees: ['Asha', 'Milan'],
      reminder: '30 min before',
      color: '#3b82f6',
      attachments: ['agenda.pdf'],
      notes: 'Prepare rollout milestones and staffing updates.',
      comments: ['Need updated metrics before the meeting.'],
      activity: ['Created by A. Singh', 'Updated by N. Rao'],
      createdBy: 'A. Singh',
      createdDate: today.subtract(1, 'day').format('YYYY-MM-DD'),
      updatedDate: today.subtract(1, 'hour').format('YYYY-MM-DD'),
    },
    {
      id: createId(),
      title: 'Client Onboarding',
      eventType: 'Client Meeting',
      description: 'Kickoff call for the new client intake process.',
      startDate: today.add(1, 'day').format('YYYY-MM-DD'),
      endDate: today.add(1, 'day').format('YYYY-MM-DD'),
      startTime: '14:00',
      endTime: '15:00',
      allDay: false,
      priority: 'Critical',
      status: 'Scheduled',
      location: 'Zoom',
      meetingLink: 'https://zoom.us/j/123456789',
      project: 'Client Portal',
      department: 'Sales',
      assignedEmployees: ['Neha', 'Ravi'],
      reminder: '1 hour before',
      color: '#6366f1',
      attachments: ['client-notes.docx'],
      notes: 'Share the onboarding checklist.',
      comments: ['Discuss implementation timeline.'],
      activity: ['Created by Sales Ops'],
      createdBy: 'Sales Ops',
      createdDate: today.format('YYYY-MM-DD'),
      updatedDate: today.format('YYYY-MM-DD'),
    },
    {
      id: createId(),
      title: 'Office Holiday',
      eventType: 'Holiday',
      description: 'Company-wide office holiday.',
      startDate: today.add(2, 'day').format('YYYY-MM-DD'),
      endDate: today.add(2, 'day').format('YYYY-MM-DD'),
      startTime: '',
      endTime: '',
      allDay: true,
      priority: 'Medium',
      status: 'Scheduled',
      location: 'Head Office',
      meetingLink: '',
      project: '',
      department: 'HR',
      assignedEmployees: ['HR Team'],
      reminder: '1 day before',
      color: '#f59e0b',
      attachments: [],
      notes: 'No office attendance required.',
      comments: [],
      activity: ['Created by HR'],
      createdBy: 'HR',
      createdDate: today.subtract(2, 'day').format('YYYY-MM-DD'),
      updatedDate: today.subtract(2, 'day').format('YYYY-MM-DD'),
    },
    {
      id: createId(),
      title: 'Project Deadline',
      eventType: 'Project Deadline',
      description: 'Final review for the mobile release.',
      startDate: today.add(4, 'day').format('YYYY-MM-DD'),
      endDate: today.add(5, 'day').format('YYYY-MM-DD'),
      startTime: '09:00',
      endTime: '17:00',
      allDay: false,
      priority: 'High',
      status: 'Ongoing',
      location: 'Project Hub',
      meetingLink: '',
      project: 'Mobile App',
      department: 'Engineering',
      assignedEmployees: ['Karan', 'Priya'],
      reminder: 'At time of event',
      color: '#ef4444',
      attachments: ['release-checklist.pdf'],
      notes: 'QA sign-off required.',
      comments: ['Ensure staging is ready.'],
      activity: ['Created by PM'],
      createdBy: 'PM',
      createdDate: today.subtract(1, 'day').format('YYYY-MM-DD'),
      updatedDate: today.format('YYYY-MM-DD'),
    },
  ];
};

const defaultForm = {
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
  department: '',
  assignedEmployees: [],
  reminder: '30 min before',
  color: '',
  attachments: [],
  notes: '',
};

const getEventColor = (eventType, customColor) => customColor || EVENT_TYPE_COLORS[eventType] || '#3b82f6';

const OfficeCalendar = () => {
  const [events, setEvents] = useState([]);
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
  const [filters, setFilters] = useState({ eventType: 'all', project: 'all', department: 'all', employee: 'all', priority: 'all', status: 'all' });
  const [draggingEventId, setDraggingEventId] = useState(null);
  const [resizingEventId, setResizingEventId] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('office-calendar-events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEvents(parsed);
      } catch (error) {
        setEvents(makeSeedEvents());
      }
    } else {
      setEvents(makeSeedEvents());
    }
    const timer = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('office-calendar-events', JSON.stringify(events));
  }, [events]);

  const filteredEvents = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSearch = !search || [event.title, event.description, event.project, event.department, event.assignedEmployees.join(' ')].some((value) => value?.toLowerCase().includes(search));
      const matchesType = filters.eventType === 'all' || event.eventType === filters.eventType;
      const matchesProject = filters.project === 'all' || event.project === filters.project;
      const matchesDepartment = filters.department === 'all' || event.department === filters.department;
      const matchesEmployee = filters.employee === 'all' || event.assignedEmployees.some((name) => name === filters.employee);
      const matchesPriority = filters.priority === 'all' || event.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || event.status === filters.status;
      return matchesSearch && matchesType && matchesProject && matchesDepartment && matchesEmployee && matchesPriority && matchesStatus;
    });
  }, [events, filters, searchText]);

  const visibleEvents = useMemo(() => {
    const current = currentDate;
    const currentValue = current.valueOf();
    return filteredEvents.filter((event) => {
      const start = dayjs(event.startDate).valueOf();
      const end = dayjs(event.endDate).valueOf();
      if (viewMode === 'month') {
        const currentMonth = current.startOf('month').valueOf();
        const nextMonth = current.endOf('month').valueOf();
        return (start >= currentMonth && start <= nextMonth) || (end >= currentMonth && end <= nextMonth) || (start < currentMonth && end > nextMonth);
      }
      if (viewMode === 'week') {
        const weekStart = current.startOf('week').valueOf();
        const weekEnd = current.endOf('week').valueOf();
        return (start >= weekStart && start <= weekEnd) || (end >= weekStart && end <= weekEnd) || (start < weekStart && end > weekEnd);
      }
      if (viewMode === 'day') {
        const dayStart = current.startOf('day').valueOf();
        const dayEnd = current.endOf('day').valueOf();
        return (start >= dayStart && start <= dayEnd) || (end >= dayStart && end <= dayEnd) || (start < dayStart && end > dayEnd);
      }
      return true;
    });
  }, [filteredEvents, currentDate, viewMode]);

  const summaryCards = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const upcoming = events.filter((event) => dayjs(event.startDate).valueOf() >= dayjs(today).valueOf()).sort((a, b) => a.startDate.localeCompare(b.startDate));
    return [
      { label: 'Total Events', value: events.length, accent: 'from-sky-500/20 to-sky-500/5 text-sky-300', icon: CalendarDays },
      { label: "Today's Events", value: events.filter((event) => event.startDate === today || event.endDate === today).length, accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300', icon: Sparkles },
      { label: 'Upcoming Meetings', value: upcoming.filter((event) => event.eventType === 'Meeting' || event.eventType === 'Client Meeting').length, accent: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300', icon: Briefcase },
      { label: 'Holidays', value: events.filter((event) => event.eventType === 'Holiday').length, accent: 'from-amber-500/20 to-amber-500/5 text-amber-300', icon: Plane },
      { label: 'Employee Leaves', value: events.filter((event) => event.eventType === 'Leave').length, accent: 'from-violet-500/20 to-violet-500/5 text-violet-300', icon: HeartHandshake },
      { label: 'Project Deadlines', value: events.filter((event) => event.eventType === 'Project Deadline').length, accent: 'from-rose-500/20 to-rose-500/5 text-rose-300', icon: ClipboardList },
    ];
  }, [events]);

  const monthDays = useMemo(() => {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');
    const days = [];
    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end)) {
      days.push(cursor);
      cursor = cursor.add(1, 'day');
    }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = currentDate.startOf('week');
    return Array.from({ length: 7 }, (_, index) => start.add(index, 'day'));
  }, [currentDate]);

  const dayEvents = useMemo(() => {
    const target = currentDate.format('YYYY-MM-DD');
    return visibleEvents.filter((event) => {
      const start = dayjs(event.startDate).valueOf();
      const end = dayjs(event.endDate).valueOf();
      const dayValue = dayjs(target).startOf('day').valueOf();
      return dayValue >= start && dayValue <= end;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [visibleEvents, currentDate]);

  const upcomingChronological = useMemo(() => {
    return [...events].sort((a, b) => {
      const aDate = dayjs(`${a.startDate} ${a.startTime || '00:00'}`);
      const bDate = dayjs(`${b.startDate} ${b.startTime || '00:00'}`);
      return aDate.valueOf() - bDate.valueOf();
    }).slice(0, 8);
  }, [events]);

  const departments = useMemo(() => Array.from(new Set(events.map((event) => event.department).filter(Boolean))), [events]);
  const projects = useMemo(() => Array.from(new Set(events.map((event) => event.project).filter(Boolean))), [events]);
  const employees = useMemo(() => Array.from(new Set(events.flatMap((event) => event.assignedEmployees).filter(Boolean))), [events]);

  const openCreateModal = (date = dayjs().format('YYYY-MM-DD')) => {
    setMode('create');
    setSelectedDate(date);
    setFormData({ ...defaultForm, startDate: date, endDate: date });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setMode('edit');
    setSelectedEvent(event);
    setFormData({ ...event, assignedEmployees: event.assignedEmployees || [] });
    setShowModal(true);
  };

  const handleSubmit = (event) => {
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

    const duplicate = events.some((item) => item.id !== selectedEvent?.id && item.title.toLowerCase() === formData.title.toLowerCase().trim() && item.startDate === formData.startDate && item.startTime === formData.startTime);
    if (duplicate) {
      toast.error('A similar event already exists on the same date and time.');
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const finalEvent = {
        ...selectedEvent,
        ...formData,
        id: selectedEvent?.id || createId(),
        title: formData.title.trim(),
        color: formData.color || getEventColor(formData.eventType, formData.color),
        attachments: formData.attachments || [],
        assignedEmployees: formData.assignedEmployees || [],
        comments: selectedEvent?.comments || ['New activity added'],
        activity: selectedEvent?.activity || ['Created by Admin'],
        createdBy: selectedEvent?.createdBy || 'Admin',
        createdDate: selectedEvent?.createdDate || dayjs().format('YYYY-MM-DD'),
        updatedDate: dayjs().format('YYYY-MM-DD'),
      };

      setEvents((current) => {
        if (mode === 'edit' && selectedEvent) {
          return current.map((item) => (item.id === selectedEvent.id ? finalEvent : item));
        }
        return [finalEvent, ...current];
      });

      setShowModal(false);
      setSelectedEvent(finalEvent);
      setShowDrawer(true);
      setIsSubmitting(false);
      toast.success(mode === 'edit' ? 'Event updated successfully.' : 'Event created successfully.');
    }, 600);
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    const confirmed = window.confirm('Delete this event permanently?');
    if (!confirmed) return;
    setEvents((current) => current.filter((event) => event.id !== selectedEvent.id));
    setShowDrawer(false);
    setSelectedEvent(null);
    toast.success('Event deleted successfully.');
  };

  const handleDrop = (date) => {
    if (!draggingEventId) return;
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    setEvents((current) => current.map((event) => event.id === draggingEventId ? { ...event, startDate: targetDate, endDate: targetDate } : event));
    setDraggingEventId(null);
    toast.success('Event date updated.');
  };

  const startResize = (event, eventId) => {
    event.stopPropagation();
    setResizingEventId(eventId);
  };

  useEffect(() => {
    if (!resizingEventId) return;
    const onMove = (moveEvent) => {
      const target = moveEvent.target.closest('[data-day]');
      if (!target) return;
      const nextDate = target.getAttribute('data-date');
      if (!nextDate) return;
      setEvents((current) => current.map((item) => item.id === resizingEventId && dayjs(nextDate).isAfter(dayjs(item.startDate)) ? { ...item, endDate: nextDate } : item));
    };
    const onUp = () => setResizingEventId(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizingEventId]);

  const navigateView = (direction) => {
    setCurrentDate((current) => current.add(direction, viewMode === 'month' ? 'month' : viewMode === 'week' ? 'week' : 'day'));
  };

  const resetToToday = () => {
    setCurrentDate(dayjs());
  };

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []).map((file) => file.name);
    setFormData((current) => ({ ...current, attachments: files }));
  };

  const handleEmployeeInput = (event) => {
    const values = event.target.value.split(',').map((item) => item.trim()).filter(Boolean);
    setFormData((current) => ({ ...current, assignedEmployees: values }));
  };

  const isToday = (date) => dayjs(date).isSame(dayjs(), 'day');

  const eventLabel = (event) => {
    const meta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.Other;
    return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${meta.accent}`}>{event.eventType}</span>;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen rounded-[2rem] border border-white/10 p-6 ${theme === 'dark' ? 'bg-[#06070b] text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[1.5rem] bg-white/10" />)}
            </div>
            <div className="h-[520px] animate-pulse rounded-[2rem] bg-white/10" />
          </div>
          <div className="h-[520px] animate-pulse rounded-[2rem] bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen rounded-[2rem] border border-white/10 p-3 sm:p-4 lg:p-6 transition-colors ${theme === 'dark' ? 'bg-[#06070b] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" toastOptions={{ style: { background: theme === 'dark' ? '#111827' : '#ffffff', color: theme === 'dark' ? '#fff' : '#111827', borderRadius: '14px' } }} />

      <div className={`sticky top-0 z-20 mb-4 rounded-[1.5rem] border border-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0b111c]/95' : 'bg-white/95'}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-400">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Office Calendar</p>
              <h1 className="text-xl font-semibold">Corporate planning and event coordination</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={resetToToday} className={`rounded-full border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
              Today
            </button>
            <button onClick={() => navigateView(-1)} className={`rounded-full border p-2 ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => navigateView(1)} className={`rounded-full border p-2 ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
              <ChevronRight size={16} />
            </button>
            <div className={`rounded-full px-3 py-2 text-sm font-semibold ${theme === 'dark' ? 'bg-white/8 text-white' : 'bg-slate-100 text-slate-900'}`}>
              {currentDate.format('MMMM YYYY')}
            </div>
            <div className="relative flex-1 sm:min-w-[220px]">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search events" className={`w-full rounded-full border py-2 pl-9 pr-3 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white placeholder:text-white/40' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500'}`} />
            </div>
            <button onClick={() => setShowFilters((value) => !value)} className={`rounded-full border px-3 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
              <span className="flex items-center gap-2"><Filter size={15} /> Filters</span>
            </button>
            <button onClick={() => openCreateModal(selectedDate)} className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20">
              <span className="flex items-center gap-2"><Plus size={15} /> Add Event</span>
            </button>
            <button onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))} className={`rounded-full border p-2 ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'}`}>
              {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={`mt-3 grid gap-3 rounded-[1.25rem] border border-white/10 p-3 md:grid-cols-2 xl:grid-cols-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-white/40">Event Type</span>
              <select value={filters.eventType} onChange={(event) => setFilters({ ...filters, eventType: event.target.value })} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-[#05070b] text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="all">All event types</option>
                {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-white/40">Project</span>
              <select value={filters.project} onChange={(event) => setFilters({ ...filters, project: event.target.value })} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-[#05070b] text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="all">All projects</option>
                {projects.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-white/40">Department</span>
              <select value={filters.department} onChange={(event) => setFilters({ ...filters, department: event.target.value })} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-[#05070b] text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="all">All departments</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-white/40">Employee</span>
              <select value={filters.employee} onChange={(event) => setFilters({ ...filters, employee: event.target.value })} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-[#05070b] text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="all">All employees</option>
                {employees.map((employee) => <option key={employee} value={employee}>{employee}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-white/40">Priority</span>
              <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-[#05070b] text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="all">All priorities</option>
                {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.24em] text-white/40">Status</span>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className={`rounded-2xl border px-3 py-2 text-sm outline-none ${theme === 'dark' ? 'border-white/10 bg-[#05070b] text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="all">All statuses</option>
                {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-[1.5rem] border border-white/10 bg-gradient-to-br p-4 shadow-xl shadow-black/20 ${theme === 'dark' ? 'bg-[#0b111c]' : 'bg-white'}`}>
              <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br p-2 ${card.accent}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-semibold">{card.value}</p>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <div className={`rounded-[2rem] border border-white/10 p-3 sm:p-4 ${theme === 'dark' ? 'bg-[#0b111c]' : 'bg-white'}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('month')} className={`rounded-full px-3 py-2 text-sm ${viewMode === 'month' ? 'bg-sky-500 text-white' : theme === 'dark' ? 'bg-white/5 text-white/70' : 'bg-slate-100 text-slate-700'}`}>Month</button>
              <button onClick={() => setViewMode('week')} className={`rounded-full px-3 py-2 text-sm ${viewMode === 'week' ? 'bg-sky-500 text-white' : theme === 'dark' ? 'bg-white/5 text-white/70' : 'bg-slate-100 text-slate-700'}`}>Week</button>
              <button onClick={() => setViewMode('day')} className={`rounded-full px-3 py-2 text-sm ${viewMode === 'day' ? 'bg-sky-500 text-white' : theme === 'dark' ? 'bg-white/5 text-white/70' : 'bg-slate-100 text-slate-700'}`}>Day</button>
              <button onClick={() => setViewMode('agenda')} className={`rounded-full px-3 py-2 text-sm ${viewMode === 'agenda' ? 'bg-sky-500 text-white' : theme === 'dark' ? 'bg-white/5 text-white/70' : 'bg-slate-100 text-slate-700'}`}>Agenda</button>
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
              {visibleEvents.length} events in view
            </div>
          </div>

          {viewMode === 'agenda' ? (
            <div className="space-y-2">
              {upcomingChronological.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                  <p className="font-semibold">Nothing scheduled yet.</p>
                  <p className="mt-1 text-sm">Create your first event to populate this agenda.</p>
                </div>
              ) : (
                upcomingChronological.map((event) => {
                  const Icon = EVENT_TYPE_ICON[event.eventType] || CalendarDays;
                  const meta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.Other;
                  return (
                    <div key={event.id} onClick={() => { setSelectedEvent(event); setShowDrawer(true); }} className={`flex cursor-pointer items-start justify-between rounded-[1.25rem] border p-3 transition hover:-translate-y-0.5 ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`rounded-2xl border p-2 ${meta.accent}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{event.title}</p>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${meta.accent}`}>{event.eventType}</span>
                          </div>
                          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{event.description || 'No description provided.'}</p>
                          <p className={`mt-2 flex flex-wrap gap-3 text-xs ${theme === 'dark' ? 'text-white/35' : 'text-slate-400'}`}>
                            <span>{dayjs(event.startDate).format('MMM D, YYYY')}</span>
                            {event.startTime && <span>{event.startTime} - {event.endTime || '—'}</span>}
                            {event.location && <span>{event.location}</span>}
                          </p>
                        </div>
                      </div>
                      <div className={`rounded-full px-2 py-1 text-xs ${event.priority === 'Critical' ? 'bg-rose-500/15 text-rose-400' : event.priority === 'High' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{event.priority}</div>
                    </div>
                  );
                })
              )}
            </div>
          ) : viewMode === 'day' ? (
            <div className="space-y-2">
              {dayEvents.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                  <p className="font-semibold">No events for this day.</p>
                  <p className="mt-1 text-sm">Tap a date to add a new event.</p>
                </div>
              ) : (
                dayEvents.map((event) => {
                  const meta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.Other;
                  return (
                    <div key={event.id} onClick={() => { setSelectedEvent(event); setShowDrawer(true); }} className={`rounded-[1.25rem] border p-3 ${meta.accent}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm opacity-80">{event.description || 'No description provided.'}</p>
                        </div>
                        <div className="text-right text-xs opacity-70">
                          {event.allDay ? 'All day' : `${event.startTime} - ${event.endTime || '—'}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                <div key={label} className={`rounded-2xl border border-white/10 p-2 text-center text-xs uppercase tracking-[0.24em] ${theme === 'dark' ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                  {label}
                </div>
              ))}
              {monthDays.map((date) => {
                const dayEventsForDate = visibleEvents.filter((event) => {
                  const start = dayjs(event.startDate).valueOf();
                  const end = dayjs(event.endDate).valueOf();
                  const dayValue = dayjs(date).startOf('day').valueOf();
                  return dayValue >= start && dayValue <= end;
                });

                return (
                  <div key={date.format('YYYY-MM-DD')} data-day="true" data-date={date.format('YYYY-MM-DD')} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(date.format('YYYY-MM-DD'))} onClick={() => openCreateModal(date.format('YYYY-MM-DD'))} className={`min-h-[118px] rounded-[1.25rem] border p-2 transition ${theme === 'dark' ? 'border-white/10 bg-[#05070b] hover:bg-white/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} ${isToday(date) ? 'ring-1 ring-sky-500/40' : ''}`}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className={`font-semibold ${date.month() === currentDate.month() ? '' : theme === 'dark' ? 'text-white/35' : 'text-slate-400'}`}>{date.format('D')}</span>
                      {dayEventsForDate.length > 0 && <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-400">{dayEventsForDate.length}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {dayEventsForDate.slice(0, 3).map((event) => {
                        const meta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.Other;
                        return (
                          <div key={event.id} draggable onDragStart={() => setDraggingEventId(event.id)} onClick={(itemEvent) => { itemEvent.stopPropagation(); setSelectedEvent(event); setShowDrawer(true); }} className={`flex cursor-pointer items-center justify-between rounded-xl border px-2 py-1 text-[10px] font-semibold ${meta.accent}`}>
                            <span className="truncate">{event.title}</span>
                            <span className="ml-1 cursor-ns-resize text-[10px] opacity-70" onMouseDown={(itemEvent) => { itemEvent.stopPropagation(); setResizingEventId(event.id); }} title="Resize event">↕</span>
                          </div>
                        );
                      })}
                      {dayEventsForDate.length > 3 && <p className={`text-[10px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>+{dayEventsForDate.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`rounded-[2rem] border border-white/10 p-3 sm:p-4 ${theme === 'dark' ? 'bg-[#0b111c]' : 'bg-white'}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Upcoming</p>
              <h2 className="text-lg font-semibold">Chronological schedule</h2>
            </div>
            <button onClick={() => setViewMode('agenda')} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm">Open agenda</button>
          </div>
          <div className="space-y-2">
            {upcomingChronological.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-white/10 p-6 text-center text-white/40">
                <p className="font-semibold">No upcoming items.</p>
              </div>
            ) : (
              upcomingChronological.map((event) => {
                const meta = EVENT_TYPE_META[event.eventType] || EVENT_TYPE_META.Other;
                return (
                  <div key={event.id} onClick={() => { setSelectedEvent(event); setShowDrawer(true); }} className={`cursor-pointer rounded-[1.25rem] border p-3 transition hover:-translate-y-0.5 ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                        <span className="text-sm font-semibold">{event.title}</span>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${meta.accent}`}>{event.eventType}</span>
                    </div>
                    <div className={`mt-2 flex items-center gap-3 text-xs ${theme === 'dark' ? 'text-white/45' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1"><CalendarDays size={12} /> {dayjs(event.startDate).format('MMM D')}</span>
                      {event.startTime && <span className="flex items-center gap-1"><Clock3 size={12} /> {event.startTime}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm">
          <div className={`max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 p-4 shadow-2xl shadow-black/40 ${theme === 'dark' ? 'bg-[#06070b] text-white' : 'bg-white text-slate-900'}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{mode === 'edit' ? 'Edit Event' : 'Add Event'}</p>
                <h3 className="text-xl font-semibold">{mode === 'edit' ? 'Update scheduling details' : 'Create a new office event'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className={`rounded-full border p-2 ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'}`}>
                <X size={16} />
              </button>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Event Title *</span>
                <input required name="title" value={formData.title} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Enter event title" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Event Type *</span>
                <select required name="eventType" value={formData.eventType} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`}>
                  {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Priority</span>
                <select name="priority" value={formData.priority} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`}>
                  {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Description</span>
                <textarea name="description" value={formData.description} onChange={handleFieldChange} rows="3" className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Add short context for the event" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Start Date *</span>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">End Date *</span>
                <input required type="date" name="endDate" value={formData.endDate} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Start Time</span>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">End Time</span>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allDay" checked={formData.allDay} onChange={handleFieldChange} className="h-4 w-4 rounded border-slate-300" />
                <span>All Day Event</span>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Status</span>
                <select name="status" value={formData.status} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`}>
                  {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Location</span>
                <input name="location" value={formData.location} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Room, Zoom, HQ" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Meeting Link</span>
                <input name="meetingLink" value={formData.meetingLink} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="https://" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Project</span>
                <input name="project" value={formData.project} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Optional project" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Department</span>
                <input name="department" value={formData.department} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Optional department" />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Assign Employees</span>
                <input value={formData.assignedEmployees.join(', ')} onChange={handleEmployeeInput} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Asha, Milan, Priya" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Reminder</span>
                <select name="reminder" value={formData.reminder} onChange={handleFieldChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`}>
                  {REMINDERS.map((reminder) => <option key={reminder} value={reminder}>{reminder}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-sm font-semibold">Color</span>
                <input type="color" name="color" value={formData.color || '#3b82f6'} onChange={handleFieldChange} className={`h-11 rounded-2xl border px-2 py-1 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-300 bg-slate-50'}`} />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Attachment Upload</span>
                <input type="file" multiple onChange={handleAttachmentChange} className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} />
                {formData.attachments.length > 0 && <span className="text-xs text-white/50">Selected: {formData.attachments.join(', ')}</span>}
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-sm font-semibold">Notes</span>
                <textarea name="notes" value={formData.notes} onChange={handleFieldChange} rows="3" className={`rounded-2xl border px-3 py-2 outline-none ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} placeholder="Optional notes" />
              </label>

              <div className="flex items-center justify-end gap-2 md:col-span-2">
                <button type="button" onClick={() => setShowModal(false)} className={`rounded-full border px-4 py-2 text-sm ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-slate-100 hover:bg-slate-200'}`}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
                  {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={15} /> Saving</span> : mode === 'edit' ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDrawer && selectedEvent && (
        <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[420px] flex-col border-l border-white/10 bg-[#06070b]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Event Details</p>
              <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
            </div>
            <button onClick={() => setShowDrawer(false)} className="rounded-full border border-white/10 bg-white/5 p-2">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1">
            <div className={`rounded-[1.25rem] border border-white/10 p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] ${EVENT_TYPE_META[selectedEvent.eventType]?.accent || EVENT_TYPE_META.Other.accent}`}>{selectedEvent.eventType}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${selectedEvent.priority === 'Critical' ? 'bg-rose-500/15 text-rose-400' : selectedEvent.priority === 'High' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{selectedEvent.priority}</span>
              </div>
              <p className="text-sm text-white/70">{selectedEvent.description || 'No description provided.'}</p>
            </div>

            <div className={`rounded-[1.25rem] border border-white/10 p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 text-white/70"><CalendarDays size={14} /> {dayjs(selectedEvent.startDate).format('MMMM D, YYYY')}</div>
                {!selectedEvent.allDay && <div className="flex items-center gap-2 text-white/70"><Clock3 size={14} /> {selectedEvent.startTime} - {selectedEvent.endTime}</div>}
                {selectedEvent.location && <div className="flex items-center gap-2 text-white/70"><MapPin size={14} /> {selectedEvent.location}</div>}
                {selectedEvent.project && <div className="flex items-center gap-2 text-white/70"><Briefcase size={14} /> {selectedEvent.project}</div>}
                {selectedEvent.department && <div className="flex items-center gap-2 text-white/70"><Building2 size={14} /> {selectedEvent.department}</div>}
              </div>
            </div>

            <div className={`rounded-[1.25rem] border border-white/10 p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Users size={14} /> Assigned Employees</div>
              <div className="flex flex-wrap gap-2">
                {(selectedEvent.assignedEmployees || []).map((employee) => <span key={employee} className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs">{employee}</span>)}
              </div>
            </div>

            <div className={`rounded-[1.25rem] border border-white/10 p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Paperclip size={14} /> Attachments</div>
              {(selectedEvent.attachments || []).length > 0 ? <ul className="space-y-1 text-sm text-white/70">{(selectedEvent.attachments || []).map((attachment) => <li key={attachment}>• {attachment}</li>)}</ul> : <p className="text-sm text-white/45">No attachments.</p>}
            </div>

            <div className={`rounded-[1.25rem] border border-white/10 p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Eye size={14} /> Activity Timeline</div>
              <div className="space-y-2 text-sm text-white/70">
                {(selectedEvent.activity || []).map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2">{item}</div>)}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEditModal(selectedEvent)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-sm font-semibold text-white"><Pencil size={14} /> Edit</button>
              <button onClick={handleDelete} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300"><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeCalendar;
