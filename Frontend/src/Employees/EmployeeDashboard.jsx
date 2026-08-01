import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, CalendarOff, FolderKanban, CheckSquare, Clock,
  DollarSign, Video, TrendingUp, AlertCircle, CheckCircle2, Timer,
  CalendarDays, Loader2
} from 'lucide-react';
import { useAuth } from '../PrivateRouter/AuthContext';
import api from '../api';

/* ── stat card ── */
const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className={`flex items-center gap-4 rounded-2xl p-5 ${bg} border border-white/10`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shrink-0`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-white/50 text-xs font-medium">{label}</p>
      <p className="text-white text-2xl font-bold leading-tight">{value}</p>
      {sub && <p className="text-white/40 text-[11px] mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ── task row ── */
const TaskRow = ({ title, project, status, due }) => {
  const statusStyles = {
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Pending':     'bg-yellow-500/20 text-yellow-400',
    'Done':        'bg-green-500/20 text-green-400',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{title}</p>
        <p className="text-white/40 text-xs mt-0.5">{project}</p>
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[status] || statusStyles['Pending']}`}>
          {status}
        </span>
        <span className="text-white/30 text-xs hidden sm:block">{due}</span>
      </div>
    </div>
  );
};

/* ── leave row ── */
const LeaveRow = ({ type, dates, status }) => {
  const s = {
    Approved: { cls: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    Pending:  { cls: 'bg-yellow-500/20 text-yellow-400', icon: Timer },
    Rejected: { cls: 'bg-red-500/20 text-red-400', icon: AlertCircle },
  }[status] || { cls: 'bg-gray-500/20 text-gray-400', icon: Timer };
  const Icon = s.icon;
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{type}</p>
        <p className="text-white/40 text-xs mt-0.5">{dates}</p>
      </div>
      <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
        <Icon size={11} /> {status}
      </span>
    </div>
  );
};

