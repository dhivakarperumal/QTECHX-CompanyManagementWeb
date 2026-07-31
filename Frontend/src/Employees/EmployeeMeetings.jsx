import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Video, Clock, MapPin, CalendarDays, ExternalLink, Search } from 'lucide-react';
import dayjs from 'dayjs';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import { PacmanLoader } from 'react-spinners';

const EmployeeMeetings = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const isUpcomingRoute = location.pathname.includes('/upcoming');

  useEffect(() => {
    fetchMeetings();
  }, [user]);

  const fetchMeetings = async () => {
    try {
      const [resPersonal, resOffice] = await Promise.all([
        api.get('/myevents').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] }))
      ]);
      
      const userId = user?.id || user?._id || user?.userId || user?.employee_id || user?.employeeId || user?.user_id;
      const userName = user?.profileName || user?.name || '';
      
      let personalEvents = resPersonal.data || [];
      let officeEvents = resOffice.data || [];
      
      if (userId) {
        // Filter personal events
        personalEvents = personalEvents.filter(evt => {
          const evtUserId = evt.user_id || evt.userId || evt.employeeId;
          return String(evtUserId) === String(userId);
        });
        
        // Filter office events where the user is a participant
        officeEvents = officeEvents.filter(evt => {
          let parts = evt.participants;
          if (!parts) return false;
          if (typeof parts === 'string') {
            try { parts = JSON.parse(parts); } catch (e) { return false; }
          }
          if (!Array.isArray(parts)) return false;
          
          return parts.some(p => {
            if (typeof p === 'object' && p !== null) {
              return String(p.user_id) === String(userId);
            }
            return typeof p === 'string' && userName && p.toLowerCase() === userName.toLowerCase();
          });
        });
      }
      
      const allEvents = [...personalEvents, ...officeEvents];
      
      // Filter only meetings (Meeting, Client Call, or typos like Meating)
      let filteredMeetings = allEvents.filter(e => {
        const typeStr = String(e.eventType || e.category || '').toLowerCase();
        return typeStr.includes('meeting') || typeStr.includes('meating') || typeStr.includes('call');
      });
      
      // Sort by date/time ascending
      filteredMeetings.sort((a, b) => {
        const dateA = a.planDate || a.startDate || a.plan_date;
        const dateB = b.planDate || b.startDate || b.plan_date;
        return dayjs(dateA).valueOf() - dayjs(dateB).valueOf();
      });

      setMeetings(filteredMeetings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = meetings.filter(m => {
    const titleMatch = (m.planTitle || m.title || '').toLowerCase().includes(search.toLowerCase());
    const isUpcoming = dayjs(m.planDate || m.startDate || m.plan_date).isAfter(dayjs().subtract(1, 'day'));
    
    if (isUpcomingRoute && !isUpcoming) return false;
    return titleMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/30">
            <Video size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {isUpcomingRoute ? 'Upcoming Meetings' : 'All Meetings'}
            </h1>
            <p className="text-xs text-white/50">View and join your scheduled meetings</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="Search meetings..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <PacmanLoader color="#ef4444" size={20} />
             <p className="text-white/40 text-xs font-medium">Loading meetings...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <Video size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No meetings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredData.map((m, i) => {
               const date = m.planDate || m.startDate || m.plan_date;
               const isPast = dayjs(date).isBefore(dayjs(), 'day');
               const type = m.eventType || m.category;
               
               return (
                 <div key={i} className={`flex flex-col bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20 hover:shadow-lg ${isPast ? 'opacity-70' : ''}`}>
                   {/* Card Header */}
                   <div className="p-4 border-b border-white/5">
                     <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${type === 'Client Call' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                         {type}
                       </span>
                       {isPast && <span className="text-[10px] bg-white/10 text-white/50 px-2 py-1 rounded-md font-semibold">Past</span>}
                     </div>
                     <h3 className="font-bold text-base text-white line-clamp-1">{m.planTitle || m.title}</h3>
                     {m.description && <p className="text-xs text-white/50 mt-1 line-clamp-2">{m.description}</p>}
                   </div>
                   
                   {/* Details */}
                   <div className="p-4 space-y-3 flex-1">
                     <div className="flex items-center gap-3 text-xs text-white/70">
                       <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-white/50"><CalendarDays size={14}/></div>
                       <span>{dayjs(date).format('dddd, MMMM D, YYYY')}</span>
                     </div>
                     <div className="flex items-center gap-3 text-xs text-white/70">
                       <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-white/50"><Clock size={14}/></div>
                       <span>{m.allDay ? 'All Day' : `${m.startTime || '--'} – ${m.endTime || '--'}`}</span>
                     </div>
                     {m.location && (
                       <div className="flex items-center gap-3 text-xs text-white/70">
                         <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-white/50"><MapPin size={14}/></div>
                         <span className="truncate">{m.location}</span>
                       </div>
                     )}
                   </div>
                   
                   {/* Action */}
                   <div className="p-4 pt-0 mt-auto">
                     {m.meetingLink ? (
                       <a href={m.meetingLink.startsWith('http') ? m.meetingLink : `https://${m.meetingLink}`} target="_blank" rel="noreferrer" 
                          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                         Join Meeting <ExternalLink size={14} />
                       </a>
                     ) : (
                       <button disabled className="w-full py-2.5 rounded-xl bg-white/5 text-white/30 text-sm font-semibold border border-white/5 cursor-not-allowed">
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
    </div>
  );
};

export default EmployeeMeetings;
