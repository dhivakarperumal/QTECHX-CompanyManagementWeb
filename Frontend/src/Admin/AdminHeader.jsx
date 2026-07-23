import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu, Search, Bell, Settings, User, LogOut, ChevronDown,
  ShoppingBag, Package, Clock, X, LayoutDashboard, MessageSquare,
  Users, CreditCard, UserCheck, ClipboardList, Activity, UserRound,
  CalendarCheck, Receipt, ShoppingCart, BarChart3, Dumbbell, Send,
  Boxes, Plus, PhoneCall, HeartPulse, FolderKanban, CheckSquare,
  DollarSign, CalendarOff, BookOpen, GraduationCap, CalendarDays,
  CalendarClock, TrendingUp,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../PrivateRouter/AuthContext";
import dayjs from "dayjs";

/* ── page title map ── */
const pageInfo = {
  "/admin":                         { title: "Dashboard",             icon: LayoutDashboard },
  "/admin/employees":               { title: "Employees",             icon: Users },
  "/admin/projects":                { title: "Project Management",    icon: FolderKanban },
  "/admin/tasks":                   { title: "Task Management",       icon: CheckSquare },
  "/admin/trainees":                { title: "Trainees Management",   icon: GraduationCap },
  "/admin/internships":             { title: "Internship Management", icon: BookOpen },
  "/admin/expenses":                { title: "Expenses",              icon: Receipt },
  "/admin/payroll":                 { title: "Payroll",               icon: DollarSign },
  "/admin/leaves":                  { title: "Leave Management",      icon: CalendarOff },
  "/admin/attendance":              { title: "Attendance",            icon: CalendarCheck },
  "/admin/reports":                 { title: "Reports",               icon: BarChart3 },
  "/admin/office-calendar":         { title: "Office Calendar",       icon: CalendarDays },
  "/admin/my-calendar":             { title: "My Daily Calendar",     icon: CalendarClock },
  "/admin/followupenquriy":         { title: "Follow Up Enquiry",     icon: PhoneCall },
  "/admin/members":                 { title: "Members",               icon: Users },
  "/admin/payments":                { title: "Payments",              icon: CreditCard },
  "/admin/billing":                 { title: "Billing",               icon: Receipt },
  "/admin/orders":                  { title: "Orders",                icon: ShoppingCart },
  "/admin/settings":                { title: "Settings",              icon: Settings },
  "/admin/settings/profile":        { title: "Profile",               icon: User },
  "/admin/send-message":            { title: "Bulk Messaging",        icon: Send },
};

/* ── helpers ── */
const getPageInfo = (pathname) => {
  const sorted = Object.entries(pageInfo).sort((a, b) => b[0].length - a[0].length);
  for (const [path, info] of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) return info;
  }
  return { title: "Dashboard", icon: LayoutDashboard };
};

const AlertDropdown = ({ title, items, icon, type, onClose, accent }) => {
  let viewAllLink = "/admin";
  if (type === "tasks") viewAllLink = "/admin/tasks";
  if (type === "projects") viewAllLink = "/admin/projects";
  if (type === "leaves") viewAllLink = "/admin/leaves";

  return (
    <div className="absolute right-0 top-full mt-3 w-80 bg-[#13141a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <span className="text-sm font-bold text-white flex items-center gap-2">{icon} {title}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${accent}`}>{items.length} Active</span>
      </div>
      {/* list */}
      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
        {items.length ? items.map((item, i) => {
          let link = "/admin", label = "", sub = "";
          if (type === "tasks")    { link = "/admin/tasks";    label = item.title;       sub = item.project; }
          if (type === "projects") { link = "/admin/projects"; label = item.name;        sub = `Due: ${item.due}`; }
          if (type === "leaves")   { link = "/admin/leaves";   label = item.employee;    sub = item.type; }
          return (
            <Link key={i} to={link} onClick={onClose} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition group">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="text-xs font-semibold text-white group-hover:text-primary transition">{label}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{sub}</p>
              </div>
            </Link>
          );
        }) : (
          <div className="py-8 text-center text-white/30 text-xs">No alerts</div>
        )}
      </div>
      <Link to={viewAllLink} onClick={onClose} className="block text-center py-2.5 border-t border-white/10 text-[11px] font-bold text-primary hover:bg-primary/10 transition uppercase tracking-widest">
        View All
      </Link>
    </div>
  );
};

