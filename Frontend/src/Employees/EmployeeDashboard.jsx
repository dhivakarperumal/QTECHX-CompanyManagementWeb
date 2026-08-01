import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, CalendarOff, FolderKanban, CheckSquare, Clock,
  DollarSign, Video, TrendingUp, AlertCircle, CheckCircle2, Timer,
  CalendarDays, Loader2
} from 'lucide-react';
import { useAuth } from '../PrivateRouter/AuthContext';
import api from '../api';
import dayjs from 'dayjs';

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

const normalizeListPayload = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const getResponseItems = (response, fallback = []) => {
  if (!response) return fallback;
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  return normalizeListPayload(payload) || fallback;
};

const getEventDateValue = (event) =>
  event?.planDate || event?.startDate || event?.plan_date || event?.start_time || event?.date || event?.start || event?.event_date;

const resolveEmployeeId = (user, fallbackEmployeeId) => {
  const candidateIds = [
    user?.employee_id,
    user?.employeeId,
    user?.user_id,
    user?.userId,
    user?.id,
    user?._id,
    user?.uuid,
    user?.employee_code,
    user?.employeeCode,
    user?.emp_id,
    user?.empId,
    fallbackEmployeeId,
  ].filter(Boolean).map(String);

  if (candidateIds.length === 0) return null;
  return candidateIds.find((id) => id.length > 20) || candidateIds[0] || null;
};

const getDateValue = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes('T') || trimmed.includes(' ') ? trimmed : `${trimmed}T00:00:00`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSameCalendarDay = (value, reference = new Date()) => {
  const parsed = getDateValue(value);
  if (!parsed) return false;
  return dayjs(parsed).format('YYYY-MM-DD') === dayjs(reference).format('YYYY-MM-DD');
};

const eventMatchesUser = (event, possibleIds, userName) => {
  if (!event) return false;
  const directFields = [
    event.user_id,
    event.userId,
    event.employee_id,
    event.employeeId,
    event.created_by,
    event.createdBy,
    event.assigned_to,
    event.assignedTo,
    event.owner_id,
    event.ownerId,
    event.creator_id,
    event.creatorId,
  ];

  if (directFields.some((value) => possibleIds.includes(String(value)))) {
    return true;
  }

  const participants = event.participants || event.attendees || event.members || [];
  const normalizedParticipants = typeof participants === 'string'
    ? (() => { try { return JSON.parse(participants); } catch { return []; } })()
    : participants;

  if (Array.isArray(normalizedParticipants)) {
    return normalizedParticipants.some((participant) => {
      if (!participant) return false;
      if (typeof participant === 'string') {
        const normalizedValue = String(participant).trim().toLowerCase();
        return possibleIds.includes(normalizedValue) || (userName && normalizedValue === userName);
      }
      const participantFields = [
        participant.user_id,
        participant.userId,
        participant.employee_id,
        participant.employeeId,
        participant.id,
        participant.uuid,
        participant.userID,
        participant.employeeID,
      ];
      const participantIdMatch = participantFields.some((value) => possibleIds.includes(String(value)));
      const participantName = String(participant.name || participant.full_name || participant.username || participant.label || '').trim().toLowerCase();
      return participantIdMatch || (userName && participantName && participantName === userName);
    });
  }

  return false;
};

