import { useAuth } from '../PrivateRouter/AuthContext';
import { useAdmin } from '../PrivateRouter/AdminContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FolderKanban, CheckSquare, GraduationCap, BookOpen,
  DollarSign, CalendarOff, ClipboardCheck, TrendingUp,
  TrendingDown, ArrowUpRight, Clock, CheckCircle2,
  UserPlus, Briefcase, Activity, Calendar, ChevronDown, Settings
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

/* ─── Helpers ─── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, change, changeType, color, bgColor }) => (
  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/6">
    <div className={`absolute -top-5 -right-6 w-28 h-28 rounded-full blur-3xl opacity-25 ${bgColor}`} />
    <div className="absolute inset-x-5 top-5 h-px bg-white/10" />
    <div className="flex items-center justify-between mb-5 relative">
      <div className={`w-12 h-12 rounded-3xl flex items-center justify-center ${color} ring-1 ring-white/10`}>
        <Icon size={20} />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${changeType === 'up' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
          }`}>
          {changeType === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      )}
    </div>
    <p className="text-3xl font-semibold text-white mb-1 leading-none">{value}</p>
    <p className="text-white/50 text-xs uppercase tracking-[0.18em] font-semibold">{label}</p>
  </div>
);

const MiniMetric = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 transition hover:bg-white/10">
    <div className={`w-11 h-11 rounded-3xl flex items-center justify-center ${accent}`}>
      <Icon size={18} />
    </div>
    <p className="text-white font-semibold text-lg mt-3">{value}</p>
    <p className="text-white/40 text-[11px] uppercase tracking-[0.24em] mt-1">{label}</p>
  </div>
);

const TrendGraph = ({ data }) => {
  const max = Math.max(...data, 1);
  const points = data.map((value, index) => {
    const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
    const y = 100 - (value / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="rounded-3xl bg-[#0d1018]/90 border border-white/10 p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Task Trend</p>
          <p className="text-white font-semibold">Weekly completion</p>
        </div>
        <span className="text-[11px] text-white/40 uppercase tracking-[0.2em]">7 days</span>
      </div>
      <div className="relative h-32 w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="trendLine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="1" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="#fb923c"
            strokeWidth="2.5"
            points={points}
          />
          <path d={`M0,100 L${points} L100,100`} fill="url(#trendLine)" opacity="0.45" />
          {data.map((value, index) => {
            const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100;
            const y = 100 - (value / max) * 100;
            return <circle key={index} cx={`${x}`} cy={`${y}`} r="2.2" fill="#fb923c" />;
          })}
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0d1018] to-transparent" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2 text-[10px] text-white/40">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center font-semibold text-white/60">{day}</div>
        ))}
      </div>
    </div>
  );
};

const CARD_COLORS = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Completed: '#10b981',
  'On Hold': '#facc15',
  Cancelled: '#ef4444',
  Review: '#8b5cf6',
  Testing: '#a855f7',
};

const FOLLOW_UP_COLORS = {
  Pending: '#f59e0b',
  'Follow Up': '#3b82f6',
  Completed: '#10b981',
  Rescheduled: '#8b5cf6',
  Cancelled: '#ef4444',
};

const StatusCard = ({ title, subtitle, actionLabel, actionOnClick, children }) => (
  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">{subtitle}</p>
        <h3 className="text-white font-bold text-lg mt-1">{title}</h3>
      </div>
      {actionLabel && (
        <button onClick={actionOnClick} className="text-xs uppercase tracking-[0.24em] text-primary hover:text-white transition">
          {actionLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

const TaskStatusCard = ({ data, onViewAll }) => (
  <StatusCard title="Task Status" subtitle="Live task breakdown" actionLabel="View Tasks" actionOnClick={onViewAll}>
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="status" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }} itemStyle={{ color: '#fff' }} />
          <Bar dataKey="count" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`${entry.status || 'unknown'}-${index}`} fill={CARD_COLORS[entry.status] || '#7c3aed'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 gap-3 mt-5">
      {data.map((item, index) => (
        <div key={`${item.status || 'unknown'}-${index}`} className="rounded-2xl bg-slate-950/80 p-3 border border-white/10">
          <p className="text-xs text-white/50">{item.status}</p>
          <p className="text-2xl font-semibold text-white">{item.count}</p>
        </div>
      ))}
    </div>
  </StatusCard>
);

const ProjectStatusCard = ({ data, onViewAll }) => (
  <StatusCard title="Project Health" subtitle="Current project stages" actionLabel="View Projects" actionOnClick={onViewAll}>
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="80%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="current_status" stroke="rgba(255,255,255,0.7)" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
          <Radar name="Projects" dataKey="count" stroke="#f97316" fill="#f97316" fillOpacity={0.22} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4">
      {data.slice(0, 4).map((item) => (
        <div key={item.current_status} className="rounded-2xl bg-slate-950/80 p-3 border border-white/10 text-sm">
          <p className="text-white/50">{item.current_status}</p>
          <p className="text-white font-semibold">{item.count}</p>
        </div>
      ))}
    </div>
  </StatusCard>
);

const ClientFollowupCard = ({ data, onViewAll }) => (
  <StatusCard title="Client Follow-ups" subtitle="Follow-up activity status" actionLabel="View Follow-ups" actionOnClick={onViewAll}>
    <div className="flex gap-4 flex-col xl:flex-row items-center">
      <div className="min-w-[160px] h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="follow_up_status" innerRadius={40} outerRadius={70} paddingAngle={3} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.follow_up_status} fill={FOLLOW_UP_COLORS[entry.follow_up_status] || '#6366f1'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }} itemStyle={{ color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 w-full">
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.follow_up_status} className="flex items-center justify-between gap-2 rounded-2xl bg-slate-950/80 p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: FOLLOW_UP_COLORS[item.follow_up_status] || '#6366f1' }} />
                <span className="text-sm text-white/70">{item.follow_up_status}</span>
              </div>
              <span className="text-white font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </StatusCard>
);

/* ─── Mock Data for Charts ─── */
const overviewData = [
  { name: 'May 1', employees: 10, projects: 50 },
  { name: 'May 6', employees: 40, projects: 120 },
  { name: 'May 11', employees: 55, projects: 100 },
  { name: 'May 16', employees: 80, projects: 140 },
  { name: 'May 21', employees: 70, projects: 120 },
  { name: 'May 26', employees: 110, projects: 160 },
  { name: 'May 31', employees: 140, projects: 220 },
];