/* ══════════════════ MAIN HEADER ══════════════════ */
const Header = ({ onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState({ tasks: [], projects: [], leaves: [] });
  const [currentTime, setCurrentTime] = useState(dayjs());

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);
  const inputRef    = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { profileName, role, email, logout } = useAuth();

  const userName = profileName || "Admin";
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Administrator";
  const { title: pageTitle, icon: PageIcon } = getPageInfo(location.pathname);

  /* clock */
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);

  /* fetch alerts mock */
  useEffect(() => {
    // Setting some mock alerts for demonstration
    setAlerts({
      tasks: [
        { title: "Design Login UI Revamp", project: "CMS Web App" },
        { title: "API Integration – Employee", project: "Backend Module" }
      ],
      projects: [
        { name: "CMS Web App", due: "Aug 10" },
        { name: "Backend Module", due: "Aug 20" }
      ],
      leaves: [
        { employee: "Rahul Kumar", type: "Casual Leave" },
        { employee: "Priya Sharma", type: "Sick Leave" }
      ]
    });
  }, []);

  /* focus search */
  useEffect(() => { if (showSearch) inputRef.current?.focus(); }, [showSearch]);

  /* click outside */
  useEffect(() => {
    const h = (e) => {
      if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) setActiveDropdown(null);
      if (showSearch && searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [activeDropdown, showSearch]);

  const toggle = (name) => setActiveDropdown(p => p === name ? null : name);
  const totalAlerts = alerts.tasks.length + alerts.projects.length + alerts.leaves.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    let target = "/admin/members";
    if (location.pathname.includes("projects"))  target = "/admin/projects";
    if (location.pathname.includes("employees")) target = "/admin/employees";
    navigate(`${target}?search=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  /* icon button helper */
  const IconBtn = ({ name, badge, badgeColor, title, children }) => (
    <div className="relative">
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
          <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[#0d0d12] ${badgeColor}`}>
            {badge}
          </span>
        )}
      </button>
    </div>
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

          {/* ── PAGE TITLE ── */}
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

            {/* Search */}
            <button
              onClick={() => setShowSearch(p => !p)}
              className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white/50 hover:text-white transition text-xs"
            >
              <Search size={14} />
              <span className="hidden md:block">Search...</span>
              <span className="hidden md:block text-[10px] bg-white/10 px-1.5 py-0.5 rounded-md">⌘K</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Task Updates */}
            <IconBtn name="tasks" badge={alerts.tasks.length} badgeColor="bg-blue-500" title="Task Updates">
              <CheckSquare size={18} />
            </IconBtn>
            {activeDropdown === "tasks" && (
              <AlertDropdown title="Task Updates" items={alerts.tasks} icon={<CheckSquare size={13} className="text-blue-400" />} type="tasks" onClose={() => setActiveDropdown(null)} accent="bg-blue-500/20 text-blue-400" />
            )}

            {/* Project Updates */}
            <IconBtn name="projects" badge={alerts.projects.length} badgeColor="bg-purple-500" title="Project Updates">
              <FolderKanban size={18} />
            </IconBtn>
            {activeDropdown === "projects" && (
              <AlertDropdown title="Project Updates" items={alerts.projects} icon={<FolderKanban size={13} className="text-purple-400" />} type="projects" onClose={() => setActiveDropdown(null)} accent="bg-purple-500/20 text-purple-400" />
            )}

            {/* Leave Requests */}
            <IconBtn name="leaves" badge={alerts.leaves.length} badgeColor="bg-yellow-500" title="Leave Requests">
              <CalendarOff size={18} />
            </IconBtn>
            {activeDropdown === "leaves" && (
              <AlertDropdown title="Leave Requests" items={alerts.leaves} icon={<CalendarOff size={13} className="text-yellow-400" />} type="leaves" onClose={() => setActiveDropdown(null)} accent="bg-yellow-500/20 text-yellow-400" />
            )}

            {/* Bell summary */}
            <IconBtn name="bell" badge={totalAlerts} badgeColor="bg-primary" title="All Notifications">
              <Bell size={18} />
            </IconBtn>

            {/* Divider */}
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
                    </div>
                  </div>
                  {/* links */}
                  <div className="p-1.5 space-y-0.5">
                    <Link to="/admin/settings/profile" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                      <User size={15} className="text-white/40" /> Profile
                    </Link>
                    <Link to="/admin/settings" onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                      <Settings size={15} className="text-white/40" /> Settings
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
                placeholder="Search employees, projects, tasks..."
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
                  { label: "Employees", path: "/admin/employees" },
                  { label: "Projects", path: "/admin/projects" },
                  { label: "Attendance", path: "/admin/attendance" },
                  { label: "Payroll", path: "/admin/payroll" },
                  { label: "Reports", path: "/admin/reports" },
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

export default Header;
