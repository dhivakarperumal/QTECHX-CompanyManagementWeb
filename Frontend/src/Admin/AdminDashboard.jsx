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
  PieChart, Pie, Cell, AreaChart, Area
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
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const stats = [
    { icon: Users, label: 'Total Employees', value: dashboard ? String(dashboard.totalEmployees || 0) : '—', change: '+3 this month', changeType: 'up', color: 'bg-blue-500/20 text-blue-400', bgColor: 'bg-blue-500' },
    { icon: FolderKanban, label: 'Active Projects', value: dashboard ? String(dashboard.activeProjects || 0) : '—', change: '+2 new', changeType: 'up', color: 'bg-primary/20 text-primary', bgColor: 'bg-primary' },
    { icon: CheckSquare, label: 'Tasks In Progress', value: dashboard ? String(dashboard.tasksInProgress || 0) : '—', change: '12 overdue', changeType: 'down', color: 'bg-purple-500/20 text-purple-400', bgColor: 'bg-purple-500' },
    { icon: CalendarOff, label: 'Pending Leave Requests', value: dashboard ? String(dashboard.pendingLeaveRequests || 0) : '—', change: '3 urgent', changeType: 'down', color: 'bg-yellow-500/20 text-yellow-400', bgColor: 'bg-yellow-500' },
    { icon: GraduationCap, label: 'Active Trainees', value: dashboard ? String(dashboard.activeTrainees || 0) : '—', change: '+5 this week', changeType: 'up', color: 'bg-teal-500/20 text-teal-400', bgColor: 'bg-teal-500' },
    { icon: BookOpen, label: 'Internship Students', value: dashboard ? String(dashboard.internshipStudents || 0) : '—', change: 'Batch Jul 2026', changeType: 'up', color: 'bg-pink-500/20 text-pink-400', bgColor: 'bg-pink-500' },
    { icon: DollarSign, label: 'Monthly Payroll', value: dashboard ? formatPayroll(dashboard.monthlyPayroll) : '—', change: 'Jul 31 due', changeType: 'up', color: 'bg-emerald-500/20 text-emerald-400', bgColor: 'bg-emerald-500' },
    { icon: ClipboardCheck, label: 'Attendance Today', value: dashboard ? `${dashboard.attendanceToday?.present || 0}/${dashboard.attendanceToday?.total || 0}` : '—', change: dashboard ? `${(dashboard.attendanceToday?.total || 0) - (dashboard.attendanceToday?.present || 0)} absent` : '—', changeType: 'down', color: 'bg-sky-500/20 text-sky-400', bgColor: 'bg-sky-500' },
  ];

  const heroMetrics = [
    { icon: Users, label: 'Employees', value: dashboard ? String(dashboard.totalEmployees || 0) : '—', accent: 'bg-blue-500/10 text-blue-300' },
    { icon: FolderKanban, label: 'Live Projects', value: dashboard ? String(dashboard.activeProjects || 0) : '—', accent: 'bg-primary/10 text-primary' },
    { icon: ClipboardCheck, label: 'Present Today', value: dashboard ? String(dashboard.attendanceToday?.present || 0) : '—', accent: 'bg-emerald-500/10 text-emerald-300' },
    { icon: Clock, label: 'Payroll Due', value: 'End of Month', accent: 'bg-yellow-500/10 text-yellow-300' },
  ];

  const quickActions = [
    { label: 'Add Employee', icon: UserPlus, path: '/admin/employees' },
    { label: 'New Project', icon: FolderKanban, path: '/admin/projects' },
    { label: 'Run Payroll', icon: DollarSign, path: '/admin/payroll' },
    { label: 'Open Calendar', icon: Calendar, path: '/admin/attendance' },
  ];

  const upcomingEvents = [
    { title: 'Monthly All-Hands Meeting', date: 'Jul 25', time: '10:00 AM', type: 'meeting', color: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
    { title: 'Q3 Project Review', date: 'Jul 26', time: '2:00 PM', type: 'review', color: 'bg-primary/15 border-primary/30 text-primary' },
    { title: 'July Payroll Processing', date: 'Jul 31', time: 'All Day', type: 'payroll', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
    { title: 'New Intern Orientation', date: 'Aug 1', time: '9:00 AM', type: 'training', color: 'bg-pink-500/15 border-pink-500/30 text-pink-400' },
  ];

  const taskOverview = [
    { label: 'Completed', value: 89, color: 'text-green-400', bg: 'bg-green-500' },
    { label: 'In Progress', value: 67, color: 'text-blue-400', bg: 'bg-blue-500' },
    { label: 'Pending', value: 34, color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { label: 'Overdue', value: 12, color: 'text-red-400', bg: 'bg-red-500' },
  ];
  const taskTrend = [58, 72, 81, 76, 90, 84, 96];
  const totalTasks = taskOverview.reduce((a, t) => a + t.value, 0);

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

          <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0f1422]/90 border border-white/10 p-6 shadow-xl shadow-black/25 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(248,116,20,0.18),transparent_35%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),transparent_40%)]" />
            <div className="relative z-10 flex items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Today’s highlights</p>
                <h2 className="text-white font-bold text-lg mt-2">Key metrics</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 shadow-sm shadow-black/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-[0.24em] mb-2">Revenue pulse</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-semibold text-white">₹{dashboard ? (dashboard.currentMonthIncome / 100000).toFixed(1) : 0}L</p>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 bg-emerald-500/10 rounded-full px-2 py-1">+12%</span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-400/10 text-orange-300">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="mt-6 overflow-hidden rounded-full bg-white/10 h-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: '72%' }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
                  <span>Monthly target</span>
                  <span>72% achieved</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4 shadow-sm shadow-black/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Team availability</p>
                      <p className="text-white font-semibold text-lg mt-2">{dashboard?.attendanceToday?.present || 0}/{dashboard?.totalEmployees || 0}</p>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60 bg-white/5 rounded-full px-2 py-1">95% Up</span>
                  </div>
                  <div className="mt-4 rounded-full bg-white/10 h-2.5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: '95%' }} />
                  </div>
                  <p className="mt-3 text-[11px] text-white/50">Realtime presence and attendance stability</p>
                </div>

                <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4 shadow-sm shadow-black/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/40">Next milestone</p>
                      <p className="text-white font-semibold text-sm mt-2">Q3 Project Review — Jul 26</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                      <Calendar size={18} />
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: 'Design', value: '72%' },
                      { label: 'Dev', value: '54%' },
                      { label: 'QA', value: '86%' },
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-3xl bg-white/5 p-2">
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.18em]">{item.label}</p>
                        <p className="text-sm font-semibold text-white mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
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
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded text-xs text-white/70 cursor-pointer">
              This Month <ChevronDown size={14} />
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

        {/* Tasks by Status (Donut Chart) */}
        <div className="lg:col-span-4 bg-white/4 border border-white/8 p-6 rounded-2xl flex flex-col">
          <h2 className="text-sm font-bold text-white mb-2">Tasks by Status</h2>
          <div className="flex-1 relative flex items-center justify-center h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tasksStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {tasksStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-2xl font-bold text-white">242</span>
              <span className="text-[10px] text-white/50">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {tasksStatusData.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-white/70">{t.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-white">{t.value}</span>
                  <span className="text-white/40">({Math.round((t.value / 242) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Recent Activity — 5 cols */}
        <div className="lg:col-span-5 rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Recent Activity
            </h2>
            <button className="text-xs text-primary hover:underline">View All</button>
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

        {/* Employees by Dept — 4 cols */}
        <div className="lg:col-span-4 bg-white/4 border border-white/8 p-6 rounded-2xl flex flex-col gap-4">
          <h2 className="text-sm font-bold text-white">Employees by Dept</h2>

          {/* Donut chart */}
          <div className="relative flex items-center justify-center" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeDeptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="none"
                >
                  {employeeDeptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">256</span>
              <span className="text-[10px] text-white/50">Total</span>
            </div>
          </div>

          {/* Task progress bar */}
          <div className="overflow-hidden rounded-full bg-white/10 h-2.5">
            <div className="flex h-full">
              {taskOverview.map((t, i) => (
                <div key={i} className={`${t.bg} transition-all duration-700`} style={{ width: `${(t.value / totalTasks) * 100}%` }} />
              ))}
            </div>
          </div>

          {/* Task stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {taskOverview.map((t, i) => (
              <div key={i} className="rounded-2xl bg-[#0d1018]/80 border border-white/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.bg}`} />
                  <span className="text-white/60 text-xs">{t.label}</span>
                </div>
                <span className={`text-sm font-bold ${t.color}`}>{t.value}</span>
              </div>
            ))}
          </div>
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
          <button className="text-xs text-primary hover:underline">View Calendar</button>
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