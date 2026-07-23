import React, { useState } from 'react';
import { useAuth } from '../PrivateRouter/AuthContext';
import {
  Users, FolderKanban, CheckSquare, GraduationCap, BookOpen,
  DollarSign, CalendarOff, ClipboardCheck, BarChart3, TrendingUp,
  TrendingDown, ArrowUpRight, Clock, AlertCircle, CheckCircle2,
  Timer, UserPlus, Briefcase, Activity, Calendar,
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
  <div className="relative overflow-hidden rounded-2xl p-5 border border-white/8 bg-white/4 hover:bg-white/6 transition-all duration-300 group">
    {/* bg glow */}
    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${bgColor}`} />

    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          changeType === 'up' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
        }`}>
          {changeType === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      )}
    </div>

    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-white/50 text-xs font-medium">{label}</p>
  </div>
);

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
  const totalTasks = taskOverview.reduce((a, t) => a + t.value, 0);

  return (
    <div className="space-y-6 pb-6">

      {/* ── GREETING BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 border border-primary/20"
        style={{ background: 'linear-gradient(135deg, rgba(248,116,14,0.1) 0%, rgba(248,116,14,0.03) 100%)' }}>
        <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
          <BarChart3 size={140} />
        </div>
        <div className="relative">
          <p className="text-primary text-sm font-semibold mb-1">{today}</p>
          <h1 className="text-white text-2xl md:text-3xl font-bold">{greeting()}, {name}! 👋</h1>
          <p className="text-white/50 text-sm mt-1">Here's your company overview for today.</p>

          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { icon: Users,         label: '124 Employees',  color: 'text-blue-400',    bg: 'bg-blue-500/15' },
              { icon: Activity,      label: '18 Live Projects',color: 'text-primary',     bg: 'bg-primary/15'  },
              { icon: ClipboardCheck,label: '118 Present Today',color: 'text-green-400', bg: 'bg-green-500/15' },
              { icon: Clock,         label: 'Payroll Due Jul 31',color: 'text-yellow-400',bg: 'bg-yellow-500/15' },
            ].map((b, i) => {
              const BIcon = b.icon;
              return (
                <div key={i} className={`flex items-center gap-2 ${b.bg} rounded-xl px-3.5 py-2 border border-white/8`}>
                  <BIcon size={14} className={b.color} />
                  <span className="text-white text-xs font-medium">{b.label}</span>
                </div>
              );
            })}
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
        <div className="rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <CheckSquare size={17} className="text-primary" /> Task Overview
            </h2>
            <span className="text-xs text-white/30">Total: {totalTasks}</span>
          </div>

          {/* Stacked bar */}
          <div className="flex w-full rounded-full overflow-hidden h-3 mb-5 gap-0.5">
            {taskOverview.map((t, i) => (
              <div key={i} className={`${t.bg} transition-all duration-700`} style={{ width: `${(t.value / totalTasks) * 100}%` }} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {taskOverview.map((t, i) => (
              <div key={i} className="flex items-center justify-between bg-white/4 rounded-xl px-4 py-3 border border-white/6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${t.bg}`} />
                  <span className="text-white/60 text-xs">{t.label}</span>
                </div>
                <span className={`text-base font-bold ${t.color}`}>{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Calendar size={17} className="text-primary" /> Upcoming Events
            </h2>
            <button className="text-xs text-primary hover:underline">View Calendar</button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((e, i) => (
              <div key={i} className={`flex items-center gap-4 p-3.5 rounded-xl border ${e.color}`}>
                <div className="text-center shrink-0 w-10">
                  <p className="text-[10px] font-bold uppercase opacity-70">{e.date.split(' ')[0]}</p>
                  <p className="text-xl font-black leading-tight">{e.date.split(' ')[1]}</p>
                </div>
                <div className="w-px h-10 bg-current opacity-20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{e.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{e.time}</p>
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