import { useAuth } from '../PrivateRouter/AuthContext';
import {
  Users, FolderKanban, CheckSquare, GraduationCap, BookOpen,
  DollarSign, CalendarOff, ClipboardCheck, TrendingUp,
  TrendingDown, ArrowUpRight, Clock, AlertCircle, CheckCircle2,
  UserPlus, Briefcase, Activity, Calendar,
} from 'lucide-react';

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
    {/* bg glow */}
    <div className={`absolute -top-5 -right-6 w-28 h-28 rounded-full blur-3xl opacity-25 ${bgColor}`} />
    <div className="absolute inset-x-5 top-5 h-px bg-white/10" />

    <div className="flex items-center justify-between mb-5 relative">
      <div className={`w-12 h-12 rounded-3xl flex items-center justify-center ${color} ring-1 ring-white/10`}>
        <Icon size={20} />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          changeType === 'up' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
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

/* ─── Activity Row ─── */
const ActivityRow = ({ icon: Icon, iconColor, iconBg, title, sub, time, badge, badgeColor }) => (
  <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group hover:bg-white/3 -mx-2 px-2 rounded-xl transition">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={15} className={iconColor} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-white text-sm font-medium truncate">{title}</p>
      <p className="text-white/40 text-xs mt-0.5">{sub}</p>
    </div>
    <div className="text-right shrink-0">
      {badge && (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
      )}
      <p className="text-white/25 text-[10px] mt-1">{time}</p>
    </div>
  </div>
);

