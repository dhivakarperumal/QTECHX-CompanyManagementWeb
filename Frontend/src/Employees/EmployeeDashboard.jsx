import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, CalendarOff, FolderKanban, CheckSquare, Clock,
  DollarSign, Video, TrendingUp, AlertCircle, CheckCircle2, Timer,
  CalendarDays, Loader2
} from 'lucide-react';
import { useAuth } from '../PrivateRouter/AuthContext';
import api from '../api';
import dayjs from 'dayjs';

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

const TaskRow = ({ title, project, status, due }) => {
  const statusStyles = {
    'In Progress': 'bg-blue-500/20 text-blue-400',
    'Pending': 'bg-yellow-500/20 text-yellow-400',
    'Done': 'bg-green-500/20 text-green-400',
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

const LeaveRow = ({ type, dates, status }) => {
  const s = {
    Approved: { cls: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    Pending: { cls: 'bg-yellow-500/20 text-yellow-400', icon: Timer },
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

const isSameDay = (val) => {
  if (!val) return false;
  return dayjs(val).isSame(dayjs(), 'day');
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

const getEventDateValue = (event) =>
  event?.planDate || event?.startDate || event?.plan_date || event?.start_time || event?.date || event?.start || event?.event_date;

const EmployeeDashboard = () => {
  const { userProfile, user } = useAuth();
  const name = userProfile?.displayName?.split(' ')[0] || userProfile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || user?.username || 'Employee';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tasks: { today: [], assigned: 0, completed: 0, overdue: 0 },
    leaves: { recent: [], pendingCount: 0 },
    meetings: { todayCount: 0, upcoming: [] },
    projects: { activeList: [], activeCount: 0 },
    attendance: { checkIn: null, checkOut: null, presentDays: 0, absentDays: 0, hoursThisWeek: 0 },
    payroll: { nextPayDate: 'N/A', nextSalary: 'N/A' },
    leaveBalance: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const res = await api.get('/dashboard/employee');
        const payload = res?.data || {};
        console.log('[EmployeeDashboard] dedicated payload:', payload);

        setData({
          tasks: payload?.tasks || { today: [], assigned: 0, completed: 0, overdue: 0 },
          leaves: payload?.leaves || { recent: [], pendingCount: 0 },
          meetings: payload?.meetings || { todayCount: 0, upcoming: [] },
          projects: payload?.projects || { activeList: [], activeCount: 0 },
          attendance: payload?.attendance || { checkIn: null, checkOut: null, presentDays: 0, absentDays: 0, hoursThisWeek: 0 },
          payroll: payload?.payroll || { nextPayDate: 'N/A', nextSalary: 'N/A' },
          leaveBalance: Number(payload?.leaveBalance || 0),
        });
      } catch (err) {
        console.error('Employee dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.employee_id, user?.employeeId, user?.user_id, user?.id, user?.uuid, userProfile?.employee_id]);

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
            <span className="text-white text-sm font-medium">Check-in: <span className="text-green-400">{data.attendance.checkIn || 'Not yet'}</span> · Check-out: <span className="text-amber-400">{data.attendance.checkOut || 'Not yet'}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <CalendarDays size={16} className="text-blue-400" />
            <span className="text-white text-sm font-medium">Leave Balance: <span className="text-blue-400">{data.leaveBalance > 0 ? `${data.leaveBalance} days left` : '0 days left'}</span></span>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col min-h-75">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" /> Today's Assigned Tasks
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2" /> Loading tasks...</div>
            ) : data.tasks.today.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No tasks assigned for today.</div>
            ) : (
              data.tasks.today.map((t) => (
                <TaskRow key={t.uuid || t.id} title={t.task_name} project={t.project_name || '—'} status={getBadgeStatus(t.status)} due={formatDate(t.due_date)} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-75 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CalendarOff size={18} className="text-primary" /> My Recent Leaves
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2" /> Loading leaves...</div>
            ) : data.leaves.recent.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No recent leave records.</div>
            ) : (
              data.leaves.recent.map((l, i) => (
                <LeaveRow key={l.id || i} type={l.leave_type || 'Leave'} dates={`${formatDate(l.from_date)} - ${formatDate(l.to_date)}`} status={l.status || 'Pending'} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-75 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Video size={18} className="text-primary" /> Upcoming Meetings
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2" /> Loading meetings...</div>
            ) : data.meetings.upcoming.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm">No upcoming meetings.</div>
            ) : (
              data.meetings.upcoming.map((m, i) => {
                const meetingDateValue = getEventDateValue(m);
                const mDate = meetingDateValue ? new Date(meetingDateValue) : null;
                const hasValidDate = mDate && !Number.isNaN(mDate.getTime());
                const timeStr = hasValidDate ? mDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Time TBD';
                const dayStr = hasValidDate ? (isSameDay(mDate) ? `Today ${timeStr}` : `${formatDate(mDate)} ${timeStr}`) : 'Schedule pending';
                return (
                  <div key={m.id || m.uuid || i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{m.title || m.event_name || m.planTitle || 'Meeting'}</p>
                      <p className="text-white/40 text-xs mt-0.5">{dayStr}</p>
                    </div>
                    <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">
                      {m.members || 1} Members
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 min-h-75 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FolderKanban size={18} className="text-primary" /> Active Projects
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center flex-1 text-white/40 text-sm"><Loader2 size={18} className="animate-spin mr-2" /> Loading projects...</div>
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