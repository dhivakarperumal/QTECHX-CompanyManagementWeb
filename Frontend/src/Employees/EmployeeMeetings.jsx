import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Video, Clock, MapPin, CalendarDays, ExternalLink, Search, 
  LayoutGrid, List, SlidersHorizontal, X, Loader2, Calendar, RefreshCw
} from 'lucide-react';
import dayjs from 'dayjs';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

const EmployeeMeetings = () => {
  const location = useLocation();
  const { user, profileName } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [customDate, setCustomDate] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);

  const isUpcomingRoute = location.pathname.includes('/upcoming');

  const fetchMeetings = async () => {
    setLoading(true);
    setError('');
    try {
      const [resPersonal, resOffice] = await Promise.all([
        api.get('/myevents').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] }))
      ]);
      
      const possibleIds = [user?.id, user?._id, user?.userId, user?.employee_id, user?.employeeId, user?.user_id, user?.uuid].filter(Boolean).map(String);
      const userName = profileName || user?.name || user?.full_name || user?.username || '';
      
      let personalEvents = resPersonal.data || [];
      let officeEvents = resOffice.data || [];
      
      if (possibleIds.length > 0) {
        personalEvents = personalEvents.filter(evt => {
          const evtUserId = String(evt.user_id || evt.userId || evt.employeeId);
          return possibleIds.includes(evtUserId);
        });
        
        officeEvents = officeEvents.filter(evt => {
          let parts = evt.participants;
          if (!parts) return false;
          if (typeof parts === 'string') {
            try { parts = JSON.parse(parts); } catch (e) { return false; }
          }
          if (!Array.isArray(parts)) return false;
          
          return parts.some(p => {
            if (typeof p === 'object' && p !== null) {
              const pId1 = String(p.user_id);
              const pId2 = String(p.employee_id);
              const matchById = possibleIds.includes(pId1) || possibleIds.includes(pId2);
              const matchByName = userName && p.name && p.name.toLowerCase() === userName.toLowerCase();
              return matchById || matchByName;
            }
            return typeof p === 'string' && userName && p.toLowerCase() === userName.toLowerCase();
          });
        });
      }
      
      const allEvents = [...personalEvents, ...officeEvents];
      
      let filteredMeetings = allEvents.filter(e => {
        const typeStr = String(e.eventType || e.category || '').toLowerCase();
        return typeStr.includes('meeting') || typeStr.includes('meating') || typeStr.includes('call');
      });
      
      filteredMeetings.sort((a, b) => {
        const dateA = a.planDate || a.startDate || a.plan_date;
        const dateB = b.planDate || b.startDate || b.plan_date;
        return dayjs(dateA).valueOf() - dayjs(dateB).valueOf();
      });

      setMeetings(filteredMeetings);
    } catch (error) {
      console.error(error);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [user]);

  const filteredData = meetings.filter(m => {
    const titleMatch = (m.planTitle || m.title || '').toLowerCase().includes(search.toLowerCase());
    const mDate = m.planDate || m.startDate || m.plan_date;
    const isUpcoming = dayjs(mDate).isAfter(dayjs().subtract(1, 'day'));
    
    if (isUpcomingRoute && !isUpcoming) return false;
    if (!titleMatch) return false;

    if (dateFilter === 'today') {
      return dayjs(mDate).isSame(dayjs(), 'day');
    }
    if (dateFilter === 'tomorrow') {
      return dayjs(mDate).isSame(dayjs().add(1, 'day'), 'day');
    }
    if (dateFilter === 'this_week') {
      return dayjs(mDate).isSame(dayjs(), 'week');
    }
    if (dateFilter === 'this_month') {
      return dayjs(mDate).isSame(dayjs(), 'month');
    }
    if (dateFilter === 'custom') {
      if (customDate.start && customDate.end) {
        return (dayjs(mDate).isAfter(dayjs(customDate.start).subtract(1, 'day')) && dayjs(mDate).isBefore(dayjs(customDate.end).add(1, 'day')));
      } else if (customDate.start) {
        return dayjs(mDate).isSame(dayjs(customDate.start), 'day');
      }
    }
    
    return true;
  });

  const totalMeetings = filteredData.length;
  const upcomingMeetings = filteredData.filter(m => {
    const d = m.planDate || m.startDate || m.plan_date;
    return dayjs(d).isAfter(dayjs().subtract(1, 'day'));
  }).length;
  const pastMeetings = totalMeetings - upcomingMeetings;

  const hasFilters = !!(dateFilter || search);
  const clearFilters = () => { setSearch(''); setDateFilter(''); setCustomDate({start:'', end:''}); };

  const stats = [
    { label: 'Total Meetings', value: totalMeetings,    icon: Video,      cls: 'text-blue-400',    bg: 'bg-blue-500/15'    },
    { label: 'Upcoming',       value: upcomingMeetings, icon: CalendarDays, cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Past',           value: pastMeetings,     icon: Clock,      cls: 'text-white/50',    bg: 'bg-white/10'       },
  ];

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Video size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isUpcomingRoute ? 'Upcoming Meetings' : 'All Meetings'}
            </h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${totalMeetings} meeting${totalMeetings !== 1 ? 's' : ''} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMeetings}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {[dateFilter, search].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'table' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Filter By</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition">
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Date Range</p>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'today', 'tomorrow', 'this_week', 'this_month', 'custom'].map(s => (
                  <button key={s} onClick={() => setDateFilter(dateFilter === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition capitalize ${dateFilter === s || (!dateFilter && s === 'all') ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            {dateFilter === 'custom' && (
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Custom Date</p>
                <div className="flex items-center gap-2">
                  <input type="date" value={customDate.start} onChange={e => setCustomDate({...customDate, start: e.target.value})} className="bg-black/20 border border-white/10 rounded-xl py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary/50 [&::-webkit-calendar-picker-indicator]:invert-[1] opacity-70" />
                  <span className="text-white/50 text-xs">to</span>
                  <input type="date" value={customDate.end} onChange={e => setCustomDate({...customDate, end: e.target.value})} className="bg-black/20 border border-white/10 rounded-xl py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary/50 [&::-webkit-calendar-picker-indicator]:invert-[1] opacity-70" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading meetings…</p>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex items-center justify-center py-20 text-white/30">
          <p className="text-base font-semibold text-rose-400">{error}</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Video size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No meetings found</p>
          <p className="text-xs mt-1">{hasFilters ? 'Try adjusting your filters.' : 'You have no scheduled meetings.'}</p>
        </div>
      )}

      {/* ── Table View ── */}
      {!loading && !error && filteredData.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Meeting</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Type</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Date</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Time</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((m, i) => {
                  const date = m.planDate || m.startDate || m.plan_date;
                  const isPast = dayjs(date).isBefore(dayjs(), 'day');
                  const type = m.eventType || m.category;
                  const link = m.meetingLink || m.link || (m.location && String(m.location).startsWith('http') ? m.location : null);
                  return (
                    <tr key={i} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${isPast ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white text-sm">{m.planTitle || m.title}</div>
                        {m.location && !String(m.location).startsWith('http') && (
                          <div className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                            <MapPin size={10} /> {m.location}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${type === 'Client Call' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'}`}>
                          {type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-white/70">
                         {dayjs(date).format('MMM D, YYYY')}
                      </td>
                      <td className="px-4 py-3.5 text-white/70">
                         {m.allDay ? 'All Day' : `${m.startTime || '--'} – ${m.endTime || '--'}`}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {link ? (
                          <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" 
                             className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold">
                            Join <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-xs text-white/30 italic">No Link</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Grid View ── */}
      {!loading && !error && filteredData.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredData.map((m, i) => {
             const date = m.planDate || m.startDate || m.plan_date;
             const isPast = dayjs(date).isBefore(dayjs(), 'day');
             const type = m.eventType || m.category;
             const link = m.meetingLink || m.link || (m.location && String(m.location).startsWith('http') ? m.location : null);
             
             return (
               <div key={i} className={`flex flex-col bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden transition hover:bg-white/[0.04] ${isPast ? 'opacity-60' : ''}`}>
                 <div className="p-5 border-b border-white/[0.04]">
                   <div className="flex justify-between items-start mb-3">
                     <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${type === 'Client Call' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'}`}>
                       {type}
                     </span>
                     {isPast && <span className="text-[10px] bg-white/10 text-white/50 px-2 py-1 rounded-md font-semibold border border-white/10">Past</span>}
                   </div>
                   <h3 className="font-bold text-base text-white line-clamp-1">{m.planTitle || m.title}</h3>
                   {m.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{m.description}</p>}
                 </div>
                 
                 <div className="p-5 space-y-3 flex-1">
                   <div className="flex items-center gap-3 text-xs text-white/60">
                     <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-white/40"><CalendarDays size={14}/></div>
                     <span>{dayjs(date).format('dddd, MMMM D, YYYY')}</span>
                   </div>
                   <div className="flex items-center gap-3 text-xs text-white/60">
                     <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-white/40"><Clock size={14}/></div>
                     <span>{m.allDay ? 'All Day' : `${m.startTime || '--'} – ${m.endTime || '--'}`}</span>
                   </div>
                   {m.location && !String(m.location).startsWith('http') && (
                     <div className="flex items-center gap-3 text-xs text-white/60">
                       <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-white/40"><MapPin size={14}/></div>
                       <span className="truncate">{m.location}</span>
                     </div>
                   )}
                 </div>
                 
                 <div className="p-5 pt-0 mt-auto">
                   {link ? (
                     <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" 
                        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-primary/25">
                       Join Meeting <ExternalLink size={14} />
                     </a>
                   ) : (
                     <button disabled className="w-full py-2.5 rounded-xl bg-white/5 text-white/30 text-sm font-semibold border border-white/10 cursor-not-allowed">
                       No Link Provided
                     </button>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeMeetings;