/* ── main ── */
const EmployeeDashboard = () => {
  const { userProfile, user, profileName } = useAuth();
  const name = userProfile?.displayName?.split(' ')[0] || userProfile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || user?.username || 'Employee';
  const employeeId = resolveEmployeeId(user, userProfile?.employee_id);
  const primaryUserId = user?.user_id || user?.id || user?.employee_id || user?.employeeId || user?.uuid || employeeId || null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    tasks: { today: [], assigned: 0, completed: 0, overdue: 0 },
    leaves: { recent: [], pendingCount: 0 },
    meetings: { todayCount: 0, upcoming: [] },
    projects: { activeList: [], activeCount: 0 },
    attendance: { checkIn: null, checkOut: null, presentDays: 0, absentDays: 0, hoursThisWeek: 0 },
    payroll: { nextPayDate: 'N/A', nextSalary: 'N/A' },
    leaveBalance: 0
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const todayStr = dayjs(today).format('YYYY-MM-DD');

      try {
        const [
          tasksRes,
          leavesRes,
          leaveSettingsRes,
          eventsRes,
          myEventsRes,
          projectsAssignRes,
          projectsAllRes,
          attendanceRes,
          salaryRes
        ] = await Promise.allSettled([
          api.get('/tasks', { params: { page: 1, limit: 1000, ...(primaryUserId ? { assigned_to: primaryUserId } : {}) } }),
          api.get('/employee-leaves/my-leaves'),
          api.get('/leave-settings'),
          api.get('/events'),
          api.get('/myevents'),
          api.get('/projects/assignments/all?limit=1000'),
          api.get('/projects?limit=1000&page=1'),
          api.get(`/attendance/${primaryUserId || ''}?month=${month}&year=${year}`),
          api.get('/salary/history')
        ]);

        const newData = {
          tasks: { today: [], assigned: 0, completed: 0, overdue: 0 },
          leaves: { recent: [], pendingCount: 0 },
          meetings: { todayCount: 0, upcoming: [] },
          projects: { activeList: [], activeCount: 0 },
          attendance: { checkIn: null, checkOut: null, presentDays: 0, absentDays: 0, hoursThisWeek: 0 },
          payroll: { nextPayDate: 'N/A', nextSalary: 'N/A' },
          leaveBalance: 0
        };

        // --- TASKS ---
        if (tasksRes.status === 'fulfilled') {
          const tasks = getResponseItems(tasksRes.value, []);
          newData.tasks.assigned = tasks.length;
          newData.tasks.completed = tasks.filter(t => ['Completed', 'Done'].includes(t.status)).length;
          newData.tasks.overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < today && !['Completed', 'Done'].includes(t.status)).length;
          newData.tasks.today = tasks.filter(t => isSameDay(t.assignment_date) || isSameDay(t.created_at)).slice(0, 5);
        }

        // --- LEAVES ---
        let employeeLeaves = [];
        if (leavesRes.status === 'fulfilled') {
          employeeLeaves = getResponseItems(leavesRes.value, []);
          newData.leaves.pendingCount = employeeLeaves.filter(l => l.status === 'Pending').length;
          newData.leaves.recent = employeeLeaves.slice(0, 4);
        }

        if (leaveSettingsRes.status === 'fulfilled') {
          const leaveSettings = getResponseItems(leaveSettingsRes.value, []);
          const approvedLeaves = employeeLeaves.filter(l => l.status === 'Approved');
          newData.leaveBalance = leaveSettings.reduce((total, setting) => {
            const maxDays = Number(setting.max_days || 0);
            const taken = approvedLeaves
              .filter(l => String(l.leave_type || '').toLowerCase() === String(setting.leave_type || '').toLowerCase())
              .reduce((sum, leave) => sum + Number(leave.no_of_days || 0), 0);
            return total + Math.max(maxDays - taken, 0);
          }, 0);
        }

        // --- MEETINGS ---
        const possibleIds = [
          user?.employee_id,
          user?.employeeId,
          user?.user_id,
          user?.userId,
          user?.id,
          user?._id,
          user?.uuid,
          user?.employee_code,
          user?.employeeCode,
          user?.emp_id,
          user?.empId,
          userProfile?.employee_id,
          userProfile?.employeeId,
          employeeId,
          primaryUserId,
        ].filter(Boolean).map(String);
        const possibleIdSet = new Set(possibleIds.map(String));
        const userName = (profileName || userProfile?.displayName || userProfile?.name || user?.name || user?.full_name || user?.username || '').trim().toLowerCase();
        
        let personalEvents = eventsRes.status === 'fulfilled' ? getResponseItems(eventsRes.value, []) : [];
        let officeEvents = myEventsRes.status === 'fulfilled' ? getResponseItems(myEventsRes.value, []) : [];
        
        const allEvents = [...personalEvents, ...officeEvents];
        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id || e.uuid || `${e.title || e.event_name || 'event'}-${getEventDateValue(e) || ''}`, e])).values());
        
        const filteredMeetings = uniqueEvents.filter(e => {
          const text = [e.eventType, e.category, e.title, e.event_name, e.planTitle, e.name].filter(Boolean).join(' ').toLowerCase();
          return text.includes('meeting') || text.includes('meating') || text.includes('call');
        });

        const matchedMeetings = possibleIds.length > 0
          ? filteredMeetings.filter(e => eventMatchesUser(e, possibleIds, userName) || eventMatchesUser(e, Array.from(possibleIdSet), userName))
          : filteredMeetings;
        const meetingsToUse = matchedMeetings.length > 0 ? matchedMeetings : filteredMeetings;
        
        const upcomingEvents = meetingsToUse.filter(e => {
          const mDate = getEventDateValue(e);
          return mDate && dayjs(mDate).isSameOrAfter(dayjs().startOf('day'));
        }).sort((a,b) => {
          const dateA = getEventDateValue(a);
          const dateB = getEventDateValue(b);
          return dayjs(dateA).valueOf() - dayjs(dateB).valueOf();
        });
        
        newData.meetings.todayCount = upcomingEvents.filter(e => isSameCalendarDay(getEventDateValue(e), today)).length;
        newData.meetings.upcoming = upcomingEvents.slice(0, 3);

        // --- PROJECTS ---
        const allPrj = projectsAllRes.status === 'fulfilled'
          ? (Array.isArray(projectsAllRes.value?.data) ? projectsAllRes.value.data : (Array.isArray(projectsAllRes.value?.data?.data) ? projectsAllRes.value.data.data : []))
          : [];
        const grouped = projectsAssignRes.status === 'fulfilled'
          ? (Array.isArray(projectsAssignRes.value?.data?.grouped) ? projectsAssignRes.value.data.grouped : (Array.isArray(projectsAssignRes.value?.data) ? projectsAssignRes.value.data : []))
          : [];
        
        const assignedUuids = new Set(
          grouped
            .filter(g => g.employees?.some(e => String(e.employee_id) === String(primaryUserId) || String(e.user_id) === String(primaryUserId) || String(e.id) === String(primaryUserId)))
            .map(g => g.project_uuid)
        );
        
        const myProjects = allPrj.filter(p => {
          const projectUuid = p.uuid || p.project_uuid || p.project?.uuid || null;
          const projectManager = p.project_manager || p.project?.project_manager || '';
          return assignedUuids.has(projectUuid) || (projectManager && projectManager.toLowerCase() === userName);
        });
        
        const activeProjects = myProjects.filter(p => !['Completed', 'Archived', 'Cancelled'].includes(p.status || p.project?.status));
        newData.projects.activeCount = activeProjects.length;
        newData.projects.activeList = activeProjects.slice(0, 3).map(p => ({
          name: p.project_name || p.project?.project_name || 'Project',
          progress: p.completion_percentage || p.project?.completion_percentage || 0,
          due: formatDate(p.end_date || p.project?.end_date)
        }));

        // --- ATTENDANCE ---
        if (attendanceRes.status === 'fulfilled') {
          const records = getResponseItems(attendanceRes.value, []);
          const normalizedRecords = records.map((record) => ({
            ...record,
            attendance_status: record.attendance_status || record.status || 'Present',
            check_in_time: record.check_in_time || record.checkIn || record.checkin || null,
            check_out_time: record.check_out_time || record.checkOut || record.checkout || null,
          }));
          const present = normalizedRecords.filter(r => ['Present', 'Half Day', 'Late'].includes(r.attendance_status));
          
          newData.attendance.presentDays = present.length;
          // Estimate working days so far in month
          let workingDaysSoFar = 0;
          for (let d = 1; d <= today.getDate(); d++) {
            const date = new Date(year, month - 1, d);
            if (date.getDay() !== 0 && date.getDay() !== 6) workingDaysSoFar++; // excluding weekends
          }
          newData.attendance.absentDays = Math.max(0, workingDaysSoFar - present.length);

          const todayRec = normalizedRecords.find(r => {
            const recordDate = r.date || r.attendance_date || r.attendanceDate || '';
            const normalizedDate = String(recordDate).slice(0, 10);
            return normalizedDate === todayStr || isSameCalendarDay(recordDate, today);
          });
          const fallbackRec = todayRec || normalizedRecords[0] || null;
          if (fallbackRec) {
            newData.attendance.checkIn = fallbackRec.check_in_time || fallbackRec.checkIn || null;
            newData.attendance.checkOut = fallbackRec.check_out_time || fallbackRec.checkOut || null;
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
          const history = getResponseItems(salaryRes.value, []);
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
            <span className="text-white text-sm font-medium">Check-in: <span className="text-green-400">{data.attendance.checkIn || 'Not yet'}</span> · Check-out: <span className="text-amber-400">{data.attendance.checkOut || 'Not yet'}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <CalendarDays size={16} className="text-blue-400" />
            <span className="text-white text-sm font-medium">Leave Balance: <span className="text-blue-400">{data.leaveBalance > 0 ? `${data.leaveBalance} days left` : '0 days left'}</span></span>
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
                const meetingDateValue = getEventDateValue(m);
                const mDate = meetingDateValue ? new Date(meetingDateValue) : null;
                const hasValidDate = mDate && !Number.isNaN(mDate.getTime());
                const timeStr = hasValidDate ? mDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Time TBD';
                const dayStr = hasValidDate ? (isSameDay(mDate) ? `Today ${timeStr}` : `${formatDate(mDate)} ${timeStr}`) : 'Schedule pending';
                const members = Array.isArray(m.attendees) ? m.attendees.length : (m.members || 1);
                return (
                  <div key={m.id || m.uuid || i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-medium">{m.title || m.event_name || m.planTitle || 'Meeting'}</p>
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