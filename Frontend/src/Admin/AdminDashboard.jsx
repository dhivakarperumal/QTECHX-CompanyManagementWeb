import React, { useState } from 'react';
import { useAuth } from '../PrivateRouter/AuthContext';
import {
  Users, FolderKanban, CheckSquare, GraduationCap, BookOpen,
  DollarSign, CalendarOff, ClipboardCheck, BarChart3, TrendingUp,
  TrendingDown, ArrowUpRight, Clock, AlertCircle, CheckCircle2,
  UserPlus, Briefcase, Activity, Calendar, ChevronDown, Settings
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
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
  <div className="relative overflow-hidden rounded-2xl p-5 border border-white/8 bg-white/4 hover:bg-white/6 transition-all duration-300 group">
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
  ];

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen">

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
              <LineChart data={overviewData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1b23', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="projects" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="employees" stroke="#6b7280" strokeWidth={2} dot={{ r: 3, fill: '#6b7280' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-start gap-6 mt-4 ml-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-white/60">Employees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-500" />
              <span className="text-xs text-white/60">Projects</span>
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
                  <span className="text-white/40">({Math.round((t.value/242)*100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Original Recent Activity */}
        <div className="lg:col-span-5 rounded-2xl bg-white/4 border border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Activity size={17} className="text-primary" /> Recent Activity
            </h2>
            <button className="text-xs text-primary hover:underline">View All</button>
          </div>
          {recentActivity.map((a, i) => <ActivityRow key={i} {...a} />)}
        </div>

        {/* Employees by Department (Donut) */}
        <div className="lg:col-span-3 bg-white/4 border border-white/8 p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Employees by Dept</h2>
          </div>
          <div className="flex-1 relative flex items-center justify-center h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employeeDeptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-2xl font-bold text-white">256</span>
              <span className="text-[10px] text-white/50">Total</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {employeeDeptData.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="text-white/70">{t.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-white">{t.value}</span>
                  <span className="text-white/40">({Math.round((t.value/256)*100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4 bg-white/4 border border-white/8 p-6 rounded-2xl flex flex-col">
          <h2 className="text-sm font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            
            <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-3">
              <UserPlus className="text-primary" size={24} />
              <span className="text-[10px] font-medium text-white/80 text-center">Add Employee</span>
            </div>
            
            <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-3">
              <Briefcase className="text-primary" size={24} />
              <span className="text-[10px] font-medium text-white/80 text-center">Add Project</span>
            </div>
            
            <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-3">
              <CheckSquare className="text-primary" size={24} />
              <span className="text-[10px] font-medium text-white/80 text-center">Create Task</span>
            </div>
            
            <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-3">
              <Calendar className="text-primary" size={24} />
              <span className="text-[10px] font-medium text-white/80 text-center">Mark Attendance</span>
            </div>
            
            <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-3">
              <Activity className="text-primary" size={24} />
              <span className="text-[10px] font-medium text-white/80 text-center">Generate Report</span>
            </div>
            
            <div className="bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5 rounded-xl flex flex-col items-center justify-center p-3 gap-3">
              <Settings className="text-primary" size={24} />
              <span className="text-[10px] font-medium text-white/80 text-center">System Settings</span>
            </div>
            
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;