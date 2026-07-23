import React from 'react';
import {
  ClipboardCheck,
  CalendarOff,
  FolderKanban,
  CheckSquare,
  Clock,
  DollarSign,
  Video,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../PrivateRouter/AuthContext';

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
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
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
  }[status];
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

/* ── main ── */
const EmployeeDashboard = () => {
  const { userProfile } = useAuth();
  const name = userProfile?.displayName?.split(' ')[0] || 'Employee';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date().toLocaleDateString('en-IN', {
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
        <p className="text-primary text-sm font-semibold mb-1">{today}</p>
        <h1 className="text-white text-2xl md:text-3xl font-bold">{greeting()}, {name}! 👋</h1>
        <p className="text-white/50 text-sm mt-1">Here's your work summary for today.</p>

        <div className="flex flex-wrap gap-4 mt-5">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-white text-sm font-medium">Checked In: <span className="text-green-400">09:02 AM</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <Timer size={16} className="text-primary" />
            <span className="text-white text-sm font-medium">Hours Today: <span className="text-primary">6h 30m</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
            <CalendarDays size={16} className="text-blue-400" />
            <span className="text-white text-sm font-medium">Leave Balance: <span className="text-blue-400">12 days</span></span>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={ClipboardCheck} label="Attendance This Month" value="22/24"    sub="2 days absent"    color="bg-green-500/20 text-green-400"  bg="bg-white/5" />
        <StatCard icon={CheckSquare}   label="Tasks Assigned"        value="14"        sub="5 completed"      color="bg-blue-500/20 text-blue-400"    bg="bg-white/5" />
        <StatCard icon={FolderKanban}  label="Active Projects"       value="3"         sub="1 due this week"  color="bg-primary/20 text-primary"       bg="bg-white/5" />
        <StatCard icon={Clock}         label="Hours This Week"        value="38h"       sub="Target: 40h"      color="bg-purple-500/20 text-purple-400" bg="bg-white/5" />
        <StatCard icon={CalendarOff}   label="Pending Leaves"         value="2"         sub="Awaiting approval" color="bg-yellow-500/20 text-yellow-400" bg="bg-white/5" />
        <StatCard icon={DollarSign}    label="Next Pay Date"          value="31 Jul"    sub="Salary: ₹45,000"  color="bg-emerald-500/20 text-emerald-400" bg="bg-white/5" />
        <StatCard icon={Video}         label="Meetings Today"         value="2"         sub="Next: 3:00 PM"    color="bg-pink-500/20 text-pink-400"     bg="bg-white/5" />
        <StatCard icon={AlertCircle}   label="Overdue Tasks"          value="1"         sub="Action needed"    color="bg-red-500/20 text-red-400"       bg="bg-white/5" />
      </div>

      {/* ── BOTTOM GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* My Tasks */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" /> My Tasks
            </h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>
          <TaskRow title="Design Login UI Revamp"      project="CMS Web App"    status="In Progress" due="Jul 25" />
          <TaskRow title="API Integration – Employee"  project="Backend Module"  status="Pending"     due="Jul 27" />
          <TaskRow title="Dashboard Statistics Cards"  project="CMS Web App"    status="Done"        due="Jul 22" />
          <TaskRow title="Write Unit Tests"            project="QA Module"      status="Pending"     due="Jul 30" />
        </div>

        {/* Leave Summary */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CalendarOff size={18} className="text-primary" /> My Leaves
            </h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">Apply Leave</span>
          </div>
          <LeaveRow type="Casual Leave"    dates="Jul 10 – Jul 11"   status="Approved" />
          <LeaveRow type="Sick Leave"      dates="Jul 18"            status="Approved" />
          <LeaveRow type="Personal Leave"  dates="Jul 28"            status="Pending"  />
          <LeaveRow type="Annual Leave"    dates="Aug 5 – Aug 7"     status="Pending"  />
        </div>

        {/* Upcoming Meetings */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Video size={18} className="text-primary" /> Upcoming Meetings
            </h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>
          {[
            { title: 'Sprint Planning',       time: 'Today  3:00 PM',   members: 6  },
            { title: 'Design Review',         time: 'Tomorrow  10:00 AM', members: 4 },
            { title: 'Client Presentation',   time: 'Jul 26  2:00 PM',  members: 8  },
          ].map((m, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{m.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{m.time}</p>
              </div>
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">
                {m.members} Members
              </span>
            </div>
          ))}
        </div>

        {/* Active Projects */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <FolderKanban size={18} className="text-primary" /> Active Projects
            </h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
          </div>
          {[
            { name: 'CMS Web App',     progress: 72, due: 'Aug 10', color: 'bg-primary' },
            { name: 'Backend Module',  progress: 45, due: 'Aug 20', color: 'bg-blue-500' },
            { name: 'QA Automation',   progress: 20, due: 'Sep 1',  color: 'bg-purple-500' },
          ].map((p, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-white text-sm font-medium">{p.name}</p>
                <span className="text-white/40 text-xs">Due {p.due}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${p.progress}%` }} />
              </div>
              <p className="text-white/40 text-xs mt-1">{p.progress}% completed</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;