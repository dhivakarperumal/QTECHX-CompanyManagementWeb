import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  CalendarOff,
  FolderKanban,
  CheckSquare,
  Clock,
  DollarSign,
  Video,
  Home,
  X,
  ChevronLeft,
  ChevronDown,
  FileText,
  CalendarDays,
  TrendingUp,
  Users,
  CalendarClock,
  GraduationCap,
  UserCheck 
} from "lucide-react";

import { useAuth } from "../PrivateRouter/AuthContext";
import Logo from "/images/logo.png";

/* ================= NAV ITEMS ================= */
const navItems = [
  {
    path: "/employee",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },

  /* ---- ATTENDANCE ---- */
  {
    path: "/employee/attendance/summary",
    label: "My Attendance",
    icon: ClipboardCheck,
  },

  /* ---- LEAVE ---- */
  {
    path: "/employee/leaves/history",
    label: "My Leave",
    icon: CalendarDays,
  },

  /* ---- PROJECTS ---- */
  { path: "/employee/projects", label: "My Projects", icon: FolderKanban },


  /* ---- TASKS ---- */
  {
    label: "My Tasks",
    icon: CheckSquare,
    children: [
      { path: "/employee/tasks/today", label: "New Tasks", icon: CalendarDays },
      { path: "/employee/tasks", label: "All Tasks", icon: CheckSquare, exact: true },
      { path: "/employee/tasks/pending", label: "Pending Tasks", icon: FileText },
      { path: "/employee/tasks/completed", label: "Completed Tasks", icon: FolderKanban },
      { path: "/employee/tasks/cancelled", label: "Cancelled Tasks", icon: FileText },
    ],
  },

   /* ---- TRAINING ---- */
    {
      label: "Trainees & Internships",
      icon: GraduationCap,
      children: [
        { path: "/employee/trainees", label: "All Trainees & Interns", icon: GraduationCap },
        { path: "/employee/trainees/attendance", label: "Attendance", icon: ClipboardCheck },
        { path: "/employee/trainees/tasks", label: "Tasks", icon: CheckSquare },
        { path: "/employee/trainees/tasks/assign", label: "Assign Tasks", icon: UserCheck },
      ],
    },



  /* ---- PAYROLL ---- */
  {
    path: "/employee/payroll/slips",
    label: "Salary & Payroll",
    icon: DollarSign,
  },

  /* ---- MEETINGS ---- */
  { label: "Meetings", path: "/employee/meetings", icon: Video },



  /* ---- CALENDAR ---- */
  {
    path: "/employee/office-calendar",
    label: "Office Calendar",
    icon: CalendarDays,
  },
  {
    path: "/employee/my-calendar",
    label: "My Daily Calendar",
    icon: CalendarClock,
  }
];

/* ================= SIDEBAR ================= */
const EmployeeSidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  /* ===== AUTO OPEN DROPDOWN WHEN CHILD ACTIVE ===== */
  useEffect(() => {
    const activeMenu = navItems.find((item) => {
      if (!item.children) return false;

      return item.children.some((child) => {
        if (child.exact) {
          return location.pathname === child.path;
        }

        return (
          location.pathname === child.path ||
          location.pathname.startsWith(child.path + "/")
        );
      });
    });

    setOpenMenu(activeMenu ? activeMenu.label : null);
  }, [location.pathname]);

  const isRouteActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }

    if (path === "/employee/leaves/history" && location.pathname.startsWith("/employee/leaves")) {
      return true;
    }

    if (path === "/employee/payroll/slips" && location.pathname.startsWith("/employee/payroll")) {
      return true;
    }

    return location.pathname === path;
  };

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {/* ========== MOBILE OVERLAY ========== */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
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
          className={`flex items-center gap-3 border-b border-white/10 shrink-0 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"
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
                {userProfile?.displayName?.split(" ")[0] || "Employee"} Portal
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
                isRouteActive(c.path, c.exact)
              );

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={collapsed ? item.label : ""}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-sm
                      transition-all duration-200
                      ${isAnyChildActive
                        ? "bg-primary/15 text-primary"
                        : "text-white/60 hover:text-white hover:bg-white/8"
                      }
                    `}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 ${isAnyChildActive ? "text-primary" : ""
                        }`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium">
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""
                            }`}
                        />
                      </>
                    )}
                  </button>

                  {/* ===== SUB MENU ===== */}
                  {!collapsed && (
                    <div
                      className={`ml-8 mt-1.5 space-y-1.5 overflow-hidden transition-all duration-200 ${isMenuOpen
                        ? "max-h-60 opacity-100"
                        : "max-h-0 opacity-0"
                        }`}
                    >
                      {item.children.map((sub) => {
                        const SubIcon = sub.icon;
                        const isActive = location.pathname === sub.path;
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
            className={`w-3.5 h-3.5 transition-transform ${collapsed ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* ========== BOTTOM USER STRIP ========== */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(userProfile?.displayName?.[0] || "E").toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {userProfile?.displayName || "Employee"}
                </p>
                <p className="text-[10px] text-white/40 truncate">
                  {userProfile?.role || "Staff"}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default EmployeeSidebar;
