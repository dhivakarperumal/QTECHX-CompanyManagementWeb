import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu, Search, Bell, Settings, User, LogOut, ChevronDown, X,
  LayoutDashboard, ClipboardCheck, CalendarOff, FolderKanban,
  CheckSquare, Clock, DollarSign, Video, CalendarDays, CalendarClock,
  TrendingUp, FileText, AlertCircle, CheckCircle2, Timer,
} from "lucide-react";
import { useAuth } from "../PrivateRouter/AuthContext";
import dayjs from "dayjs";

/* ── page title map ── */
const pageInfo = {
  "/employee":                   { title: "Dashboard",        icon: LayoutDashboard },
  "/employee/attendance":        { title: "My Attendance",    icon: ClipboardCheck },
  "/employee/leaves":            { title: "My Leave",         icon: CalendarOff },
  "/employee/projects":          { title: "My Projects",      icon: FolderKanban },
  "/employee/tasks":             { title: "My Tasks",         icon: CheckSquare },
  "/employee/timesheet":         { title: "Timesheet",        icon: Clock },
  "/employee/payroll":           { title: "Salary & Payroll", icon: DollarSign },
  "/employee/meetings":          { title: "Meetings",         icon: Video },
  "/employee/settings":          { title: "Settings",         icon: Settings },
  "/employee/settings/profile":  { title: "Profile",          icon: User },
};

const getPageInfo = (pathname) => {
  const sorted = Object.entries(pageInfo).sort((a, b) => b[0].length - a[0].length);
  for (const [path, info] of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) return info;
  }
  return { title: "Dashboard", icon: LayoutDashboard };
};

