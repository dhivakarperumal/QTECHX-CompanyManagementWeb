import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import {
  ChevronLeft, ChevronRight, Plus, Users, Clock, MapPin,
  CalendarDays, Video, Palmtree, CalendarPlus, Briefcase,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import MyCalendarEventModal from './MyCalendarEventModal.jsx';

dayjs.extend(isBetween);

const EVENT_TYPES = ['Meeting', 'Client Call', 'Training', 'Deadline', 'Birthday', 'Holiday', 'Leave', 'Other'];

const CATEGORY_COLORS = {
  'Meeting': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Client Call': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Training': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Deadline': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Birthday': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Holiday': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'Leave': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Other': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const CATEGORY_DOT = {
  'Meeting': '#3b82f6',
  'Client Call': '#a855f7',
  'Training': '#10b981',
  'Deadline': '#f43f5e',
  'Birthday': '#ec4899',
  'Holiday': '#14b8a6',
  'Leave': '#f59e0b',
  'Other': '#64748b',
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const VIEWS = ['Month', 'Week', 'Day', 'Agenda'];

const getEventDates = (e) => {
  const startValue = e.startDate || e.planDate || e.plan_date;
  const endValue = e.endDate || e.planDate || e.plan_date || startValue;
  return { start: dayjs(startValue), end: dayjs(endValue) };
};

const EventChip = ({ evt, onClick, compact = false }) => {
  const colorClass = CATEGORY_COLORS[evt.eventType] || CATEGORY_COLORS['Other'];
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick && onClick(evt); }}
      className={`px-2 py-1 rounded-md border text-[10px] truncate cursor-pointer hover:opacity-80 transition-opacity ${colorClass} ${compact ? '' : 'mb-1'}`}
    >
      <div className="font-semibold truncate">{evt.planTitle || evt.title}</div>
      {!compact && evt.startTime && <div className="opacity-70 text-[9px]">{evt.startTime}</div>}
    </div>
  );
};

