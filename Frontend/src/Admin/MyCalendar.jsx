import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import { useAuth } from '../PrivateRouter/AuthContext';
import {
  ChevronLeft, ChevronRight, Plus, Users, Clock, MapPin, Search, Bell, Settings,
  CalendarDays, Video, CalendarHeart, Palmtree, User, Target,
  CalendarPlus, Briefcase, FileText, CheckCircle2, MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EVENT_TYPES = [
  'Meeting', 'Client Call', 'Training', 'Deadline', 'Birthday', 'Holiday', 'Leave', 'Other'
];

const CATEGORY_COLORS = {
  'Meeting': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Client Call': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Training': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Deadline': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'Birthday': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Holiday': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Leave': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Other': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const CATEGORY_DOT = {
  'Meeting': 'bg-blue-500',
  'Client Call': 'bg-purple-500',
  'Training': 'bg-emerald-500',
  'Deadline': 'bg-rose-500',
  'Birthday': 'bg-pink-500',
  'Holiday': 'bg-emerald-500',
  'Leave': 'bg-amber-500',
  'Other': 'bg-slate-500',
};

const MyCalendar = () => {
  const { userProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Calendar Grid
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');
  
  const calendarDays = [];
  let day = startDate;
  while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
    calendarDays.push(day);
    day = day.add(1, 'day');
  }

  // Generate Mini Calendar Grid
  const miniCalendarDays = [];
  let mDay = startDate;
  while (mDay.isBefore(endDate) || mDay.isSame(endDate, 'day')) {
    miniCalendarDays.push(mDay);
    mDay = mDay.add(1, 'day');
  }

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs());
  };

  const getEventsForDay = (d) => {
    return events.filter(e => {
      const eStart = dayjs(e.startDate);
      const eEnd = dayjs(e.endDate);
      return d.isBetween(eStart, eEnd, 'day', '[]') || d.isSame(eStart, 'day');
    });
  };

  // Fake stats for Categories based on events
  const getCategoryCount = (type) => events.filter(e => e.eventType === type).length;

  // Today's schedule
  const todayEvents = getEventsForDay(selectedDate).sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return a.startTime?.localeCompare(b.startTime);
  });

  // Upcoming events
  const upcomingEvents = events.filter(e => dayjs(e.startDate).isAfter(selectedDate, 'day')).sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()).slice(0, 4);

  return (
    <div className="flex h-full w-full bg-[#0d0d12] text-white p-4 gap-6 rounded-3xl overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR */}
      <div className="w-[280px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-2 pb-10">
        
        {/* Mini Calendar */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{currentDate.format('MMMM YYYY')}</h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-full"><ChevronLeft size={16} /></button>
              <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-full"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-white/50 font-medium">
            {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {miniCalendarDays.map((d, i) => {
              const isCurrentMonth = d.isSame(currentDate, 'month');
              const isToday = d.isSame(dayjs(), 'day');
              const isSelected = d.isSame(selectedDate, 'day');
              
              return (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={`
                    h-8 w-8 rounded-full flex items-center justify-center transition-all
                    ${!isCurrentMonth ? 'text-white/20' : 'text-white/80'}
                    ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30' : 'hover:bg-white/10'}
                    ${isToday && !isSelected ? 'text-primary border border-primary/30' : ''}
                  `}
                >
                  {d.format('D')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-white/70 tracking-wide uppercase">Quick Actions</h4>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-blue-400 hover:text-blue-300">
              <CalendarPlus size={16} /> Add Event
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-purple-400 hover:text-purple-300">
              <Video size={16} /> Schedule Meeting
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-emerald-400 hover:text-emerald-300">
              <Briefcase size={16} /> Client Call
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-amber-400 hover:text-amber-300">
              <Palmtree size={16} /> Apply Leave
            </button>
          </div>
        </div>

        {/* My Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white/70 tracking-wide uppercase">My Categories</h4>
            <button className="text-xs text-primary hover:underline">Manage</button>
          </div>
          <div className="flex flex-col gap-1.5">
            {EVENT_TYPES.map(type => {
              const count = getCategoryCount(type);
              if (count === 0 && type === 'Other') return null;
              return (
                <div key={type} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT[type] || 'bg-slate-500'}`}></span>
                    <span className="text-sm text-white/80">{type}</span>
                  </div>
                  <span className="text-xs text-white/40 font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER CALENDAR GRID */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/5 border border-white/10 rounded-3xl p-5 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={goToToday} className="px-4 py-1.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/10 transition-all">
              Today
            </button>
            <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1">
              <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-lg"><ChevronLeft size={16} /></button>
              <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-lg"><ChevronRight size={16} /></button>
            </div>
            <h2 className="text-2xl font-bold ml-2">{currentDate.format('MMMM YYYY')}</h2>
          </div>
          
          <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1 bg-black/20">
            {['Month', 'Week', 'Day', 'Agenda'].map(view => (
              <button 
                key={view} 
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'Month' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-7 border-b border-white/10 pb-3 mb-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-sm font-semibold text-white/50 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {calendarDays.map((d, i) => {
            const isCurrentMonth = d.isSame(currentDate, 'month');
            const isToday = d.isSame(dayjs(), 'day');
            const dayEvents = getEventsForDay(d).slice(0, 3);
            const moreCount = getEventsForDay(d).length - 3;
            
            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(d)}
                className={`bg-[#0d0d12] p-2 flex flex-col hover:bg-white/5 transition-colors cursor-pointer border-r border-b border-white/5 group`}
              >
                <div className={`text-sm font-semibold mb-2 flex items-center justify-center w-7 h-7 rounded-full ${!isCurrentMonth ? 'text-white/20' : 'text-white/70'} ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'group-hover:text-white'}`}>
                  {d.format('D')}
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  {dayEvents.map((evt, idx) => {
                    const colorClass = CATEGORY_COLORS[evt.eventType] || CATEGORY_COLORS['Other'];
                    return (
                      <div key={idx} className={`px-2 py-1 rounded-md border text-[10px] truncate ${colorClass}`}>
                        <div className="font-semibold truncate">{evt.title}</div>
                        {!evt.allDay && evt.startTime && <div className="opacity-70 text-[9px]">{evt.startTime}</div>}
                      </div>
                    );
                  })}
                  {moreCount > 0 && <div className="text-[10px] text-white/40 pl-1 font-medium">+{moreCount} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-[320px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto scrollbar-hide pb-10">
        
        {/* Top Button */}
        <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-primary/25 transition-all">
          <Plus size={18} /> New Event
        </button>

        {/* Today's Schedule */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
          <h4 className="font-bold text-lg mb-1">Schedule</h4>
          <p className="text-xs text-white/50 mb-5">{selectedDate.format('dddd, D MMMM YYYY')}</p>
          
          {isLoading ? (
            <div className="text-center text-sm text-white/40 py-5">Loading...</div>
          ) : todayEvents.length === 0 ? (
            <div className="text-center text-sm text-white/40 py-5">No events for this day.</div>
          ) : (
            <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-white/5">
              {todayEvents.map((evt, i) => {
                const dotColor = CATEGORY_DOT[evt.eventType] || 'bg-slate-500';
                return (
                  <div key={i} className="relative pl-6">
                    <div className={`absolute left-[5px] top-1.5 w-2 h-2 rounded-full ring-4 ring-[#0d0d12] ${dotColor}`} />
                    <div className="text-xs font-semibold text-white/90">{evt.allDay ? 'All Day' : evt.startTime}</div>
                    <div className="text-sm font-bold mt-0.5">{evt.title}</div>
                    <div className="text-xs text-white/50 mt-1 flex items-center gap-1"><Clock size={12}/> {evt.allDay ? 'All Day Event' : `${evt.startTime} - ${evt.endTime}`}</div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="w-full text-center text-xs font-semibold text-primary mt-5 hover:underline">View full schedule →</button>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
          <h4 className="font-bold text-lg mb-4">Upcoming Events</h4>
          
          <div className="flex flex-col gap-4">
            {upcomingEvents.map((evt, i) => {
              const dotColor = CATEGORY_DOT[evt.eventType] || 'bg-slate-500';
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl w-12 h-12 border border-white/5 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-white/50 uppercase">{dayjs(evt.startDate).format('MMM')}</span>
                    <span className="text-sm font-bold text-primary">{dayjs(evt.startDate).format('DD')}</span>
                  </div>
                  <div className="flex flex-col justify-center relative pl-3 w-full border-l-2" style={{ borderLeftColor: dotColor }}>
                    <div className="text-sm font-bold truncate">{evt.title}</div>
                    <div className="text-xs text-white/50 mt-0.5 truncate">{evt.allDay ? 'All Day Event' : `${evt.startTime} - ${evt.endTime}`}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {upcomingEvents.length > 0 && <button className="w-full text-center text-xs font-semibold text-primary mt-5 hover:underline">View all events →</button>}
        </div>

        {/* Event Details Card (Demoing with first upcoming or today) */}
        {(todayEvents.length > 0 || upcomingEvents.length > 0) && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-lg">
             <h4 className="font-bold mb-4">Event Details</h4>
             
             {(()=>{
               const evt = todayEvents[0] || upcomingEvents[0];
               return (
                 <>
                   <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                       <CalendarDays size={20} />
                     </div>
                     <div>
                       <h5 className="font-bold text-sm leading-tight">{evt.title}</h5>
                       <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{evt.eventType}</span>
                     </div>
                   </div>
                   
                   <div className="space-y-3 text-xs text-white/70">
                     <div className="flex gap-3"><CalendarDays size={14} className="text-white/40" /> {dayjs(evt.startDate).format('ddd, D MMMM YYYY')}</div>
                     <div className="flex gap-3"><Clock size={14} className="text-white/40" /> {evt.allDay ? 'All Day' : `${evt.startTime} - ${evt.endTime}`}</div>
                     {evt.location && <div className="flex gap-3"><MapPin size={14} className="text-white/40" /> {evt.location}</div>}
                     {(evt.participants?.length > 0) && (
                       <div className="flex gap-3 items-start">
                         <Users size={14} className="text-white/40 mt-0.5" /> 
                         <div>
                           <div className="mb-1">{evt.participants.length} Participants</div>
                           <div className="flex flex-wrap gap-1">
                             {evt.participants.slice(0,4).map(p => (
                               <div key={p} className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold" title={p}>
                                 {p.charAt(0)}
                               </div>
                             ))}
                             {evt.participants.length > 4 && (
                               <div className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-[9px] font-bold">
                                 +{evt.participants.length - 4}
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                   
                   <div className="flex gap-2 mt-5">
                     <button className="flex-1 py-2 text-xs font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition-all">View Details</button>
                     <button className="flex-1 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Edit Event</button>
                   </div>
                 </>
               )
             })()}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyCalendar;
