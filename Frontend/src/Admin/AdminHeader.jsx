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
  if (type === "orders") viewAllLink = "/admin/orders";
  if (type === "stock") viewAllLink = "/admin/products";
  if (type === "members") viewAllLink = "/admin/members";
  if (type === "expiry") viewAllLink = "/admin/expiry-members";

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
          if (type === "orders")  { link = "/admin/orders";         label = item.order_id;     sub = `₹${item.total}`; }
          if (type === "stock")   { link = "/admin/products";       label = item.name;          sub = item.category; }
          if (type === "members") { link = "/admin/members";        label = item.name || "New Member"; sub = `Joined ${dayjs(item.createdAt).format("hh:mm A")}`; }
          if (type === "expiry")  { link = "/admin/expiry-members"; label = item.username;      sub = item.planName; }
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
  const [alerts, setAlerts] = useState({ orders: [], lowStock: [], expiring: [], registrations: [] });
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

  /* fetch alerts */
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [o, s, e, r] = await Promise.all([
          api.get("/orders/today").catch(() => ({ data: [] })),
          api.get("/products/alerts/low-stock").catch(() => ({ data: [] })),
          api.get("/memberships/alerts/expiring-soon").catch(() => ({ data: [] })),
          api.get("/memberships/today").catch(() => ({ data: [] })),
        ]);
        const todayStr = new Date().toDateString();
        setAlerts({
          orders: o.data || [],
          lowStock: s.data || [],
          expiring: e.data || [],
          registrations: (r.data || []).filter(x => new Date(x.createdAt || x.created_at).toDateString() === todayStr),
        });
      } catch {}
    };
    fetchAlerts();
    const t = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(t);
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
  const totalAlerts = alerts.orders.length + alerts.lowStock.length + alerts.expiring.length + alerts.registrations.length;

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
        className={`relative flex items-center justify-center w-[42px] h-[42px] rounded-[14px] transition-all duration-200 border
          ${activeDropdown === name
            ? "bg-white/10 border-white/20 text-white shadow-lg"
            : "bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08] text-white/60 hover:text-white"
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

            {/* Orders */}
            <IconBtn name="orders" badge={alerts.orders.length} badgeColor="bg-green-500" title="Today's Orders">
              <ShoppingBag size={18} />
            </IconBtn>
            {activeDropdown === "orders" && (
              <AlertDropdown title="Today's Orders" items={alerts.orders} icon={<ShoppingBag size={13} className="text-green-400" />} type="orders" onClose={() => setActiveDropdown(null)} accent="bg-green-500/20 text-green-400" />
            )}

            {/* Low Stock */}
            <IconBtn name="stock" badge={alerts.lowStock.length} badgeColor="bg-orange-500" title="Low Stock">
              <Package size={18} />
            </IconBtn>
            {activeDropdown === "stock" && (
              <AlertDropdown title="Stock Alerts" items={alerts.lowStock} icon={<Package size={13} className="text-orange-400" />} type="stock" onClose={() => setActiveDropdown(null)} accent="bg-orange-500/20 text-orange-400" />
            )}

            {/* Expiring */}
            <IconBtn name="expiry" badge={alerts.expiring.length} badgeColor="bg-red-500" title="Expiring Plans">
              <Clock size={18} />
            </IconBtn>
            {activeDropdown === "expiry" && (
              <AlertDropdown title="Expiring Plans" items={alerts.expiring} icon={<Clock size={13} className="text-red-400" />} type="expiry" onClose={() => setActiveDropdown(null)} accent="bg-red-500/20 text-red-400" />
            )}

            {/* New Members */}
            <IconBtn name="members" badge={alerts.registrations.length} badgeColor="bg-blue-500" title="New Members Today">
              <Users size={18} />
            </IconBtn>
            {activeDropdown === "members" && (
              <AlertDropdown title="New Members" items={alerts.registrations} icon={<User size={13} className="text-blue-400" />} type="members" onClose={() => setActiveDropdown(null)} accent="bg-blue-500/20 text-blue-400" />
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
