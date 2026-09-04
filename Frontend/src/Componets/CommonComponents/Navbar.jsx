import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { FiChevronDown, FiX, FiLogOut, FiArrowRight, FiUser } from "react-icons/fi";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import api from "../../api";
import {
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaUsersCog,
  FaShoppingCart,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
} from "react-icons/fa";
import PageContainer from "./PageContainer";
import { getRoleHome, isAdminRole, isEmployeeRole } from "../../PrivateRouter/roleUtils";

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [services, setServices] = useState([]);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const roleHome = getRoleHome(role);
  const roleLabel = isAdminRole(role)
    ? "Admin Panel"
    : isEmployeeRole(role)
      ? "Employee Panel"
      : "My Profile";

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/services/public/all");
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch services for navbar:", err?.message);
      }
    };

    fetchServices();
  }, []);

  const whoWeAreLinks = [
    { id: 1, title: "Why Choose Us", path: "/whychooseus" },
    { id: 2, title: "Who We Work With", path: "/whoweworkwith" },
    { id: 3, title: "What We Do", path: "/whatwedo" },
  ];

  const iconMap = {
    FaCode,
    FaLaptopCode,
    FaPaintBrush,
    FaSearch,
    FaMobileAlt,
    FaUsersCog,
    FaShoppingCart,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaBullhorn,
  };

  useEffect(() => {
    setOpenMenu(null);
    setMobileSubMenu(null);
    setMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const isServicesActive =
    location.pathname === "/services" || location.pathname.startsWith("/services/");

  const isWhoWeAreActive =
    whoWeAreLinks.some(
      (link) => location.pathname === link.path || location.pathname.startsWith(link.path + "/")
    ) || location.pathname === "/achievements";

  const desktopLinkClass = ({ isActive }) =>
    `text-base font-semibold  transition-colors ${isActive ? "text-primary" : "text-white hover:text-primary"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition ${isActive ? "bg-primary/10 text-primary" : "text-white/80 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-orange-500/20 bg-[#070b12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <PageContainer>
          <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between ">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FF6A00]/45 bg-[#111820] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.28)] sm:h-14 sm:w-14">
                <img src="/images/logo.png" alt="Q-Techx logo" className="h-full w-full object-contain" />
              </span>
              <div className="leading-none">
                <div className="text-[18px] font-black tracking-tight text-white sm:text-[20px]">Q-TECHX</div>
                <div className="mt-0.5 text-[8px] font-semibold tracking-[0.32em] text-orange-300/90 sm:text-[9px]">SOLUTIONS</div>
              </div>
            </Link>

            <ul className=" hidden items-center gap-8 md:flex" ref={dropdownRef}>
              <li><NavLink to="/" className={desktopLinkClass}>Home</NavLink></li>
              <li><NavLink to="/about" className={desktopLinkClass}>About</NavLink></li>

              <li className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu("services")}
                  className={`group flex items-center gap-1 text-base font-semibold transition-all duration-300 ${isServicesActive ? "text-primary" : "text-white hover:text-primary"
                    }`}
                >
                  Services

                  <FiChevronDown
                    className={`text-xs transition-all duration-300 ${openMenu === "services"
                        ? "rotate-180 text-primary"
                        : isServicesActive
                          ? "text-primary"
                          : "rotate-0 text-white/70 group-hover:text-primary"
                      }`}
                  />
                </button>

                {/* Animated Dropdown */}
                <div
                  className={`absolute left-1/2 top-full z-50 mt-4 w-[36rem] -translate-x-1/2
      transition-all duration-300 ease-out
      ${openMenu === "services"
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible -translate-y-3 scale-95 opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-[#FF6A00]/20 bg-[#0d0d0d]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl">

                    {/* Orange glow */}
                    <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#FF6A00]/10 blur-3xl" />

                    {/* Top orange line */}
                    <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent" />

                    <div className="mb-3 px-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF6A00]">
                        What We Do
                      </p>

                      <h3 className="mt-1 text-sm font-bold text-white">
                        Our Services
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {services.length > 0 ? (
                        services.map((srv, index) => {
                          const Icon = iconMap[srv.icon] || FaCode;

                          return (
                            <NavLink
                              key={srv.id}
                              to={`/services/${srv.id}`}
                              className={({ isActive }) =>
                                `group/service flex items-center gap-2 rounded-xl border
                  px-3 py-2.5 text-sm
                  transition-all duration-300
                  hover:-translate-y-0.5
                  ${isActive
                                  ? "border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF6A00]"
                                  : "border-white/5 bg-white/[0.03] text-white/70 hover:border-[#FF6A00]/30 hover:bg-[#FF6A00]/5 hover:text-white"
                                }`
                              }
                              style={{
                                transitionDelay:
                                  openMenu === "services"
                                    ? `${index * 35}ms`
                                    : "0ms",
                              }}
                            >
                              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF6A00]/10 transition-all duration-300 group-hover/service:bg-[#FF6A00]">
                                <Icon className="text-sm text-[#FF6A00] transition-colors duration-300 group-hover/service:text-black" />
                              </span>

                              <span className="truncate">
                                {srv.title}
                              </span>
                            </NavLink>
                          );
                        })
                      ) : (
                        <p className="col-span-2 py-3 text-sm text-white/50">
                          Loading services...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>

              <li><NavLink to="/projects" className={desktopLinkClass}>Projects</NavLink></li>
              <li><NavLink to="/prices" className={desktopLinkClass}>Prices</NavLink></li>

              <li className="relative">
                <button
                  type="button"
                  onClick={() => toggleMenu("whoWeAre")}
                  className={`group flex items-center gap-1 text-base font-semibold transition-all duration-300 ${isWhoWeAreActive ? "text-primary" : "text-white hover:text-primary"
                    }`}
                >
                  Who We Are?

                  <FiChevronDown
                    className={`text-xs transition-all duration-300 ${openMenu === "whoWeAre"
                        ? "rotate-180 text-primary"
                        : isWhoWeAreActive
                          ? "text-primary"
                          : "rotate-0 text-white/70 group-hover:text-primary"
                      }`}
                  />
                </button>

                {/* Animated Dropdown */}
                <div
                  className={`absolute left-1/2 top-full z-50 mt-4 w-72 -translate-x-1/2
      transition-all duration-300 ease-out
      ${openMenu === "whoWeAre"
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible -translate-y-3 scale-95 opacity-0 pointer-events-none"
                    }`}
                >
                  <div className="relative overflow-hidden rounded-2xl border border-[#FF6A00]/20 bg-[#0d0d0d]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl">

                    {/* Glow */}
                    <div className="pointer-events-none absolute -left-16 -top-16 h-32 w-32 rounded-full bg-[#FF6A00]/10 blur-3xl" />

                    {/* Orange top line */}
                    <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent" />

                    <div className="mb-2 px-2 py-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF6A00]">
                        Discover Q-Techx
                      </p>

                      <h3 className="mt-1 text-sm font-bold text-white">
                        Who We Are
                      </h3>
                    </div>

                    <div className="space-y-1">
                      {whoWeAreLinks.map((item, index) => (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          className={({ isActive }) =>
                            `group/who flex items-center justify-between rounded-xl
              px-3 py-3 text-sm
              transition-all duration-300
              hover:translate-x-1
              ${isActive
                              ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                              : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                            }`
                          }
                          style={{
                            transitionDelay:
                              openMenu === "whoWeAre"
                                ? `${index * 60}ms`
                                : "0ms",
                          }}
                        >
                          <span>{item.title}</span>

                          <FiArrowRight
                            className="text-sm text-[#FF6A00] opacity-0 transition-all duration-300 group-hover/who:translate-x-1 group-hover/who:opacity-100"
                          />
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </div>
              </li>

              <li><NavLink to="/career" className={desktopLinkClass}>Career</NavLink></li>
            </ul>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-strong px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(248,116,14,0.35)] hover:scale-[1.02]"
              >
                Let&apos;s Talk
                <FiArrowRight className="text-base" />
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    aria-expanded={openMenu === "profile"}
                    onClick={() => toggleMenu("profile")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 text-xl text-[#FF6A00] transition-all hover:bg-[#FF6A00] hover:text-black"
                  >
                    <FiUser />
                  </button>
                  <div
                    className={`absolute right-0 top-full mt-3 w-52 rounded-2xl border border-[#FF6A00]/20 bg-[#0d0d0d]/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-200 ${openMenu === "profile" ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0 pointer-events-none"}`}
                  >
                    {roleHome !== "/" && (
                      <Link
                        to={roleHome}
                        onClick={() => setOpenMenu(null)}
                        className="block rounded-xl px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#FF6A00]/10 hover:text-[#FF6A00]"
                      >
                        {roleLabel}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(null);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
                    >
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 px-5 py-2.5 text-sm font-semibold text-[#FF6A00] transition-all duration-300 hover:bg-[#FF6A00] hover:text-black hover:shadow-[0_8px_25px_rgba(255,106,0,0.3)]"
                >
                  Login
                </Link>
              )}
            </div>

            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenu(true)}
              className="
    group relative flex h-12 w-12
    items-center justify-center
    overflow-hidden rounded-2xl
    border border-white/10
    bg-white/[0.04]
    backdrop-blur-xl
    transition-all duration-300
    hover:border-[#FF6A00]/50
    hover:bg-[#FF6A00]/10
    active:scale-90
    md:hidden
  "
            >
              {/* Orange glow */}
              <span
                className="
      absolute h-8 w-8 rounded-full
      bg-[#FF6A00]/20
      blur-xl
      transition-all duration-500
      group-hover:bg-[#FF6A00]/40
    "
              />

              <span className="relative flex flex-col gap-[5px]">
                <span className="h-[2px] w-5 rounded-full bg-[#FF6A00] transition-all duration-300 group-hover:w-6" />
                <span className="h-[2px] w-4 self-end rounded-full bg-white transition-all duration-300 group-hover:w-6 group-hover:bg-[#FF6A00]" />
                <span className="h-[2px] w-5 rounded-full bg-[#FF6A00] transition-all duration-300 group-hover:w-4" />
              </span>
            </button>
          </div>
        </PageContainer>
        {/* Subtle separator */}
        <div className="h-px w-full bg-white/30" />

      </nav>

      {/* mobile menu */}
      <div
        className={`fixed inset-0 z-[9999] md:hidden transition-opacity duration-300 ${mobileMenu
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${mobileMenu ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setMobileMenu(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto
    border-l border-[#FF6A00]/20 bg-[#080808] p-4
    shadow-[-20px_0_60px_rgba(0,0,0,0.65)]
    transition-transform duration-500
    ease-[cubic-bezier(0.22,1,0.36,1)]
    ${mobileMenu
              ? "translate-x-0"
              : "translate-x-full"
            }`}
        >
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#FF6A00]/45 bg-[#111820] p-2">
                <img src="/images/logo.png" alt="Q-Techx logo" className="h-full w-full object-contain" />
              </span>
              <div className="leading-none">
                <div className="text-base font-black tracking-tight text-white">Q-TECHX</div>
                <div className="mt-1 text-[7px] font-semibold tracking-[0.28em] text-orange-300">SOLUTIONS</div>
              </div>
            </div>

            <button type="button" onClick={() => setMobileMenu(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-white">
              <FiX />
            </button>
          </div>

          <div
            className={`space-y-2 transition-all duration-500 delay-150 ${mobileMenu
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
              }`}
          >
            <NavLink to="/" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
              <span>Home</span>
            </NavLink>

            <NavLink to="/about" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
              <span>About</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileSubMenu((prev) => (prev === "services" ? null : "services"))}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-base font-medium transition ${isServicesActive
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                  : "border-white/10 bg-white/3 text-white/80 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span>Services</span>
              <FiChevronDown
                className={`text-sm transition ${mobileSubMenu === "services" ? "rotate-180" : ""} ${isServicesActive ? "text-primary" : ""
                  }`}
              />
            </button>

            {mobileSubMenu === "services" && (
              <div className="space-y-1 rounded-xl border border-white/10 bg-white/3 p-2">
                {services.length > 0 ? (
                  services.map((srv) => (
                    <NavLink
                      key={srv.id}
                      to={`/services/${srv.id}`}
                      onClick={() => {
                        setMobileMenu(false);
                        setMobileSubMenu(null);
                      }}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-primary/10 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {srv.title}
                    </NavLink>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-white/40">Loading services...</p>
                )}
              </div>
            )}

            <NavLink to="/projects" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
              <span>Projects</span>
            </NavLink>

            <NavLink to="/prices" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
              <span>Prices</span>
            </NavLink>

            <button
              type="button"
              onClick={() => setMobileSubMenu((prev) => (prev === "whoWeAre" ? null : "whoWeAre"))}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-base font-medium transition ${isWhoWeAreActive
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold"
                  : "border-white/10 bg-white/3 text-white/80 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span>Who We Are?</span>
              <FiChevronDown
                className={`text-sm transition ${mobileSubMenu === "whoWeAre" ? "rotate-180" : ""} ${isWhoWeAreActive ? "text-primary" : ""
                  }`}
              />
            </button>

            {mobileSubMenu === "whoWeAre" && (
              <div className="space-y-1 rounded-xl border border-white/10 bg-white/3 p-2">
                {whoWeAreLinks.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => {
                      setMobileMenu(false);
                      setMobileSubMenu(null);
                    }}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-primary/10 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            )}

            <NavLink to="/career" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
              <span>Career</span>
            </NavLink>
          </div>

          <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
            <Link
              to="/contact"
              onClick={() => setMobileMenu(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-strong px-4 py-3 text-sm font-semibold text-white"
            >
              Let&apos;s Talk
              <FiArrowRight />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open profile menu"
                  aria-expanded={openMenu === "profile"}
                  onClick={() => toggleMenu("profile")}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 px-4 py-3 text-sm font-semibold text-[#FF6A00] transition-all duration-300 hover:bg-[#FF6A00] hover:text-black"
                >
                  <FiUser className="text-lg" />
                  Profile
                </button>
                <div className={`mt-2 space-y-1 rounded-xl border border-white/10 bg-white/[0.04] p-2 ${openMenu === "profile" ? "block" : "hidden"}`}>
                  {roleHome !== "/" && (
                    <Link
                      to={roleHome}
                      onClick={() => setMobileMenu(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#FF6A00]/10 hover:text-[#FF6A00]"
                    >
                      {roleLabel}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenu(false);
                      setOpenMenu(null);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-red-500/10"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenu(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 px-4 py-3 text-sm font-semibold text-[#FF6A00] transition-all duration-300 hover:bg-[#FF6A00] hover:text-black"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-center text-red-500">
              <FiLogOut className="h-12 w-12" />
            </div>
            <h3 className="mb-2 text-center text-xl font-bold text-gray-900">Confirm Logout</h3>
            <p className="mb-6 text-center text-sm text-gray-500">
              Are you sure you want to log out? You will need to log in again to access your account.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