/* ─── Progress Bar ─── */
const ProgressBar = ({ label, value, max, color }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-white/70 text-xs font-medium">{label}</span>
        <span className="text-white text-xs font-bold">{value}<span className="text-white/30">/{max}</span></span>
      </div>
      <div className="w-full bg-white/8 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { profileName } = useAuth();
  const name = profileName?.split(' ')[0] || 'Admin';

  const stats = [
    { icon: Users,         label: 'Total Employees',      value: '124',  change: '+3 this month', changeType: 'up',   color: 'bg-blue-500/20 text-blue-400',    bgColor: 'bg-blue-500' },
    { icon: FolderKanban,  label: 'Active Projects',       value: '18',   change: '+2 new',        changeType: 'up',   color: 'bg-primary/20 text-primary',      bgColor: 'bg-primary' },
    { icon: CheckSquare,   label: 'Tasks In Progress',     value: '67',   change: '12 overdue',    changeType: 'down', color: 'bg-purple-500/20 text-purple-400', bgColor: 'bg-purple-500' },
    { icon: CalendarOff,   label: 'Pending Leave Requests',value: '9',    change: '3 urgent',      changeType: 'down', color: 'bg-yellow-500/20 text-yellow-400', bgColor: 'bg-yellow-500' },
    { icon: GraduationCap, label: 'Active Trainees',       value: '34',   change: '+5 this week',  changeType: 'up',   color: 'bg-teal-500/20 text-teal-400',    bgColor: 'bg-teal-500' },
    { icon: BookOpen,      label: 'Internship Students',   value: '12',   change: 'Batch Jul 2026',changeType: 'up',   color: 'bg-pink-500/20 text-pink-400',    bgColor: 'bg-pink-500' },
    { icon: DollarSign,    label: 'Monthly Payroll',       value: '₹8.4L', change: 'Jul 31 due',   changeType: 'up',   color: 'bg-emerald-500/20 text-emerald-400', bgColor: 'bg-emerald-500' },
    { icon: ClipboardCheck,label: 'Attendance Today',      value: '118/124', change: '6 absent',  changeType: 'down', color: 'bg-sky-500/20 text-sky-400',      bgColor: 'bg-sky-500' },
  ];

  const heroMetrics = [
    { icon: Users, label: 'Employees', value: '124', accent: 'bg-blue-500/10 text-blue-300' },
    { icon: FolderKanban, label: 'Live Projects', value: '18', accent: 'bg-primary/10 text-primary' },
    { icon: ClipboardCheck, label: 'Present Today', value: '118', accent: 'bg-emerald-500/10 text-emerald-300' },
    { icon: Clock, label: 'Payroll Due', value: 'Jul 31', accent: 'bg-yellow-500/10 text-yellow-300' },
  ];

  const quickActions = [
    { label: 'Add Employee',      icon: UserPlus },
    { label: 'New Project',       icon: FolderKanban },
    { label: 'Run Payroll',       icon: DollarSign },
    { label: 'Open Calendar',     icon: Calendar },
  ];

  const recentActivity = [
    { icon: UserPlus,      iconColor: 'text-blue-400',    iconBg: 'bg-blue-500/15',    title: 'New employee onboarded',          sub: 'Priya Sharma — UI Designer',              time: '5m ago',  badge: 'New',       badgeColor: 'bg-blue-500/20 text-blue-400' },
    { icon: CheckCircle2,  iconColor: 'text-green-400',   iconBg: 'bg-green-500/15',   title: 'Project milestone achieved',      sub: 'CMS Web App — Phase 1 complete',          time: '22m ago', badge: 'Done',      badgeColor: 'bg-green-500/20 text-green-400' },
    { icon: CalendarOff,   iconColor: 'text-yellow-400',  iconBg: 'bg-yellow-500/15',  title: 'Leave request submitted',         sub: 'Rahul Kumar — Casual Leave Jul 28',       time: '1h ago',  badge: 'Pending',   badgeColor: 'bg-yellow-500/20 text-yellow-400' },
    { icon: AlertCircle,   iconColor: 'text-red-400',     iconBg: 'bg-red-500/15',     title: 'Task overdue alert',              sub: 'API Integration — Backend Module',        time: '2h ago',  badge: 'Overdue',   badgeColor: 'bg-red-500/20 text-red-400' },
    { icon: DollarSign,    iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/15', title: 'Expense claim approved',          sub: 'Arjun Mehta — ₹4,200 Travel',            time: '3h ago',  badge: 'Approved',  badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { icon: GraduationCap, iconColor: 'text-teal-400',    iconBg: 'bg-teal-500/15',    title: 'New trainee batch started',       sub: 'Web Dev Batch — 8 students',              time: 'Yesterday',badge: 'Active',   badgeColor: 'bg-teal-500/20 text-teal-400' },
  ];

  const departments = [
    { label: 'Engineering',  value: 42, max: 50, color: 'bg-blue-500' },
    { label: 'Design',       value: 18, max: 25, color: 'bg-primary' },
    { label: 'Marketing',    value: 15, max: 20, color: 'bg-purple-500' },
    { label: 'HR & Admin',   value: 12, max: 15, color: 'bg-emerald-500' },
    { label: 'Finance',      value: 10, max: 14, color: 'bg-yellow-500' },
  ];

  const upcomingEvents = [
    { title: 'Monthly All-Hands Meeting',  date: 'Jul 25',  time: '10:00 AM', type: 'meeting',  color: 'bg-blue-500/15 border-blue-500/30 text-blue-400' },
    { title: 'Q3 Project Review',          date: 'Jul 26',  time: '2:00 PM',  type: 'review',   color: 'bg-primary/15 border-primary/30 text-primary' },
    { title: 'July Payroll Processing',    date: 'Jul 31',  time: 'All Day',  type: 'payroll',  color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
    { title: 'New Intern Orientation',     date: 'Aug 1',   time: '9:00 AM',  type: 'training', color: 'bg-pink-500/15 border-pink-500/30 text-pink-400' },
  ];

  const taskOverview = [
    { label: 'Completed',   value: 89,  color: 'text-green-400',  bg: 'bg-green-500' },
    { label: 'In Progress', value: 67,  color: 'text-blue-400',   bg: 'bg-blue-500' },
    { label: 'Pending',     value: 34,  color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { label: 'Overdue',     value: 12,  color: 'text-red-400',    bg: 'bg-red-500' },
  ];
  const taskTrend = [58, 72, 81, 76, 90, 84, 96];
  const totalTasks = taskOverview.reduce((a, t) => a + t.value, 0);

  return (
    <div className="space-y-6 pb-6">

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
                  <button key={index} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80 transition hover:bg-white/10 hover:text-white">
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

          <div className="relative rounded-[1.75rem] bg-[#0f1422]/90 border border-white/10 p-6 shadow-xl shadow-black/25 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Today’s highlights</p>
                <h2 className="text-white font-bold text-lg mt-2">Key metrics</h2>
              </div>
              <span className="text-[11px] text-white/40 uppercase tracking-[0.2em]">Live</span>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white/5 p-4 border border-white/8">
                <p className="text-xs text-white/40 uppercase tracking-[0.24em] mb-2">Revenue pulse</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-semibold text-white">₹8.4L</p>
                  <span className="text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 border border-white/8">
                <p className="text-xs text-white/40 uppercase tracking-[0.24em] mb-2">Team availability</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-white font-semibold text-sm">118 present, 6 absent</p>
                  <span className="text-[11px] text-white/40 uppercase tracking-[0.2em]">95% up</span>
                </div>
                <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: '95%' }} />
                </div>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 border border-white/8">
                <p className="text-xs text-white/40 uppercase tracking-[0.24em] mb-2">Next milestone</p>
                <p className="text-white font-semibold text-sm">Q3 Project Review — Jul 26</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
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

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── MIDDLE ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Recent Activity
            </h2>
            <button className="text-xs text-primary hover:underline">View All</button>
          </div>
          {recentActivity.map((a, i) => <ActivityRow key={i} {...a} />)}
        </div>

        {/* Department Headcount */}
        <div className="rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Briefcase size={17} className="text-primary" /> Departments
            </h2>
            <span className="text-xs text-white/30">Headcount</span>
          </div>
          {departments.map((d, i) => <ProgressBar key={i} {...d} />)}
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Task Overview */}
        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
                <CheckSquare size={20} />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Task Overview</h2>
                <p className="text-xs text-white/40">Current workload and progress</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-white/50 text-[11px]">
              <div className="rounded-3xl bg-white/5 p-3 border border-white/10">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Today</p>
                <p className="text-white font-semibold mt-2">34 Tasks</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-3 border border-white/10">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Completion</p>
                <p className="text-white font-semibold mt-2">78%</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-3 border border-white/10">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">Total</p>
                <p className="text-white font-semibold mt-2">{totalTasks} Tasks</p>
              </div>
            </div>
          </div>

          <TrendGraph data={taskTrend} />

          <div className="mt-6 overflow-hidden rounded-full bg-white/10 h-3 mb-6">
            <div className="flex h-full">
              {taskOverview.map((t, i) => (
                <div key={i} className={`${t.bg} transition-all duration-700`} style={{ width: `${(t.value / totalTasks) * 100}%` }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {taskOverview.map((t, i) => (
              <div key={i} className="rounded-3xl bg-[#0d1018]/80 border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.bg}`} />
                    <span className="text-white/60 text-xs">{t.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${t.color}`}>{t.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
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
          <div className="space-y-4">
            {upcomingEvents.map((e, i) => (
              <div key={i} className={`rounded-3xl border ${e.color} p-4 bg-white/5 flex items-center gap-4` }>
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

      {/* ── LEAVE SUMMARY STRIP ── */}
      <div className="rounded-2xl bg-white/4 border border-white/8 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <CalendarOff size={17} className="text-primary" /> Leave Requests — This Week
          </h2>
          <button className="text-xs text-primary hover:underline">Manage All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                {['Employee', 'Type', 'From', 'To', 'Days', 'Status'].map(h => (
                  <th key={h} className="text-left text-white/40 text-xs font-semibold pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Rahul Kumar',   type: 'Casual',   from: 'Jul 28', to: 'Jul 28', days: 1, status: 'Pending',  statusColor: 'bg-yellow-500/20 text-yellow-400' },
                { name: 'Priya Sharma',  type: 'Medical',  from: 'Jul 30', to: 'Aug 1',  days: 3, status: 'Pending',  statusColor: 'bg-yellow-500/20 text-yellow-400' },
                { name: 'Amit Verma',    type: 'Annual',   from: 'Aug 5',  to: 'Aug 9',  days: 5, status: 'Approved', statusColor: 'bg-green-500/20 text-green-400' },
                { name: 'Sneha Pillai',  type: 'Casual',   from: 'Jul 25', to: 'Jul 25', days: 1, status: 'Approved', statusColor: 'bg-green-500/20 text-green-400' },
                { name: 'Vikram Nair',   type: 'Personal', from: 'Aug 2',  to: 'Aug 3',  days: 2, status: 'Rejected', statusColor: 'bg-red-500/20 text-red-400' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-white/3 transition">
                  <td className="py-3 pr-4 text-white font-medium">{r.name}</td>
                  <td className="py-3 pr-4 text-white/50">{r.type}</td>
                  <td className="py-3 pr-4 text-white/50">{r.from}</td>
                  <td className="py-3 pr-4 text-white/50">{r.to}</td>
                  <td className="py-3 pr-4 text-white/70">{r.days}d</td>
                  <td className="py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${r.statusColor}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;