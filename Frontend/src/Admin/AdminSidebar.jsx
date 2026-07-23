import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  GraduationCap,
  BookOpen,
  Receipt,
  DollarSign,
  CalendarOff,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  CalendarClock,
  X,
  ChevronDown,
  ChevronLeft,
  Home,
  Briefcase,
  UserCog,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";

import { useAuth } from "../PrivateRouter/AuthContext";
import Logo from "/images/logo.png";

/* ================= NAV ITEMS ================= */
const navItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },

  /* ---- PEOPLE ---- */
  {
    label: "Employees",
    icon: Users,
    children: [
      { path: "/admin/employees", label: "All Employees", icon: Users },
      { path: "/admin/employees/add", label: "Add Employee", icon: UserCog },
      { path: "/admin/employees/departments", label: "Departments", icon: Briefcase },
    ],
  },

  /* ---- WORK ---- */
  {
    label: "Project Management",
    icon: FolderKanban,
    children: [
      { path: "/admin/projects", label: "All Projects", icon: FolderKanban },
      { path: "/admin/projects/add", label: "New Project", icon: FileText },
    ],
  },

  {
    label: "Task Management",
    icon: CheckSquare,
    children: [
      { path: "/admin/tasks", label: "All Tasks", icon: CheckSquare },
      { path: "/admin/tasks/board", label: "Task Board", icon: FolderKanban },
    ],
  },

  /* ---- TRAINING ---- */
  {
    label: "Trainees Management",
    icon: GraduationCap,
    children: [
      { path: "/admin/trainees", label: "All Trainees", icon: GraduationCap },
      { path: "/admin/trainees/add", label: "Add Trainee", icon: UserCog },
    ],
  },

  {
    label: "Internship Management",
    icon: BookOpen,
    children: [
      { path: "/admin/internships", label: "All Internships", icon: BookOpen },
      { path: "/admin/internships/add", label: "Add Internship", icon: FileText },
    ],
  },

  /* ---- FINANCE ---- */
  {
    label: "Expenses",
    icon: Receipt,
    children: [
      { path: "/admin/expenses", label: "All Expenses", icon: Receipt },
      { path: "/admin/expenses/add", label: "Add Expense", icon: FileText },
    ],
  },

  {
    label: "Payroll",
    icon: DollarSign,
    children: [
      { path: "/admin/payroll", label: "Payroll Overview", icon: DollarSign },
      { path: "/admin/payroll/run", label: "Run Payroll", icon: TrendingUp },
    ],
  },

  /* ---- HR ---- */
  {
    label: "Leave Management",
    icon: CalendarOff,
    children: [
      { path: "/admin/leaves", label: "All Leaves", icon: CalendarOff },
      { path: "/admin/leaves/requests", label: "Leave Requests", icon: FileText },
    ],
  },

  {
    label: "Attendance",
    icon: ClipboardCheck,
    children: [
      { path: "/admin/attendance", label: "Attendance Log", icon: ClipboardCheck },
      { path: "/admin/attendance/summary", label: "Summary", icon: BarChart3 },
    ],
  },

  /* ---- ANALYTICS ---- */
  {
    path: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
  },

  /* ---- CALENDAR ---- */
  {
    path: "/admin/office-calendar",
    label: "Office Calendar",
    icon: CalendarDays,
  },

  {
    path: "/admin/my-calendar",
    label: "My Daily Calendar",
    icon: CalendarClock,
  }
];

/* ================= SIDEBAR ================= */
const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  /* ===== AUTO OPEN DROPDOWN WHEN CHILD ACTIVE ===== */
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          location.pathname === child.path || location.pathname.startsWith(child.path + "/")
        );
        if (isChildActive) setOpenMenu(item.label);
      }
    });
  }, [location.pathname]);

  const isRouteActive = (path) => {
    if (path === "/admin" || path === "/") return location.pathname === path;
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
        <div className={`flex items-center gap-3 border-b border-white/10 shrink-0 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/40 shrink-0">
            <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <h1 className="text-sm font-bold text-white leading-tight">Q Techx Admin</h1>
              <p className="text-[10px] text-white/50 truncate">
                {userProfile?.displayName?.split(" ")[0] || "Administrator"}
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
              const isAnyChildActive = item.children.some((c) => isRouteActive(c.path));

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={collapsed ? item.label : ""}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm
                      transition-all duration-200 group
                      ${isAnyChildActive
                        ? "bg-primary/15 text-primary"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isAnyChildActive ? "text-primary" : ""}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">{item.label}</span>
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
                        isMenuOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
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
                              ${isActive
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
                  ${isActive
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
            className={`w-3.5 h-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* ========== BOTTOM USER STRIP ========== */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(userProfile?.displayName?.[0] || "A").toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {userProfile?.displayName || "Administrator"}
                </p>
                <p className="text-[10px] text-white/40 truncate">
                  {userProfile?.role || "Super Admin"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
