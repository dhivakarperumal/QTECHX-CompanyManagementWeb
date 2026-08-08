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
  Handshake,
  UserRoundPlus,
  List,
  FolderPlus,
  ClipboardList,
  Image,
  Server,
  Globe,
  PlusSquare,
  Edit3,
  UserCheck,
  Layers,
  AlertCircle,
  XCircle,
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

  /* ---- CLIENTS ---- */
  {
    label: "Clients",
    icon: Handshake,
    children: [
      { path: "/admin/clients", label: "All Clients", icon: Users },

      { path: "/admin/clients/followups", label: "Followups", icon: Clock },
    ],
  },


  /* ---- WORK ---- */
  {
    label: "Project Management",
    icon: FolderKanban,
    children: [
      { path: "/admin/projects", label: "All Projects", icon: FolderKanban },
      { path: "/admin/projects/assignments", label: "Assigned Projects", icon: UserCheck },

    ],
  },

  /* ---- PEOPLE ---- */
  {
    label: "Employees",
    icon: Users,
    children: [
      { path: "/admin/employees", label: "All Employees", icon: Users },
      // { path: "/admin/employees/add", label: "Add Employee", icon: UserCog },
      { path: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
      { path: "/admin/employees/leave", label: "Leave Management", icon: Briefcase },
    ],
  },



  {
    label: "Task Management",
    icon: CheckSquare,
    children: [
      { path: "/admin/tasks/new", label: "New Tasks", icon: PlusSquare },
      { path: "/admin/tasks", label: "All Tasks", icon: CheckSquare },
      { path: "/admin/tasks/pending", label: "Pending Tasks", icon: AlertCircle },
      { path: "/admin/tasks/completed", label: "Completed Tasks", icon: CheckSquare },
      { path: "/admin/tasks/cancelled", label: "Cancelled Tasks", icon: XCircle },
    ],
  },

  {
    label: "My Projects",
    icon: FolderKanban,
    children: [
      { path: "/admin/myprojects", label: "Projects Completed", icon: List },

      { path: "/admin/myprojects/plans", label: "Project Plans", icon: ClipboardList },
      { path: "/admin/myprojects/quotations", label: "Project Quotations", icon: FileText },


      { path: "/admin/myprojects/images", label: "Project Images", icon: Image },



      { path: "/admin/myprojects/expiry", label: "Hosting & Domain Expiry", icon: CalendarClock },
    ],
  },


  /* ---- TRAINING ---- */
  {
    label: "Trainees & Internships",
    icon: GraduationCap,
    children: [
      { path: "/admin/trainees", label: "All Trainees & Interns", icon: GraduationCap },
      { path: "/admin/trainees/attendance", label: "Attendance", icon: ClipboardCheck },
      { path: "/admin/trainees/tasks", label: "Tasks", icon: CheckSquare },
      { path: "/admin/trainees/tasks/assign", label: "Assign Tasks", icon: UserCheck },
    ],
  },


  /* ---- FINANCE ---- */
  {
    label: "Payroll",
    icon: Receipt,
    children: [
      { path: "/admin/expenses", label: "All Expenses", icon: Receipt, exact: true },
      { path: "/admin/expenses/salary", label: "Employee Salary", icon: DollarSign },
      { path: "/admin/expenses/project-payment", label: "Project Payment", icon: DollarSign },
      { path: "/admin/expenses/incomes", label: "Income", icon: DollarSign },
    ],
  },

  /* ---- ANALYTICS ---- */
  // {
  //   path: "/admin/reports",
  //   label: "Reports",
  //   icon: BarChart3,
  // },

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

  const isRouteActive = (path, exact = false) => {
    if (path === "/admin" || path === "/") return location.pathname === path;
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const toggleMenu = (label) => setOpenMenu(openMenu === label ? null : label);

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
          bg-[#0d0d12] bg-[radial-gradient(circle_at_top,_rgba(248,116,14,0.12),transparent_25%),radial-gradient(circle_at_85%_20%,_rgba(255,255,255,0.06),transparent_30%)]
          border-r border-white/10 backdrop-blur-xl
          shadow-[4px_0_30px_rgba(0,0,0,0.6)]
          transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "w-[88px]" : "w-72"}
        `}
      >
        {/* ========== LOGO ========== */}
        <div className={`flex items-center gap-3 border-b border-white/10 shrink-0 ${collapsed ? "px-3 py-4 justify-center" : "px-4 py-4"}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 p-1"
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.05) 100%)', border: '1px solid rgba(249,115,22,0.25)', boxShadow: '0 0 18px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          >
            <img src={Logo} alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <h1 className="text-sm font-semibold text-white tracking-tight">Q Techx Admin</h1>
              <p className="text-[11px] text-white/50 truncate">
                {userProfile?.displayName?.split(" ")[0] || "Administrator"}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-lg text-white/50 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========== NAVIGATION ========== */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;

            /* ===== DROPDOWN ITEM ===== */
            if (item.children) {
              const isMenuOpen = openMenu === item.label;
              const isAnyChildActive = item.children.some((c) => isRouteActive(c.path));

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={collapsed ? item.label : ""}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl text-sm
                      transition-all duration-200 group
                      ${isAnyChildActive
                        ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isAnyChildActive ? "text-primary" : ""}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium text-white truncate">{item.label}</span>
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
                      className={`ml-8 mt-1.5 space-y-1 overflow-hidden transition-all duration-200 ${isMenuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      {item.children.map((sub) => {
                        const SubIcon = sub.icon;
                        const isActive =
                          location.pathname === sub.path ||

                          // All Projects
                          (sub.path === "/admin/projects" &&
                            (
                              location.pathname === "/admin/projects/add" ||
                              (location.pathname.startsWith("/admin/projects/view/") && !location.pathname.startsWith("/admin/projects/assignments/view/")) ||
                              location.pathname.startsWith("/admin/projects/edit/")
                            )
                          ) ||

                          // Assigned Projects
                          (sub.path === "/admin/projects/assignments" &&
                            location.pathname.startsWith("/admin/projects/assignments/view/")
                          ) ||

                          // All Employees
                          (sub.path === "/admin/employees" &&
                            (
                              location.pathname === "/admin/employees/add" ||
                              location.pathname.startsWith("/admin/employees/view/") ||
                              location.pathname.startsWith("/admin/employees/edit/")
                            )) ||

                          (sub.path === "/admin/attendance" &&
                            (
                              location.pathname.startsWith("/admin/attendance/view/") ||
                              location.pathname.startsWith("/admin/attendance/edit/")
                            )) ||

                          // Leave Management
                          (sub.path === "/admin/employees/leave" &&
                            location.pathname.startsWith("/admin/leave-history/")) ||

                          // All Trainees
                          (sub.path === "/admin/trainees" &&
                            (
                              location.pathname === "/admin/trainees/add" ||
                              location.pathname.startsWith("/admin/trainees/view/") ||
                              location.pathname.startsWith("/admin/trainees/edit/")
                            )) ||

                          // Trainee Attendance
                          (sub.path === "/admin/trainees/attendance" &&
                            location.pathname.startsWith("/admin/trainees/attendance/view/")) ||

                          // Trainee Tasks
                          (sub.path === "/admin/trainees/tasks" &&
                            location.pathname.startsWith("/admin/trainees/tasks/view/"));
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => isOpen && onClose()}
                            className={`
                              flex items-center gap-2.5 px-3 py-3 rounded-2xl text-xs
                              transition-all duration-200
                              ${isActive
                                ? "bg-primary/90 text-white font-semibold shadow-[0_8px_20px_rgba(248,116,14,0.18)]"
                                : "text-white/50 hover:text-white hover:bg-white/10"
                              }
                            `}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{sub.label}</span>
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
                  flex items-center gap-3 px-3 py-3.5 rounded-2xl text-sm
                  transition-all duration-200
                  ${isActive
                    ? "bg-primary/90 text-white font-semibold shadow-[0_8px_20px_rgba(248,116,14,0.18)]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="font-medium truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* ========== COLLAPSE BUTTON ========== */}
        <button
          onClick={onToggleCollapse}
          className="
            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2
            w-8 h-8 rounded-full
            bg-primary/90 shadow-xl shadow-primary/40
            border border-white/10
            items-center justify-center
            text-white hover:scale-105 hover:bg-primary transition-all duration-200
          "
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* ========== BOTTOM USER STRIP ========== */}
        {!collapsed && (
          <div className="px-3 py-4 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner shadow-black/10">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(userProfile?.displayName?.[0] || "A").toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {userProfile?.displayName || "Administrator"}
                </p>
                <p className="text-[10px] text-white/50 truncate">
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