// ────── MONTH VIEW ──────
const MonthView = ({ currentDate, selectedDate, setSelectedDate, events, onDayClick, onEventClick }) => {
  const startDate = currentDate.startOf('month').subtract((currentDate.startOf('month').day() + 6) % 7, 'day');
  const endDate = currentDate.endOf('month').add((7 - currentDate.endOf('month').day()) % 7, 'day');
  const calendarDays = [];
  let d = startDate;
  while (d.isBefore(endDate) || d.isSame(endDate, 'day')) { calendarDays.push(d); d = d.add(1, 'day'); }

  const getEventsForDay = (day) => events.filter(e => {
    const { start, end } = getEventDates(e);
    return day.isBetween(start, end, 'day', '[]');
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-white/10 pb-3 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-white/50 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-7 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
        {calendarDays.map((day, i) => {
          const isCurrentMonth = day.isSame(currentDate, 'month');
          const isToday = day.isSame(dayjs(), 'day');
          const isSelected = day.isSame(selectedDate, 'day');
          const dayEvents = getEventsForDay(day).slice(0, 3);
          const moreCount = getEventsForDay(day).length - 3;
          return (
            <div
              key={i}
              onClick={() => { setSelectedDate(day); onDayClick && onDayClick(day.format('YYYY-MM-DD')); }}
              className={`bg-[#0d0d12] p-1.5 flex flex-col hover:bg-white/5 transition-colors cursor-pointer border-r border-b border-white/5 group ${isSelected ? 'ring-1 ring-inset ring-primary/40' : ''}`}
            >
              <div className={`text-xs font-semibold mb-1 flex items-center justify-center w-6 h-6 rounded-full self-start ml-0.5
                ${!isCurrentMonth ? 'text-white/20' : 'text-white/70'}
                ${isToday ? 'bg-primary text-white shadow-md' : isSelected ? 'text-primary' : 'group-hover:text-white'}`}>
                {day.format('D')}
              </div>
              <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                {dayEvents.map((evt, idx) => <EventChip key={idx} evt={evt} compact onClick={onEventClick} />)}
                {moreCount > 0 && <div className="text-[9px] text-white/40 pl-1">+{moreCount}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────── WEEK VIEW ──────
const WeekView = ({ currentDate, events, onSlotClick, onEventClick }) => {
  const monday = currentDate.startOf('week').add(1, 'day');
  const weekDays = Array.from({ length: 7 }, (_, i) => monday.add(i, 'day'));

  const getEventsForDayHour = (day, hour) => events.filter(e => {
    const { start } = getEventDates(e);
    if (!start.isSame(day, 'day')) return false;
    if (e.allDay) return hour === 0;
    const h = parseInt((e.startTime || '00:00').split(':')[0]);
    return h === hour;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-white/10 pb-2 mb-2">
        <div className="text-xs text-white/30 text-right pr-3">Time</div>
        {weekDays.map((d, i) => (
          <div key={i} className={`text-center ${d.isSame(dayjs(), 'day') ? 'text-primary font-bold' : 'text-white/60'}`}>
            <div className="text-xs font-semibold uppercase">{d.format('ddd')}</div>
            <div className={`text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto ${d.isSame(dayjs(), 'day') ? 'bg-primary text-white' : ''}`}>{d.format('D')}</div>
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-white/5 min-h-[52px]">
            <div className="text-[10px] text-white/30 text-right pr-3 pt-1 flex-shrink-0">
              {hour === 0 ? '' : dayjs().hour(hour).minute(0).format('h A')}
            </div>
            {weekDays.map((day, di) => {
              const slotEvents = getEventsForDayHour(day, hour);
              return (
                <div
                  key={di}
                  onClick={() => onSlotClick && onSlotClick(day.format('YYYY-MM-DD'))}
                  className="border-l border-white/5 p-0.5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {slotEvents.map((evt, idx) => <EventChip key={idx} evt={evt} onClick={onEventClick} />)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ────── DAY VIEW ──────
const DayView = ({ currentDate, events, onSlotClick, onEventClick }) => {
  const dayEvents = events.filter(e => {
    const { start, end } = getEventDates(e);
    return currentDate.isBetween(start, end, 'day', '[]');
  });
  const allDayEvents = dayEvents.filter(e => e.allDay);
  const timedEvents = dayEvents.filter(e => !e.allDay).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day header */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-3 mb-2">
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl ${currentDate.isSame(dayjs(), 'day') ? 'bg-primary' : 'bg-white/5'}`}>
          <span className="text-[10px] font-semibold uppercase opacity-70">{currentDate.format('ddd')}</span>
          <span className="text-2xl font-bold leading-none">{currentDate.format('D')}</span>
        </div>
        <div>
          <div className="font-semibold">{currentDate.format('MMMM YYYY')}</div>
          <div className="text-xs text-white/50">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} today</div>
        </div>
        <button
          onClick={() => onSlotClick && onSlotClick(currentDate.format('YYYY-MM-DD'))}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-all"
        >
          <Plus size={14} /> Add event
        </button>
      </div>

      {allDayEvents.length > 0 && (
        <div className="mb-3 px-1">
          <div className="text-xs text-white/40 mb-1">All day</div>
          <div className="flex flex-col gap-1">{allDayEvents.map((e, i) => <EventChip key={i} evt={e} onClick={onEventClick} />)}</div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {HOURS.map(hour => {
          const slotEvents = timedEvents.filter(e => parseInt((e.startTime || '00:00').split(':')[0]) === hour);
          return (
            <div key={hour} className="flex gap-3 border-b border-white/5 min-h-[56px] group">
              <div className="w-16 flex-shrink-0 text-[11px] text-white/30 text-right pt-1 pr-3">
                {hour === 0 ? '12 AM' : dayjs().hour(hour).minute(0).format('h A')}
              </div>
              <div
                className="flex-1 py-0.5 hover:bg-white/5 cursor-pointer transition-colors rounded-lg"
                onClick={() => onSlotClick && onSlotClick(currentDate.format('YYYY-MM-DD'))}
              >
                {slotEvents.map((e, i) => <EventChip key={i} evt={e} onClick={onEventClick} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ────── AGENDA VIEW ──────
const AgendaView = ({ currentDate, events, onEventClick }) => {
  const sorted = [...events]
    .filter(e => getEventDates(e).start.isSame(currentDate, 'month') || getEventDates(e).start.isAfter(currentDate.startOf('month')))
    .sort((a, b) => getEventDates(a).start.valueOf() - getEventDates(b).start.valueOf());

  const grouped = sorted.reduce((acc, evt) => {
    const key = getEventDates(evt).start.format('YYYY-MM-DD');
    if (!acc[key]) acc[key] = [];
    acc[key].push(evt);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/30">
        <CalendarDays size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide space-y-6 pr-1">
      {Object.entries(grouped).map(([dateKey, dayEvts]) => {
        const d = dayjs(dateKey);
        const isToday = d.isSame(dayjs(), 'day');
        return (
          <div key={dateKey}>
            <div className={`flex items-center gap-3 mb-3 sticky top-0 py-1 z-10 ${isToday ? 'text-primary' : 'text-white/60'}`}
              style={{ background: 'rgba(13,13,18,0.95)' }}>
              <div className={`flex flex-col items-center w-12 h-12 rounded-xl border justify-center flex-shrink-0 ${isToday ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10'}`}>
                <span className="text-[10px] font-bold uppercase">{d.format('MMM')}</span>
                <span className="text-lg font-bold leading-none">{d.format('D')}</span>
              </div>
              <div>
                <div className="font-semibold text-sm">{d.format('dddd')}</div>
                <div className="text-xs opacity-60">{dayEvts.length} event{dayEvts.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="space-y-2 pl-3 border-l border-white/10">
              {dayEvts.map((evt, i) => {
                const dot = CATEGORY_DOT[evt.eventType] || CATEGORY_DOT['Other'];
                return (
                  <div key={i}
                    onClick={() => onEventClick && onEventClick(evt)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-all group">
                    <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: dot }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{evt.planTitle || evt.title}</div>
                      <div className="text-xs text-white/50 mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={11} /> {evt.allDay ? 'All Day' : `${evt.startTime || '--'} – ${evt.endTime || '--'}`}</span>
                        {evt.location && <span className="flex items-center gap-1"><MapPin size={11} /> {evt.location}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[evt.eventType] || CATEGORY_COLORS['Other']}`}>
                      {evt.eventType}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ────── MAIN COMPONENT ──────
const MyCalendar = () => {
  const { userProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('Month');
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/myevents');
      setEvents(res.data);
    } catch (error) {
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  const createEmptyModalData = (date) => ({
    planTitle: '', description: '', planDate: date || selectedDate.format('YYYY-MM-DD'),
    startTime: '09:00', endTime: '10:00', estimatedDuration: '', category: '',
    priority: 'Medium', status: 'Pending', project: '', module: '', task: '',
    dailyGoal: '', expectedOutcome: '', checklistItems: [], reminderDate: '',
    reminderTime: '', location: '', meetingLink: '', notes: '', tags: [],
    progress: 0, plannedHours: '', workedHours: '', breakStartTime: '', breakEndTime: '',
    energyLevel: 'Medium', todaysAchievement: '', challenges: '', tomorrowsPlan: '',
  });

  const openNewEventModal = (date) => { setModalData(createEmptyModalData(date)); setShowModal(true); };
  const openEditEventModal = (evt) => { setModalData({ ...evt }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setModalData(null); };

  const handleSaveModal = async (eventData, documentFile) => {
    try {
      const payload = { ...eventData, checklistItems: eventData.checklistItems || [], tags: eventData.tags || [], attachments: eventData.attachments || [], progress: eventData.progress ?? 0 };
      if (documentFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v === undefined || v === null) return; fd.append(k, Array.isArray(v) || typeof v === 'object' ? JSON.stringify(v) : v); });
        fd.append('document', documentFile);
        eventData.id ? await api.put(`/myevents/${eventData.id}`, fd) : await api.post('/myevents', fd);
      } else {
        eventData.id ? await api.put(`/myevents/${eventData.id}`, payload) : await api.post('/myevents', payload);
      }
      toast.success(eventData.id ? 'Updated!' : 'Saved!');
      setShowModal(false);
      fetchEvents();
    } catch { toast.error('Unable to save.'); }
  };

  const handleDeleteModal = async (id) => {
    if (!id) { closeModal(); return; }
    try { await api.delete(`/myevents/${id}`); toast.success('Deleted'); closeModal(); fetchEvents(); }
    catch { toast.error('Unable to delete.'); }
  };

  // Navigation title per view
  const navTitle = useMemo(() => {
    if (viewMode === 'Week') {
      const monday = currentDate.startOf('week').add(1, 'day');
      const sunday = monday.add(6, 'day');
      return monday.isSame(sunday, 'month')
        ? `${monday.format('MMM D')} – ${sunday.format('D, YYYY')}`
        : `${monday.format('MMM D')} – ${sunday.format('MMM D, YYYY')}`;
    }
    if (viewMode === 'Day') return currentDate.format('dddd, D MMMM YYYY');
    return currentDate.format('MMMM YYYY');
  }, [viewMode, currentDate]);

  const navigate = (dir) => {
    const unit = viewMode === 'Day' ? 'day' : viewMode === 'Week' ? 'week' : 'month';
    setCurrentDate(d => dir > 0 ? d.add(1, unit) : d.subtract(1, unit));
  };

  // Mini calendar
  const miniStart = currentDate.startOf('month').subtract((currentDate.startOf('month').day() + 6) % 7, 'day');
  const miniEnd = currentDate.endOf('month').add((7 - currentDate.endOf('month').day()) % 7, 'day');
  const miniDays = [];
  let md = miniStart;
  while (md.isBefore(miniEnd) || md.isSame(miniEnd, 'day')) { miniDays.push(md); md = md.add(1, 'day'); }

  const getCategoryCount = (type) => events.filter(e => e.eventType === type).length;
  const todayEvents = events.filter(e => { const { start, end } = getEventDates(e); return selectedDate.isBetween(start, end, 'day', '[]'); }).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  const upcomingEvents = events.filter(e => getEventDates(e).start.isAfter(selectedDate, 'day')).sort((a, b) => getEventDates(a).start.valueOf() - getEventDates(b).start.valueOf()).slice(0, 4);

  return (
    <div className="flex flex-col xl:flex-row h-full w-full min-h-0 text-white py-4 px-0 gap-6 overflow-hidden font-sans">

      {/* ───── LEFT SIDEBAR ───── */}
      <div className="w-full xl:w-[260px] flex-shrink-0 flex flex-col gap-5 min-h-0 overflow-y-auto scrollbar-hide pb-4">

        {/* Mini Calendar */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{currentDate.format('MMMM YYYY')}</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full"><ChevronLeft size={14} /></button>
              <button onClick={() => navigate(1)} className="p-1 hover:bg-white/10 rounded-full"><ChevronRight size={14} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] mb-1 text-white/40 font-medium">
            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
            {miniDays.map((d, i) => {
              const isCurrentMonth = d.isSame(currentDate, 'month');
              const isToday = d.isSame(dayjs(), 'day');
              const isSelected = d.isSame(selectedDate, 'day');
              return (
                <button key={i} onClick={() => { setSelectedDate(d); setCurrentDate(d); }}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all
                    ${!isCurrentMonth ? 'text-white/20' : 'text-white/70'}
                    ${isSelected ? 'bg-primary text-white font-bold shadow-md shadow-primary/30' : 'hover:bg-white/10'}
                    ${isToday && !isSelected ? 'ring-1 ring-primary text-primary' : ''}`}>
                  {d.format('D')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-xs font-semibold mb-2 text-white/50 tracking-widest uppercase">Quick Actions</h4>
          <div className="flex flex-col gap-1.5">
            {[
              { icon: CalendarPlus, label: 'Add Event', color: 'text-blue-400', action: () => openNewEventModal() },
              { icon: Video, label: 'Schedule Meeting', color: 'text-purple-400', action: () => openNewEventModal() },
              { icon: Briefcase, label: 'Client Call', color: 'text-emerald-400', action: () => openNewEventModal() },
              { icon: Palmtree, label: 'Apply Leave', color: 'text-amber-400', action: () => openNewEventModal() },
            ].map(({ icon: Icon, label, color, action }) => (
              <button key={label} onClick={action} className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium ${color}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* My Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-white/50 tracking-widest uppercase">Categories</h4>
          </div>
          <div className="flex flex-col gap-0.5">
            {EVENT_TYPES.map(type => {
              const count = getCategoryCount(type);
              const dot = CATEGORY_DOT[type] || '#64748b';
              return (
                <div key={type} className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                    <span className="text-sm text-white/70">{type}</span>
                  </div>
                  <span className="text-xs text-white/40 font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── CENTER ───── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => { setCurrentDate(dayjs()); setSelectedDate(dayjs()); }}
              className="px-3 py-1.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/10 transition-all">
              Today
            </button>
            <div className="flex items-center gap-0.5 border border-white/10 rounded-xl p-0.5">
              <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all"><ChevronLeft size={16} /></button>
              <button onClick={() => navigate(1)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all"><ChevronRight size={16} /></button>
            </div>
            <h2 className="text-xl font-bold">{navTitle}</h2>
          </div>

          <div className="flex items-center gap-0.5 border border-white/10 rounded-xl p-0.5 bg-black/20">
            {VIEWS.map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${viewMode === v ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* View Renderer */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-white/40 text-sm">Loading events…</div>
        ) : viewMode === 'Month' ? (
          <MonthView currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} events={events}
            onDayClick={openNewEventModal} onEventClick={openEditEventModal} />
        ) : viewMode === 'Week' ? (
          <WeekView currentDate={currentDate} events={events} onSlotClick={openNewEventModal} onEventClick={openEditEventModal} />
        ) : viewMode === 'Day' ? (
          <DayView currentDate={currentDate} events={events} onSlotClick={openNewEventModal} onEventClick={openEditEventModal} />
        ) : (
          <AgendaView currentDate={currentDate} events={events} onEventClick={openEditEventModal} />
        )}
      </div>

      {/* ───── RIGHT SIDEBAR ───── */}
      <div className="w-full xl:w-[300px] flex-shrink-0 flex flex-col gap-5 min-h-0 overflow-y-auto scrollbar-hide pb-4">

        <button onClick={() => openNewEventModal(selectedDate.format('YYYY-MM-DD'))}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-primary/25 transition-all">
          <Plus size={18} /> New Event
        </button>

        {/* Schedule */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-lg">
          <h4 className="font-bold mb-0.5">Schedule</h4>
          <p className="text-xs text-white/50 mb-4">{selectedDate.format('dddd, D MMMM YYYY')}</p>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-4">No events for this day.</p>
          ) : (
            <div className="flex flex-col gap-3 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-white/10">
              {todayEvents.map((evt, i) => {
                const dot = CATEGORY_DOT[evt.eventType] || CATEGORY_DOT['Other'];
                return (
                  <div key={i} className="relative pl-6 cursor-pointer" onClick={() => openEditEventModal(evt)}>
                    <div className="absolute left-[5px] top-2 w-2 h-2 rounded-full ring-4 ring-[#0d0d12]" style={{ background: dot }} />
                    <div className="text-[11px] font-semibold text-white/60">{evt.allDay ? 'All Day' : evt.startTime}</div>
                    <div className="text-sm font-bold mt-0.5 truncate">{evt.planTitle || evt.title}</div>
                    <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {evt.allDay ? 'All Day Event' : `${evt.startTime} – ${evt.endTime}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="w-full text-center text-xs font-semibold text-primary mt-4 hover:underline">View full schedule →</button>
        </div>

        {/* Upcoming */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-lg">
          <h4 className="font-bold mb-4">Upcoming</h4>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-2">No upcoming events.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((evt, i) => {
                const dot = CATEGORY_DOT[evt.eventType] || CATEGORY_DOT['Other'];
                const { start } = getEventDates(evt);
                return (
                  <div key={i} className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => openEditEventModal(evt)}>
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl w-11 h-11 border border-white/5 flex-shrink-0">
                      <span className="text-[9px] font-bold text-white/40 uppercase">{start.format('MMM')}</span>
                      <span className="text-sm font-bold text-primary">{start.format('D')}</span>
                    </div>
                    <div className="flex flex-col justify-center pl-2 w-full border-l-2 min-w-0" style={{ borderLeftColor: dot }}>
                      <div className="text-sm font-bold truncate">{evt.planTitle || evt.title}</div>
                      <div className="text-xs text-white/40 mt-0.5 truncate">{evt.allDay ? 'All Day' : `${evt.startTime} – ${evt.endTime}`}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {upcomingEvents.length > 0 && (
            <button className="w-full text-center text-xs font-semibold text-primary mt-4 hover:underline">View all →</button>
          )}
        </div>

        {/* Event Detail Card */}
        {(todayEvents.length > 0 || upcomingEvents.length > 0) && (() => {
          const evt = todayEvents[0] || upcomingEvents[0];
          const dot = CATEGORY_DOT[evt.eventType] || CATEGORY_DOT['Other'];
          return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 shadow-lg">
              <h4 className="font-bold mb-3">Event Details</h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: dot + '20', color: dot }}>
                  <CalendarDays size={18} />
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-sm truncate">{evt.planTitle || evt.title}</h5>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{evt.eventType}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex gap-2 items-center"><CalendarDays size={12} className="text-white/30 flex-shrink-0" /> {dayjs(getEventDates(evt).start).format('ddd, D MMM YYYY')}</div>
                <div className="flex gap-2 items-center"><Clock size={12} className="text-white/30 flex-shrink-0" /> {evt.allDay ? 'All Day' : `${evt.startTime} – ${evt.endTime}`}</div>
                {evt.location && <div className="flex gap-2 items-center"><MapPin size={12} className="text-white/30 flex-shrink-0" /> {evt.location}</div>}
                {evt.participants?.length > 0 && (
                  <div className="flex gap-2 items-center">
                    <Users size={12} className="text-white/30 flex-shrink-0" />
                    <div className="flex items-center gap-0.5">
                      {evt.participants.slice(0, 4).map(p => (
                        <div key={p} className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[9px] font-bold" title={p}>{p.charAt(0)}</div>
                      ))}
                      {evt.participants.length > 4 && <div className="w-5 h-5 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-[9px]">+{evt.participants.length - 4}</div>}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 text-xs font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition-all">View</button>
                <button onClick={() => openEditEventModal(evt)} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 transition-all">Edit</button>
              </div>
            </div>
          );
        })()}
      </div>

      {showModal && (
        <MyCalendarEventModal
          key={`${modalData?.id ?? 'new'}-${modalData?.planDate ?? selectedDate.format('YYYY-MM-DD')}`}
          open={showModal}
          onClose={closeModal}
          initialData={modalData}
          onSave={handleSaveModal}
          onDelete={handleDeleteModal}
        />
      )}
    </div>
  );
};

export default MyCalendar;