/* ── helpers ── */
const isSameDay = (val) => {
  if (!val) return false;
  const d = new Date(val);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const getBadgeStatus = (st) => {
  if (['Completed', 'Done'].includes(st)) return 'Done';
  if (['In Progress', 'Review', 'Testing'].includes(st)) return 'In Progress';
  return 'Pending';
};

/* ── main ── */
const EmployeeDashboard = () => {
  const { userProfile, user } = useAuth();
  const name = userProfile?.displayName?.split(' ')[0] || userProfile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Employee';
  const employeeId = user?.employee_id || user?.employeeId || user?.user_id || userProfile?.employee_id || user?.id;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tasks: { today: [], assigned: 0, completed: 0, overdue: 0 },
    leaves: { recent: [], pendingCount: 0 },
    meetings: { todayCount: 0, upcoming: [] },
    projects: { activeList: [], activeCount: 0 },
    attendance: { checkIn: null, presentDays: 0, absentDays: 0, hoursThisWeek: 0 },
    payroll: { nextPayDate: 'N/A', nextSalary: 'N/A' }
  });

  useEffect(() => {
    if (!employeeId) return;

    const fetchAllData = async () => {
      setLoading(true);
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const todayStr = today.toISOString().slice(0, 10);

      try {
        const [
          tasksRes,
          leavesRes,
          eventsRes,
          myEventsRes,
          projectsAssignRes,
          projectsAllRes,
          attendanceRes,
          salaryRes
        ] = await Promise.allSettled([
          api.get('/tasks', { params: { page: 1, limit: 1000, assigned_to: employeeId } }),
          api.get('/employee-leaves/my-leaves'),
          api.get('/events'),
          api.get('/myevents'),
          api.get('/projects/assignments/all?limit=1000'),
          api.get('/projects?limit=1000&page=1'),
          api.get(`/attendance/${employeeId}?month=${month}&year=${year}`),
          api.get('/salary/history')
        ]);

        const newData = {
          tasks: { today: [], assigned: 0, completed: 0, overdue: 0 },
          leaves: { recent: [], pendingCount: 0 },
          meetings: { todayCount: 0, upcoming: [] },
          projects: { activeList: [], activeCount: 0 },
          attendance: { checkIn: null, presentDays: 0, absentDays: 0, hoursThisWeek: 0 },
          payroll: { nextPayDate: 'N/A', nextSalary: 'N/A' }
        };

        // --- TASKS ---
        if (tasksRes.status === 'fulfilled') {
          const tasks = tasksRes.value?.data?.data || [];
          newData.tasks.assigned = tasks.length;
          newData.tasks.completed = tasks.filter(t => ['Completed', 'Done'].includes(t.status)).length;
          newData.tasks.overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < today && !['Completed', 'Done'].includes(t.status)).length;
          newData.tasks.today = tasks.filter(t => isSameDay(t.assignment_date) || isSameDay(t.created_at)).slice(0, 5);
        }

        // --- LEAVES ---
        if (leavesRes.status === 'fulfilled') {
          const leaves = leavesRes.value?.data?.data || leavesRes.value?.data || [];
          newData.leaves.pendingCount = leaves.filter(l => l.status === 'Pending').length;
          newData.leaves.recent = leaves.slice(0, 4);
        }

        // --- MEETINGS ---
        const possibleIds = [user?.id, user?._id, user?.userId, user?.employee_id, user?.employeeId, user?.user_id, user?.uuid].filter(Boolean).map(String);
        const userName = (userProfile?.displayName || userProfile?.name || user?.name || user?.full_name || user?.username || '').toLowerCase();
        
        let personalEvents = eventsRes.status === 'fulfilled' ? (eventsRes.value?.data?.data || eventsRes.value?.data || []) : [];
        let officeEvents = myEventsRes.status === 'fulfilled' ? (myEventsRes.value?.data?.data || myEventsRes.value?.data || []) : [];
        
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
                const matchById = possibleIds.includes(String(p.user_id)) || possibleIds.includes(String(p.employee_id));
                const matchByName = userName && p.name && p.name.toLowerCase() === userName;
                return matchById || matchByName;
              }
              return typeof p === 'string' && userName && p.toLowerCase() === userName;
            });
          });
        }
        
        const allEvents = [...personalEvents, ...officeEvents];
        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id || e.uuid, e])).values());
        
        const filteredMeetings = uniqueEvents.filter(e => {
          const typeStr = String(e.eventType || e.category || '').toLowerCase();
          return typeStr.includes('meeting') || typeStr.includes('meating') || typeStr.includes('call');
        });
        
        const upcomingEvents = filteredMeetings.filter(e => {
          const mDate = e.planDate || e.startDate || e.plan_date || e.start_time || e.date;
          return mDate && new Date(mDate) >= new Date().setHours(0,0,0,0);
        }).sort((a,b) => {
          const dateA = a.planDate || a.startDate || a.plan_date || a.start_time || a.date;
          const dateB = b.planDate || b.startDate || b.plan_date || b.start_time || b.date;
          return new Date(dateA) - new Date(dateB);
        });
        
        newData.meetings.todayCount = upcomingEvents.filter(e => {
          const mDate = e.planDate || e.startDate || e.plan_date || e.start_time || e.date;
          return isSameDay(mDate);
        }).length;
        newData.meetings.upcoming = upcomingEvents.slice(0, 3);

        // --- PROJECTS ---
        const allPrj = projectsAllRes.status === 'fulfilled' ? (projectsAllRes.value?.data?.data || projectsAllRes.value?.data || []) : [];
        const grouped = projectsAssignRes.status === 'fulfilled' ? (projectsAssignRes.value?.data?.grouped || []) : [];
        
        const assignedUuids = new Set(
          grouped
            .filter(g => g.employees?.some(e => String(e.employee_id) === String(employeeId)))
            .map(g => g.project_uuid)
        );
        
        const myProjects = allPrj.filter(p => 
          assignedUuids.has(p.uuid) || (p.project_manager && p.project_manager.toLowerCase() === userName)
        );
        
        const activeProjects = myProjects.filter(p => !['Completed', 'Archived', 'Cancelled'].includes(p.status || p.project?.status));
        newData.projects.activeCount = activeProjects.length;
        newData.projects.activeList = activeProjects.slice(0, 3).map(p => ({
          name: p.project_name || p.project?.project_name || 'Project',
          progress: p.completion_percentage || p.project?.completion_percentage || 0,
          due: formatDate(p.end_date || p.project?.end_date)
        }));

        // --- ATTENDANCE ---
        if (attendanceRes.status === 'fulfilled') {
          const records = attendanceRes.value?.data?.data || [];
          const present = records.filter(r => ['Present', 'Half Day', 'Late'].includes(r.attendance_status));
          
          newData.attendance.presentDays = present.length;
          // Estimate working days so far in month
          let workingDaysSoFar = 0;
          for (let d = 1; d <= today.getDate(); d++) {
            const date = new Date(year, month - 1, d);
            if (date.getDay() !== 0 && date.getDay() !== 6) workingDaysSoFar++; // excluding weekends
          }
          newData.attendance.absentDays = Math.max(0, workingDaysSoFar - present.length);

          const todayRec = records.find(r => (r.date === todayStr) || (r.attendance_date && String(r.attendance_date).startsWith(todayStr)));
          if (todayRec && todayRec.check_in_time) {
            newData.attendance.checkIn = todayRec.check_in_time;
          }
          
          // Hours this week (rough calculation for demo purposes)
          let weekHours = 0;
          const currentWeekStart = new Date(today);
          currentWeekStart.setDate(today.getDate() - today.getDay());
          present.forEach(r => {
             const rDate = new Date(r.date || r.attendance_date);
             if (rDate >= currentWeekStart && r.working_hours) {
                const match = r.working_hours.toString().match(/(\d+)h/);
                if (match) weekHours += parseInt(match[1]);
             }
          });
          newData.attendance.hoursThisWeek = weekHours;
        }

        // --- PAYROLL ---
        if (salaryRes.status === 'fulfilled') {
          const history = salaryRes.value?.data?.data || salaryRes.value?.data || [];
          if (history.length > 0) {
            const latest = history[0];
            newData.payroll.nextSalary = `₹${latest.net_payable || latest.net_salary || 0}`;
            // Predict next pay date as last day of current month
            const nextPay = new Date(year, month, 0);
            newData.payroll.nextPayDate = nextPay.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          } else {
             const nextPay = new Date(year, month, 0);
             newData.payroll.nextPayDate = nextPay.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
          }
        }

        setData(newData);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [employeeId]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-6">

      {/* ── GREETING BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg,#F8740E22,#F8740E08)', border: '1px solid rgba(248,116,14,0.25)' }}>
        <div className="absolute right-6 top-4 opacity-10">
          <TrendingUp size={100} />
        </div>
        <p className="text-primary text-sm font-semibold mb-1">{todayDateStr}</p>
        <h1 className="text-white text-2xl md:text-3xl font-bold">{greeting()}, {name}! 👋</h1>
        <p className="text-white/50 text-sm mt-1">Here's your work summary for today.</p>

        <div className="flex flex-wrap gap-4 mt-5">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-white text-sm font-medium">Checked In: <span className="text-green-400">{data.attendance.checkIn || 'Not yet'}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <CalendarDays size={16} className="text-blue-400" />
            <span className="text-white text-sm font-medium">Leave Balance: <span className="text-blue-400">N/A</span></span>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={ClipboardCheck} label="Attendance This Month" value={`${data.attendance.presentDays}`} sub={`${data.attendance.absentDays} days absent`} color="bg-green-500/20 text-green-400" bg="bg-white/5" />
        <StatCard icon={CheckSquare} label="Tasks Assigned" value={`${data.tasks.assigned}`} sub={`${data.tasks.completed} completed`} color="bg-blue-500/20 text-blue-400" bg="bg-white/5" />
        <StatCard icon={FolderKanban} label="Active Projects" value={`${data.projects.activeCount}`} sub="Currently ongoing" color="bg-primary/20 text-primary" bg="bg-white/5" />
        <StatCard icon={Clock} label="Hours This Week" value={`${data.attendance.hoursThisWeek}h`} sub="Tracked time" color="bg-purple-500/20 text-purple-400" bg="bg-white/5" />
        <StatCard icon={CalendarOff} label="Pending Leaves" value={`${data.leaves.pendingCount}`} sub="Awaiting approval" color="bg-yellow-500/20 text-yellow-400" bg="bg-white/5" />
        <StatCard icon={DollarSign} label="Next Pay Date" value={`${data.payroll.nextPayDate}`} sub={`Salary: ${data.payroll.nextSalary}`} color="bg-emerald-500/20 text-emerald-400" bg="bg-white/5" />
        <StatCard icon={Video} label="Meetings Today" value={`${data.meetings.todayCount}`} sub="Scheduled today" color="bg-pink-500/20 text-pink-400" bg="bg-white/5" />
        <StatCard icon={AlertCircle} label="Overdue Tasks" value={`${data.tasks.overdue}`} sub="Action needed" color="bg-red-500/20 text-red-400" bg="bg-white/5" />
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* My Tasks */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" /> Today's Assigned Tasks
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2"/> Loading tasks...</div>
            ) : data.tasks.today.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No tasks assigned for today.</div>
            ) : (
              data.tasks.today.map(t => (
                <TaskRow key={t.uuid || t.id} title={t.task_name} project={t.project_name || '—'} status={getBadgeStatus(t.status)} due={formatDate(t.due_date)} />
              ))
            )}
          </div>
        </div>

        {/* Leave Summary */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CalendarOff size={18} className="text-primary" /> My Recent Leaves
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2"/> Loading leaves...</div>
            ) : data.leaves.recent.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No recent leave records.</div>
            ) : (
              data.leaves.recent.map((l, i) => (
                 <LeaveRow key={l.id || i} type={l.leave_type || 'Leave'} dates={`${formatDate(l.from_date)} - ${formatDate(l.to_date)}`} status={l.status || 'Pending'} />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Video size={18} className="text-primary" /> Upcoming Meetings
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2"/> Loading meetings...</div>
            ) : data.meetings.upcoming.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No upcoming meetings.</div>
            ) : (
              data.meetings.upcoming.map((m, i) => {
                const mDate = new Date(m.start_time || m.date);
                const timeStr = mDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const dayStr = isSameDay(mDate) ? `Today ${timeStr}` : `${formatDate(mDate)} ${timeStr}`;
                const members = Array.isArray(m.attendees) ? m.attendees.length : (m.members || 1);
                return (
                  <div key={m.id || m.uuid || i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{m.title || m.event_name || 'Meeting'}</p>
                      <p className="text-white/40 text-xs mt-0.5">{dayStr}</p>
                    </div>
                    <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">
                      {members} Members
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-[300px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FolderKanban size={18} className="text-primary" /> Active Projects
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
             {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2"/> Loading projects...</div>
            ) : data.projects.activeList.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No active projects.</div>
            ) : (
              data.projects.activeList.map((p, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-white text-sm font-medium">{p.name}</p>
                    <span className="text-white/40 text-xs">Due {p.due}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, p.progress || 0))}%` }} />
                  </div>
                  <p className="text-white/40 text-xs mt-1">{p.progress || 0}% completed</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;