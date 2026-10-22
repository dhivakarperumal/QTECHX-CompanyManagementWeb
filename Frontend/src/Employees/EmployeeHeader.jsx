import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu, Search, Settings, User, LogOut, ChevronDown, X,
  LayoutDashboard, ClipboardCheck, CalendarOff, FolderKanban,
  CheckSquare, Clock, DollarSign, Video, CalendarDays, CalendarClock,
  TrendingUp, FileText, AlertCircle, Timer,
} from "lucide-react";
import { useAuth } from "../PrivateRouter/AuthContext";
import dayjs from "dayjs";
import api from "../api";
import { NotificationBell } from "../PrivateRouter/NotificationsContext.jsx";

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

/* ══════════════════ MAIN HEADER ══════════════════ */
const EmployeeHeader = ({ onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSearch, setShowSearch]         = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [currentTime, setCurrentTime]       = useState(dayjs());
  const [todayAttendance, setTodayAttendance] = useState(null);

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);
  const inputRef    = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { profileName, role, email, logout, user } = useAuth();

  const userName = profileName || "Employee";
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Staff";
  const { title: pageTitle, icon: PageIcon } = getPageInfo(location.pathname);

  /* live clock */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchTodayAttendance = useCallback(async () => {
    if (!user) return;
    try {
      const possibleIds = [user?.employee_id, user?.employeeId, user?.user_id, user?.id, user?._id, user?.userId, user?.uuid, user?.emp_code].filter(Boolean).map(String);
      const targetId = user?.employee_id || possibleIds.find(id => id.length > 20) || possibleIds[0];
      if (!targetId) return;

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      const res = await api.get(`/attendance/by-employee?employee_id=${targetId}&date=${todayDateStr}`).catch(() => ({ data: { attendance: null } }));
      if (res.data?.attendance) {
        setTodayAttendance(res.data.attendance);
      } else {
        const monthRes = await api.get(`/attendance/${targetId}?month=${now.getMonth() + 1}&year=${year}`).catch(() => ({ data: { data: [] } }));
        const list = Array.isArray(monthRes.data?.data) ? monthRes.data.data : [];
        const record = list.find(r => (r.date === todayDateStr) || (r.attendance_date && String(r.attendance_date).startsWith(todayDateStr)));
        setTodayAttendance(record || null);
      }
    } catch (e) {
      console.warn('[Header] attendance fetch error:', e?.message);
    }
  }, [user]);

  useEffect(() => {
    fetchTodayAttendance();
    const interval = setInterval(fetchTodayAttendance, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchTodayAttendance, location.pathname]);

  const getAttendanceButtonInfo = () => {
    if (!todayAttendance || !todayAttendance.check_in_time) {
      return {
        label: 'Checkin',
        action: 'checkin',
        classes: 'border-orange-500/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20',
        disabled: false
      };
    }
    if (!todayAttendance.check_out_time) {
      return {
        label: 'Update Attendance',
        action: 'attendance',
        classes: 'border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20',
        disabled: false
      };
    }
    return {
      label: 'Completed',
      action: 'completed',
      classes: 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed opacity-60',
      disabled: true
    };
  };

  const attendanceBtn = getAttendanceButtonInfo();

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
  const handleLogout = () => {
    logout();
    setActiveDropdown(null);
    window.location.hash = "#/";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/employee/tasks?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleCheckin = () => {
    if (attendanceBtn.disabled) return;
    navigate(`/employee/attendance/summary?action=attendance&t=${Date.now()}`);
    setActiveDropdown(null);
  };

  /* icon button */
  const IconBtn = ({ name, badge, title, children }) => (
    <button
      onClick={() => toggle(name)}
      title={title}
      className={`relative flex items-center justify-center w-[42px] h-[42px] rounded-2xl transition-all duration-200 border
        ${activeDropdown === name
          ? "bg-white/[0.12] border-white/[0.15] text-white shadow-lg shadow-black/20"
          : "bg-white/[0.04] border-white/[0.06] text-white/50 hover:bg-white/[0.08] hover:text-white/90 hover:border-white/[0.1]"
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
      <header className="w-full bg-[#0d0d12]/95 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_20px_rgba(0,0,0,0.4)]">
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

            <NotificationBell />

            {/* Quick links */}
            <IconBtn name="quick" title="Quick Actions">
              <TrendingUp size={18} />
            </IconBtn>
            {activeDropdown === "quick" && (
              <div className="absolute right-20 top-full mt-3 w-48 bg-[#13141a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-1.5 space-y-0.5">
                {[
                  { label: "Apply Leave",   path: "/employee/leaves/apply",    icon: CalendarOff  },
                  { label: attendanceBtn.label, action: "checkin",             icon: Timer        },
                  { label: "My Tasks",      path: "/employee/tasks",            icon: CheckSquare  },
                  { label: "Meetings",      path: "/employee/meetings",         icon: Video        },
                  { label: "My Pay Slips",  path: "/employee/payroll/slips",    icon: DollarSign   },
                ].map(l => {
                  const LIcon = l.icon;
                  if (l.action === 'checkin') {
                    return (
                      <button key={l.label} type="button" onClick={() => { handleCheckin(); setActiveDropdown(null); }}
                        disabled={attendanceBtn.disabled}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left ${attendanceBtn.disabled ? 'text-white/30 cursor-not-allowed' : 'hover:bg-white/8 text-white/70 hover:text-white'}`}>
                        <LIcon size={14} className={attendanceBtn.disabled ? 'text-white/30' : 'text-primary'} /> {l.label}
                      </button>
                    );
                  }
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

            <button
              onClick={handleCheckin}
              disabled={attendanceBtn.disabled}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 h-9 text-sm font-medium transition ${attendanceBtn.classes}`}
            >
              <Timer size={14} />
              <span className="hidden sm:inline">{attendanceBtn.label}</span>
            </button>

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
