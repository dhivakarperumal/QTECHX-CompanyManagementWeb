import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  ListTodo,
  UserPlus,
  Loader,
  CheckCircle2,
  UserCheck,
  List,
  BarChart2,
  Timer,
  Plane,
  Umbrella,
  CalendarOff,
  Send,
  History,
  Clock,
  CalendarClock,
  PlusCircle,
  GraduationCap,
  PlaySquare,
  BookMarked,
  PenTool,
  LineChart,
  Activity,
  Trophy,
  MessageSquare,
  Files,
  FileText,
  Building2,
  Users,
  MonitorPlay,
  CalendarRange,
  Calendar,
  Building,
  X,
  ChevronLeft,
  ChevronDown
} from "lucide-react";

import { useAuth } from "../PrivateRouter/AuthContext";
import Logo from "/images/logo.png";

/* ================= NAV ITEMS ================= */
const navItems = [
  {
    path: "/trainee",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },

  // My Tasks
  {
    label: "My Tasks",
    icon: Target,
    children: [
      { path: "/trainee/tasks/assigned", label: "Assigned Tasks", icon: UserPlus },
      { path: "/trainee/tasks/in-progress", label: "In Progress", icon: Loader },
      { path: "/trainee/tasks/completed", label: "Completed Tasks", icon: CheckCircle2 },
    ],
  },

  // My Attendance
  {
    label: "My Attendance",
    icon: UserCheck,
    children: [
      { path: "/trainee/attendance", label: "Attendance Log", icon: List },
      { path: "/trainee/attendance/summary", label: "Summary", icon: BarChart2 },
      { path: "/trainee/attendance/checkin", label: "Check In / Check Out", icon: Timer },
    ],
  },

  // Leave Management
  {
    label: "Leave Management",
    icon: Umbrella,
    children: [
      { path: "/trainee/leaves", label: "My Leaves", icon: CalendarOff },
      { path: "/trainee/leaves/apply", label: "Apply Leave", icon: Send },
      { path: "/trainee/leaves/history", label: "Leave History", icon: History },
    ],
  },

  // Timesheet
  {
    label: "Timesheet",
    icon: Clock,
    children: [
      { path: "/trainee/timesheet", label: "My Timesheet", icon: CalendarClock },
      { path: "/trainee/timesheet/add", label: "Add Timesheet", icon: PlusCircle },
      { path: "/trainee/timesheet/history", label: "Timesheet History", icon: History },
    ],
  },

  // Training
  {
    label: "Training",
    icon: GraduationCap,
    children: [
      { path: "/trainee/training/modules", label: "Training Modules", icon: PlaySquare },
      { path: "/trainee/training/materials", label: "Learning Materials", icon: BookMarked },
      { path: "/trainee/training/assignments", label: "Assignments", icon: PenTool },
    ],
  },

  // Performance
  {
    label: "Performance",
    icon: Activity,
    children: [
      { path: "/trainee/performance", label: "My Performance", icon: Trophy },
      { path: "/trainee/performance/feedback", label: "Feedback", icon: MessageSquare },
    ],
  },

  // Documents
  {
    label: "Documents",
    icon: Files,
    children: [
      { path: "/trainee/documents", label: "My Documents", icon: FileText },
      { path: "/trainee/documents/company", label: "Company Documents", icon: Building2 },
    ],
  },

  // Meetings
  {
    label: "Meetings",
    icon: MonitorPlay,
    children: [
      { path: "/trainee/meetings", label: "All Meetings", icon: List },
      { path: "/trainee/meetings/upcoming", label: "Upcoming", icon: CalendarRange },
    ],
  },

  // Calendars
  { path: "/trainee/office-calendar", label: "Office Calendar", icon: Building },
  { path: "/trainee/my-calendar", label: "My Daily Calendar", icon: Calendar },
];

/* ================= SIDEBAR ================= */
const TraineeSidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { profileName, role } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  /* ===== AUTO OPEN DROPDOWN WHEN CHILD ACTIVE ===== */
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) =>
            location.pathname === child.path ||
            location.pathname.startsWith(child.path + "/")
        );
        if (isChildActive) setOpenMenu(item.label);
      }
    });
  }, [location.pathname]);

  const isRouteActive = (path) => {
    if (path === "/trainee" || path === "/") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const toggleMenu = (label) => setOpenMenu(openMenu === label ? null : label);

  return (
    <>
      {/* ========== MOBILE OVERLAY ========== */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* ========== SIDEBAR ========== */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          bg-[#0d0d12] border-r border-white/10
          shadow-[4px_0_30px_rgba(0,0,0,0.5)]
          transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "w-[80px]" : "w-72"}
        `}
      >
        {/* ========== LOGO ========== */}
        <div
          className={`flex items-center gap-3 border-b border-white/10 shrink-0 ${
            collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"
          }`}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 p-1"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.05) 100%)', border: '1px solid rgba(249,115,22,0.25)', boxShadow: '0 0 18px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            <img src={Logo} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <h1 className="text-sm font-bold text-white leading-tight">
                Q Techx
              </h1>
              <p className="text-[10px] text-white/50 truncate">
                {profileName?.split(" ")[0] || "Trainee"} Portal
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-white/40 hover:bg-white/10 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========== NAVIGATION ========== */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;

            /* ===== DROPDOWN ITEM ===== */
            if (item.children) {
              const isMenuOpen = openMenu === item.label;
              const isAnyChildActive = item.children.some((c) =>
                isRouteActive(c.path)
              );

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={collapsed ? item.label : ""}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm
                      transition-all duration-200
                      ${
                        isAnyChildActive
                          ? "bg-primary/15 text-primary"
                          : "text-white/60 hover:text-white hover:bg-white/8"
                      }
                    `}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${
                        isAnyChildActive ? "text-primary" : ""
                      }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* ===== SUB MENU ===== */}
                  {!collapsed && (
                    <div
                      className={`ml-8 mt-1.5 space-y-1.5 overflow-hidden transition-all duration-200 ${
                        isMenuOpen
                          ? "max-h-60 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.children.map((sub) => {
                        const SubIcon = sub.icon;
                        const isActive = isRouteActive(sub.path);
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => isOpen && onClose()}
                            className={`
                              flex items-center gap-2.5 px-3 py-3 rounded-lg text-xs
                              transition-all duration-200
                              ${
                                isActive
                                  ? "bg-primary text-white font-semibold shadow-md shadow-primary/30"
                                  : "text-white/50 hover:text-white hover:bg-white/8"
                              }
                            `}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            /* ===== NORMAL ITEM ===== */
            const isActive = isRouteActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                title={collapsed ? item.label : ""}
                onClick={() => isOpen && onClose()}
                className={`
                  flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-white font-semibold shadow-md shadow-primary/30"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* ========== COLLAPSE BUTTON ========== */}
        <button
          onClick={onToggleCollapse}
          className="
            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-6 rounded-full
            bg-primary shadow-lg shadow-primary/40
            items-center justify-center
            text-white hover:scale-110 transition-all
          "
        >
          <ChevronLeft
            className={`w-3.5 h-3.5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* ========== BOTTOM USER STRIP ========== */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(profileName?.[0] || "T").toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {profileName || "Trainee"}
                </p>
                <p className="text-[10px] text-white/40 truncate">
                  {role || "Trainee"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default TraineeSidebar;