const tasksStatusData = [
  { name: 'Completed', value: 178, color: '#f97316' },
  { name: 'In Progress', value: 48, color: '#4b5563' },
  { name: 'Pending', value: 16, color: '#9ca3af' },
];

const employeeDeptData = [
  { name: 'Engineering', value: 96, color: '#f97316' },
  { name: 'Marketing', value: 48, color: '#6b7280' },
  { name: 'Sales', value: 40, color: '#4b5563' },
  { name: 'HR', value: 32, color: '#374151' },
  { name: 'Finance', value: 24, color: '#1f2937' },
  { name: 'Others', value: 16, color: '#111827' },
];

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Feb', revenue: 52000, expenses: 34000 },
  { month: 'Mar', revenue: 48000, expenses: 31000 },
  { month: 'Apr', revenue: 61000, expenses: 38000 },
  { month: 'May', revenue: 59000, expenses: 40000 },
  { month: 'Jun', revenue: 75000, expenses: 45000 },
];

const recentCompletedTasksData = [
  { name: 'Homepage Redesign', project: 'Website V2', assignee: 'Alex Morgan', avatar: 'https://i.pravatar.cc/150?u=5', status: 'Completed' },
  { name: 'API Integration', project: 'Mobile App', assignee: 'Sam Smith', avatar: 'https://i.pravatar.cc/150?u=6', status: 'Completed' },
  { name: 'Database Migration', project: 'Backend Ops', assignee: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Completed' },
  { name: 'Q3 Financial Report', project: 'Finance', assignee: 'Lisa Ray', avatar: 'https://i.pravatar.cc/150?u=7', status: 'Completed' },
];

const leaveRequestsData = [
  { employee: 'Michael Scott', avatar: 'https://i.pravatar.cc/150?u=8', type: 'Sick Leave', duration: 'Oct 12 - Oct 14' },
  { employee: 'Jim Halpert', avatar: 'https://i.pravatar.cc/150?u=9', type: 'Casual Leave', duration: 'Oct 15 (1 day)' },
  { employee: 'Pam Beesly', avatar: 'https://i.pravatar.cc/150?u=10', type: 'Maternity', duration: 'Nov 1 - Jan 31' },
  { employee: 'Dwight Schrute', avatar: 'https://i.pravatar.cc/150?u=11', type: 'Emergency', duration: 'Oct 13 (Half day)' },
];

// Recent activity mock and ActivityRow component (used in Recent Activity section)

const ActivityRow = ({ title, meta, time, user, avatar }) => (
  <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
    <img src={avatar} alt={user} className="w-10 h-10 rounded-full" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white truncate">{title}</p>
      <p className="text-[11px] text-white/40 truncate">{meta} · {time}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { profileName } = useAuth();
  const name = profileName?.split(' ')[0] || 'Admin';
  const { getDashboardData } = useAdmin();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getDashboardData();
        if (mounted) setDashboard(data);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Poll every 30s for near-real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fresh = await getDashboardData(true);
        setDashboard(fresh);
      } catch (err) {
        // ignore polling errors
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPayroll = (amount) => {
    if (!amount && amount !== 0) return '—';
    const n = Number(amount || 0);
    if (!Number.isFinite(n)) return '—';
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const safeNumber = (value) => {
    const n = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  };

  const stats = [
    { icon: Users, label: 'Total Employees', value: dashboard ? String(dashboard.totalEmployees || 0) : '—', change: '+3 this month', changeType: 'up', color: 'bg-blue-500/20 text-blue-400', bgColor: 'bg-blue-500' },
    { icon: FolderKanban, label: 'Active Projects', value: dashboard ? String(dashboard.activeProjects || 0) : '—', change: '+2 new', changeType: 'up', color: 'bg-primary/20 text-primary', bgColor: 'bg-primary' },
    { icon: ClipboardCheck, label: 'Total Tasks', value: dashboard ? String(dashboard.totalTasks || 0) : '—', change: '7 new', changeType: 'up', color: 'bg-purple-500/20 text-purple-400', bgColor: 'bg-purple-500' },
    { icon: GraduationCap, label: 'Active Trainees', value: dashboard ? String(dashboard.activeTrainees || 0) : '—', change: '+5 this week', changeType: 'up', color: 'bg-teal-500/20 text-teal-400', bgColor: 'bg-teal-500' },
    { icon: BookOpen, label: 'Internship Students', value: dashboard ? String(dashboard.internshipStudents || 0) : '—', change: 'Batch Jul 2026', changeType: 'up', color: 'bg-pink-500/20 text-pink-400', bgColor: 'bg-pink-500' },
    { icon: DollarSign, label: 'Monthly Payroll', value: dashboard ? formatPayroll(dashboard.monthlyPayroll) : '—', change: 'Jul 31 due', changeType: 'up', color: 'bg-emerald-500/20 text-emerald-400', bgColor: 'bg-emerald-500' },
    { icon: FolderKanban, label: 'Pending Follow-ups', value: dashboard ? String(dashboard.clientStats?.pendingFollowUps || 0) : '—', change: '2 due today', changeType: 'down', color: 'bg-yellow-500/20 text-yellow-400', bgColor: 'bg-yellow-500' },
    { icon: CalendarOff, label: 'Attendance Today', value: dashboard ? `${dashboard.attendanceToday?.present || 0}/${dashboard.attendanceToday?.total || 0}` : '—', change: dashboard ? `${(dashboard.attendanceToday?.total || 0) - (dashboard.attendanceToday?.present || 0)} absent` : '—', changeType: 'down', color: 'bg-sky-500/20 text-sky-400', bgColor: 'bg-sky-500' },
  ];

  const heroMetrics = [
    { icon: Users, label: 'Total Clients', value: dashboard ? String(dashboard.clientStats?.total || 0) : '—', accent: 'bg-blue-500/10 text-blue-300' },
    { icon: FolderKanban, label: 'Live Projects', value: dashboard ? String(dashboard.activeProjects || 0) : '—', accent: 'bg-primary/10 text-primary' },
    { icon: CalendarOff, label: 'Pending Follow-ups', value: dashboard ? String(dashboard.clientStats?.pendingFollowUps || 0) : '—', accent: 'bg-emerald-500/10 text-emerald-300' },
    { icon: Clock, label: 'Payroll Due', value: 'End of Month', accent: 'bg-yellow-500/10 text-yellow-300' },
  ];

  const quickActions = [
    { label: 'Add Employee', icon: UserPlus, path: '/admin/employees/add' },
    { label: 'New Project', icon: FolderKanban, path: '/admin/projects/add' },
    { label: 'Run Payroll', icon: DollarSign, path: '/admin/expenses' },
    { label: 'Open Calendar', icon: Calendar, path: '/admin/office-calendar' },
  ];

  const getEventStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'meeting':
      case 'client meeting':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
      case 'training':
        return 'bg-pink-500/15 border-pink-500/30 text-pink-400';
      case 'holiday':
      case 'leave':
        return 'bg-green-500/15 border-green-500/30 text-green-400';
      default:
        return 'bg-primary/15 border-primary/30 text-primary';
    }
  };

  const TARGET_REVENUE = 500000;
  const currentIncome = dashboard ? safeNumber(dashboard.currentMonthIncome) : 0;
  const currentProjectPayments = dashboard ? safeNumber(dashboard.currentMonthProjectPayments) : 0;
  const currentIncomes = dashboard ? safeNumber(dashboard.currentMonthIncomes) : 0;
  const targetPercentage = Math.min(Math.round((currentIncome / TARGET_REVENUE) * 100), 100);

  const upcomingEvents = (dashboard?.upcomingEvents || []).map(e => {
    const dateObj = new Date(e.startDate);
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let timeStr = 'All Day';
    if (e.startTime) {
      const [hour, minute] = e.startTime.split(':');
      const d = new Date();
      d.setHours(hour, minute);
      timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return {
      title: e.title,
      date: dateStr,
      time: timeStr,
      type: e.eventType,
      color: getEventStyle(e.eventType)
    };
  });

  const taskStatusData = (dashboard?.taskStats && dashboard.taskStats.length > 0)
    ? dashboard.taskStats
    : [
        { status: 'Completed', count: 0 },
        { status: 'In Progress', count: 0 },
        { status: 'Pending', count: 0 }
      ];
  const projectStatusData = (dashboard?.projectStats && dashboard.projectStats.length > 0)
    ? dashboard.projectStats
    : [
        { current_status: 'Planning', status: 'Planning', count: 0 },
        { current_status: 'In Progress', status: 'In Progress', count: 0 },
        { current_status: 'Testing', status: 'Testing', count: 0 },
        { current_status: 'Completed', status: 'Completed', count: 0 }
      ];
  const clientFollowupData = (dashboard?.clientFollowUps && dashboard.clientFollowUps.length > 0)
    ? dashboard.clientFollowUps
    : [
        { follow_up_status: 'Completed', count: 0 },
        { follow_up_status: 'Pending', count: 0 }
      ];
  const taskTrend = [58, 72, 81, 76, 90, 84, 96];

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen">

      {/* ── GREETING BANNER ── */}
      <div className="relative rounded-[2rem] overflow-hidden p-6 md:p-8 border border-white/10 bg-[#12131a]/70 shadow-2xl shadow-black/40">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_top_right,_rgba(248,116,14,0.22),transparent_40%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(58,186,255,0.16),transparent_45%)] blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.7fr_1.1fr] items-start">
          <div className="relative z-10">
            <p className="text-primary text-sm font-semibold mb-2 uppercase tracking-[0.24em]">{today}</p>
            <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">{greeting()}, {name}! 👋</h1>
            <p className="text-white/60 text-sm max-w-xl mt-3">Welcome back to the command center. Review your top metrics, pending actions, and team health in one place.</p>

            <div className="flex flex-wrap gap-3 mt-6">
              {quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <button key={index} onClick={() => action.path && navigate(action.path)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer">
                    <ActionIcon size={14} />
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {heroMetrics.map((item, index) => (
                <MiniMetric key={index} {...item} />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0f1422]/90 border border-white/10 p-6 shadow-xl shadow-black/25 backdrop-blur-xl flex flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),transparent_40%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),transparent_45%)]" />
            
            <div className="relative z-10 flex items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">Financial Overview</p>
                <h2 className="text-white font-bold text-xl mt-2">Revenue Insights</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-semibold shadow-lg shadow-emerald-500/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Data
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-sky-500/15 bg-sky-500/10 p-6 shadow-md shadow-black/20 flex flex-col justify-between overflow-hidden group hover:border-sky-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-[0.2em] font-medium">Project Payments</p>
                      <p className="text-sm text-white/40 mt-1">Collected this month</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 shadow-inner">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white tracking-tight">₹{dashboard ? safeNumber(dashboard.currentMonthProjectPayments).toLocaleString('en-IN') : 0}</p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/10 p-6 shadow-md shadow-black/20 flex flex-col justify-between overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-[0.2em] font-medium">Other Incomes</p>
                      <p className="text-sm text-white/40 mt-1">Recorded this month</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-inner">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-white tracking-tight">₹{dashboard ? safeNumber(dashboard.currentMonthIncomes).toLocaleString('en-IN') : 0}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[1.25rem] border border-rose-500/10 bg-rose-500/[0.03] p-4 shadow-sm hover:bg-rose-500/[0.05] transition-colors">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5 font-medium">Monthly Payroll</p>
                   <p className="text-xl font-bold text-rose-300">{dashboard ? formatPayroll(dashboard.monthlyPayroll) : 0}</p>
                </div>
                <div className="rounded-[1.25rem] border border-blue-500/10 bg-blue-500/[0.03] p-4 shadow-sm hover:bg-blue-500/[0.05] transition-colors">
                   <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5 font-medium">Net Est. Profit</p>
                   <p className="text-xl font-bold text-blue-300">₹{dashboard ? safeNumber(safeNumber(dashboard.currentMonthIncome) - safeNumber(dashboard.monthlyPayroll)).toLocaleString('en-IN') : 0}</p>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-center mt-1">
                <div className="flex items-center justify-between text-[11px] text-white/50 mb-2 font-medium">
                  <span className="uppercase tracking-[0.15em]">Monthly Revenue Target (₹{(TARGET_REVENUE/100000).toFixed(1)}L)</span>
                  <span className="text-emerald-400">{targetPercentage}% Achieved</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${targetPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Company Overview (Line Chart) */}
        <div className="lg:col-span-8 bg-white/4 border border-white/8 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white">Company Overview</h2>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded text-xs text-white/70">
              Last 6 Months
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard?.overviewData || []} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="projects" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="employees" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-start gap-6 mt-4 ml-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-white/60">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-white/60">Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-white/60">Employees</span>
            </div>
          </div>
        </div>

        {/* Trainee & Intern Details (Donut Chart) */}
        <div className="lg:col-span-4 bg-white/4 border border-white/8 p-6 rounded-2xl flex flex-col">
          <h2 className="text-sm font-bold text-white mb-2">Trainee & Interns</h2>
          {dashboard?.traineeStats && dashboard.traineeStats.length > 0 ? (
            <>
              <div className="flex-1 relative flex items-center justify-center h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboard.traineeStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      stroke="none"
                    >
                      {dashboard.traineeStats.map((entry, index) => {
                        const colors = ['#f97316', '#3b82f6', '#10b981', '#f43f5e'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      formatter={(value, name, props) => [value, props.payload.type]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <span className="text-2xl font-bold text-white">{dashboard.traineeStats.reduce((a, b) => a + Number(b.count || 0), 0)}</span>
                  <span className="text-[10px] text-white/50">Total</span>
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {dashboard.traineeStats.map((t, i) => {
                  const colors = ['#f97316', '#3b82f6', '#10b981', '#f43f5e'];
                  const total = dashboard.traineeStats.reduce((a, b) => a + Number(b.count || 0), 0);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                        <span className="text-white/70">{t.type}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-semibold text-white">{t.count}</span>
                        <span className="text-white/40">({total > 0 ? Math.round((t.count / total) * 100) : 0}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs py-8">
              <GraduationCap size={36} className="mb-2 opacity-30 text-teal-400" />
              <p className="font-medium text-white/60">No active trainees or interns</p>
              <p className="text-[11px] text-white/40 mt-1">Data will appear when trainees/interns are added</p>
            </div>
          )}
        </div>
      </div>

      {/* ── STATUS CARDS ROW ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <TaskStatusCard data={taskStatusData} onViewAll={() => navigate('/admin/tasks')} />
        <ProjectStatusCard data={projectStatusData} onViewAll={() => navigate('/admin/projects')} />
        <ClientFollowupCard data={clientFollowupData} onViewAll={() => navigate('/admin/clients/followups')} />
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Recent Activity — 5 cols */}
        <div className="lg:col-span-5 rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Recent Activity
            </h2>
          </div>
          {(dashboard?.recentActivity || []).length > 0 ? (
            dashboard.recentActivity.slice(0,5).map((a, i) => {
              const date = new Date(a.time);
              const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return <ActivityRow key={i} title={a.title} meta={a.meta} time={timeStr} user={a.user} avatar={a.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.user)}&background=random`} />
            })
          ) : (
            <p className="text-sm text-white/50">No recent activity found.</p>
          )}
        </div>

        {/* Project Status Overview — 4 cols */}
        <div className="lg:col-span-4 bg-white/4 border border-white/8 p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white">Project Status Overview</h2>

          {(dashboard?.projectStats || []).length > 0 ? (
            <>
              <div className="relative flex items-center justify-center" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboard.projectStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={1}
                      dataKey="count"
                      stroke="none"
                    >
                      {dashboard.projectStats.map((entry, index) => {
                        const colors = ['#f97316', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      formatter={(value, name, props) => [value, props.payload.current_status || props.payload.status]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{dashboard.projectStats.reduce((a, b) => a + Number(b.count || 0), 0)}</span>
                  <span className="text-[10px] text-white/50">Total Projects</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {dashboard.projectStats.slice(0, 4).map((t, i) => {
                  const colors = ['bg-orange-500', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800'];
                  const textColors = ['text-orange-400', 'text-gray-400', 'text-gray-400', 'text-gray-400', 'text-gray-400'];
                  return (
                    <div key={i} className="rounded-2xl bg-[#0d1018]/80 border border-white/10 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                        <span className="text-white/60 text-[10px] truncate max-w-[60px]">{t.current_status || t.status}</span>
                      </div>
                      <span className={`text-sm font-bold ${textColors[i % textColors.length]}`}>{t.count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs py-8">
              <FolderKanban size={36} className="mb-2 opacity-30 text-primary" />
              <p className="font-medium text-white/60">No project data</p>
            </div>
          )}
        </div>

        {/* Quick Actions — 3 cols */}
        <div className="lg:col-span-3 bg-white/4 border border-white/8 p-5 rounded-2xl flex flex-col">
          <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {[
              { icon: UserPlus, label: 'Add Employee' },
              { icon: Briefcase, label: 'Add Project' },
              { icon: CheckSquare, label: 'Create Task' },
              { icon: Calendar, label: 'Mark Attendance' },
              { icon: Activity, label: 'Generate Report' },
              { icon: Settings, label: 'System Settings' },
            ].map(({ icon: Icon, label }, i) => (
              <button
                key={i}
                onClick={() => {
                  if (label === 'Add Employee') navigate('/admin/employees');
                  if (label === 'Add Project') navigate('/admin/projects');
                  if (label === 'Mark Attendance') navigate('/admin/attendance');
                }}
                className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-2 min-h-[80px]"
              >
                <Icon className="text-primary" size={22} />
                <span className="text-[10px] font-medium text-white/80 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>


      {/* ── UPCOMING EVENTS ROW ── */}
      <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl mt-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Upcoming Events</h2>
              <p className="text-xs text-white/40">Stay ahead of the calendar</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/office-calendar')} className="text-xs text-primary hover:underline">View Calendar</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingEvents.map((e, i) => (
            <div key={i} className={`rounded-3xl border ${e.color} p-4 bg-white/5 flex items-center gap-4`}>
              <div className="flex flex-col items-center justify-center shrink-0 rounded-3xl bg-white/5 w-14 h-14 text-white/90">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50">{e.date.split(' ')[0]}</span>
                <span className="text-xl font-semibold leading-tight">{e.date.split(' ')[1]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{e.title}</p>
                <p className="text-white/40 text-xs mt-1">{e.time}</p>
              </div>
              <ArrowUpRight size={16} className="opacity-40 shrink-0" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;