/* ── notification item ── */
const notifications = [
  { id: 1, type: "task",    icon: CheckSquare,  color: "text-blue-400",   bg: "bg-blue-500/15",   title: "New task assigned",          sub: "Design Review — Due Jul 25",  time: "2m ago" },
  { id: 2, type: "leave",   icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-500/15",  title: "Leave approved",             sub: "Jul 10 – Jul 11 Casual Leave", time: "1h ago" },
  { id: 3, type: "meeting", icon: Video,        color: "text-purple-400", bg: "bg-purple-500/15", title: "Meeting in 30 minutes",       sub: "Sprint Planning — 3:00 PM",    time: "30m ago" },
  { id: 4, type: "payroll", icon: DollarSign,   color: "text-emerald-400",bg: "bg-emerald-500/15",title: "Salary credited",            sub: "₹45,000 — July Payroll",       time: "2d ago" },
];

/* ══════════════════ MAIN HEADER ══════════════════ */
const EmployeeHeader = ({ onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSearch, setShowSearch]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [currentTime, setCurrentTime]       = useState(dayjs());
  const [unreadCount]                       = useState(notifications.length);

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);
  const inputRef    = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { profileName, role, email, logout } = useAuth();

  const userName = profileName || "Employee";
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Staff";
  const { title: pageTitle, icon: PageIcon } = getPageInfo(location.pathname);

  /* live clock */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  /* focus search input */
  useEffect(() => { if (showSearch) inputRef.current?.focus(); }, [showSearch]);

  /* click outside */
  useEffect(() => {
    const h = (e) => {
      if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveDropdown(null);
      if (showSearch && searchRef.current && !searchRef.current.contains(e.target))
        setShowSearch(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [activeDropdown, showSearch]);

  /* keyboard shortcut Cmd/Ctrl+K */
  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch(p => !p); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const toggle    = (name) => setActiveDropdown(p => p === name ? null : name);
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/employee/tasks?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  /* icon button */
  const IconBtn = ({ name, badge, title, children }) => (
    <button
      onClick={() => toggle(name)}
      title={title}
      className={`relative flex items-center justify-center w-[42px] h-[42px] rounded-[14px] transition-all duration-200 border
        ${activeDropdown === name
          ? "bg-white/10 border-white/20 text-white shadow-lg"
          : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-white/60 hover:text-white"
        }`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[#0d0d12] bg-primary">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0d0d12]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-18" ref={dropdownRef}>

          {/* ── HAMBURGER (mobile) ── */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition shrink-0"
          >
            <Menu size={18} />
          </button>

          {/* ── PAGE TITLE + CLOCK ── */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <PageIcon size={16} className="text-primary" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-base font-bold text-white truncate leading-tight">{pageTitle}</h1>
              <p className="text-[10px] text-white/35 leading-none">
                {currentTime.format("ddd, DD MMM YYYY")} · {currentTime.format("hh:mm:ss A")}
              </p>
            </div>
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Search bar */}
            <button
              onClick={() => setShowSearch(p => !p)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white transition text-xs"
            >
              <Search size={14} />
              <span className="hidden md:block">Search...</span>
              <span className="hidden md:block text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md">⌘K</span>
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Notifications Bell */}
            <div className="relative">
              <IconBtn name="notifications" badge={unreadCount} title="Notifications">
                <Bell size={18} />
              </IconBtn>

              {activeDropdown === "notifications" && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-[#13141a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Bell size={14} className="text-primary" /> Notifications
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/20 text-primary">
                      {unreadCount} New
                    </span>
                  </div>
                  {/* list */}
                  <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                    {notifications.map(n => {
                      const NIcon = n.icon;
                      return (
                        <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition cursor-pointer group">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${n.bg}`}>
                            <NIcon size={14} className={n.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white group-hover:text-primary transition">{n.title}</p>
                            <p className="text-[10px] text-white/40 mt-0.5 truncate">{n.sub}</p>
                          </div>
                          <span className="text-[9px] text-white/25 shrink-0 mt-0.5">{n.time}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button className="w-full block text-center py-2.5 border-t border-white/10 text-[11px] font-bold text-primary hover:bg-primary/10 transition uppercase tracking-widest">
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Quick links */}
            <IconBtn name="quick" title="Quick Actions">
              <TrendingUp size={18} />
            </IconBtn>
            {activeDropdown === "quick" && (
              <div className="absolute right-20 top-full mt-3 w-48 bg-[#13141a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5 space-y-0.5">
                {[
                  { label: "Apply Leave",   path: "/employee/leaves/apply",    icon: CalendarOff  },
                  { label: "Log Hours",     path: "/employee/timesheet/log",    icon: Clock        },
                  { label: "My Tasks",      path: "/employee/tasks",            icon: CheckSquare  },
                  { label: "Meetings",      path: "/employee/meetings",         icon: Video        },
                  { label: "My Pay Slips",  path: "/employee/payroll/slips",    icon: DollarSign   },
                ].map(l => {
                  const LIcon = l.icon;
                  return (
                    <Link key={l.path} to={l.path} onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/8 text-sm text-white/70 hover:text-white transition">
                      <LIcon size={14} className="text-primary" /> {l.label}
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => toggle("profile")}
                className={`flex items-center gap-2.5 pl-2 pr-3 h-9 rounded-xl transition-all duration-200 border
                  ${activeDropdown === "profile"
                    ? "bg-primary/15 border-primary/40 shadow-lg shadow-primary/10"
                    : "bg-white/8 hover:bg-white/15 border-white/10"
                  }`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{userName}</p>
                  <p className="text-[10px] text-white/40 leading-none">{userRole}</p>
                </div>
                <ChevronDown size={13} className={`hidden sm:block text-white/40 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
              </button>

              {/* Profile dropdown */}
              {activeDropdown === "profile" && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-[#13141a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* user info */}
                  <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-base font-bold shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{userName}</p>
                      <p className="text-[10px] text-white/40 truncate">{email}</p>
                      <span className="inline-block mt-1 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">{userRole}</span>
                    </div>
                  </div>
                  {/* links */}
                  <div className="p-1.5 space-y-0.5">
                    <Link to="/employee/settings/profile" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                      <User size={15} className="text-white/40" /> My Profile
                    </Link>
                    <Link to="/employee/settings" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                      <Settings size={15} className="text-white/40" /> Settings
                    </Link>
                    <Link to="/employee/payroll/slips" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                      <DollarSign size={15} className="text-white/40" /> Pay Slips
                    </Link>
                    <div className="h-px bg-white/10 my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/15 text-sm text-red-400 hover:text-red-300 transition">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── SEARCH OVERLAY ── */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={() => setShowSearch(false)}>
          <div ref={searchRef} className="w-full max-w-2xl bg-[#13141a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search size={18} className="text-primary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search tasks, projects, leaves..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/30"
              />
              <button type="button" onClick={() => setShowSearch(false)} className="text-white/30 hover:text-white transition">
                <X size={18} />
              </button>
            </form>
            <div className="px-5 py-3">
              <p className="text-[11px] text-white/30 uppercase tracking-widest mb-2">Quick Links</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "My Tasks",     path: "/employee/tasks" },
                  { label: "Attendance",   path: "/employee/attendance" },
                  { label: "Apply Leave",  path: "/employee/leaves/apply" },
                  { label: "Timesheet",    path: "/employee/timesheet" },
                  { label: "My Projects",  path: "/employee/projects" },
                  { label: "Pay Slips",    path: "/employee/payroll/slips" },
                ].map(l => (
                  <Link key={l.path} to={l.path} onClick={() => setShowSearch(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary text-white/60 text-xs transition border border-white/8">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="px-5 py-2 text-[10px] text-white/20 flex justify-between border-t border-white/5">
              <span>Press <kbd className="bg-white/10 px-1 rounded">Enter</kbd> to search</span>
              <span>Press <kbd className="bg-white/10 px-1 rounded">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeHeader;
