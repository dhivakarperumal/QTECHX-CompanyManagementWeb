import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { FiChevronDown, FiMenu, FiX, FiLogOut, FiArrowRight } from "react-icons/fi";
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

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [services, setServices] = useState([]);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
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
    { id: 4, title: "Our Achievements", path: "/achievements" },
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

  const desktopLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-white/80 hover:text-primary"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium transition ${isActive ? "bg-primary/10 text-primary" : "text-white/80 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-orange-500/20 bg-[#070b12]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <PageContainer>
        <div className="mx-auto flex h-[72px] w-full max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Q-Techx logo" className="h-10 w-auto sm:h-12" />
            <div className="leading-none">
              <div className="text-[18px] font-black tracking-tight text-white sm:text-[20px]">Q-TECHX</div>
              <div className="mt-0.5 text-[8px] font-semibold tracking-[0.32em] text-orange-300/90 sm:text-[9px]">SOLUTIONS</div>
            </div>
          </Link>

          <ul className="hidden items-center gap-8 md:flex" ref={dropdownRef}>
            <li><NavLink to="/" className={desktopLinkClass}>Home</NavLink></li>
            <li><NavLink to="/about" className={desktopLinkClass}>About</NavLink></li>

            <li className="relative">
              <button
                type="button"
                onClick={() => toggleMenu("services")}
                className="flex items-center gap-1 text-sm font-medium text-white/80 transition hover:text-primary"
              >
                Services
                <FiChevronDown className={`text-xs transition ${openMenu === "services" ? "rotate-180" : ""}`} />
              </button>

              {openMenu === "services" && (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-[26rem] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d1320] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                  <div className="grid grid-cols-2 gap-2">
                    {services.length > 0 ? (
                      services.map((srv) => {
                        const Icon = iconMap[srv.icon] || FaCode;
                        return (
                          <NavLink
                            key={srv.id}
                            to={`/services/${srv.id}`}
                            className={({ isActive }) =>
                              `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${isActive
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-transparent bg-white/3 text-white/80 hover:border-primary/20 hover:bg-white/5 hover:text-white"
                              }`
                            }
                          >
                            <Icon className="text-base text-primary" />
                            <span className="truncate">{srv.title}</span>
                          </NavLink>
                        );
                      })
                    ) : (
                      <p className="col-span-2 py-3 text-sm text-white/50">Loading services...</p>
                    )}
                  </div>
                </div>
              )}
            </li>

            <li><NavLink to="/projects" className={desktopLinkClass}>Projects</NavLink></li>
            <li><NavLink to="/prices" className={desktopLinkClass}>Prices</NavLink></li>

            <li className="relative">
              <button
                type="button"
                onClick={() => toggleMenu("whoWeAre")}
                className="flex items-center gap-1 text-sm font-medium text-white/80 transition hover:text-primary"
              >
                Who We Are?
                <FiChevronDown className={`text-xs transition ${openMenu === "whoWeAre" ? "rotate-180" : ""}`} />
              </button>

              {openMenu === "whoWeAre" && (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d1320] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                  {whoWeAreLinks.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={({ isActive }) =>
                        `block rounded-xl px-3 py-2.5 text-sm transition ${isActive ? "bg-primary/10 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              )}
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

            {user && (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 rounded-full border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/20"
              >
                <FiLogOut /> Logout
              </button>
            )}
          </div>

          <button
            type="button"
            aria-label="Open navigation menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/3 text-xl text-white md:hidden"
            onClick={() => setMobileMenu(true)}
          >
            <FiMenu />
          </button>
        </div>
      </PageContainer>

      {mobileMenu && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />

          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-l border-white/10 bg-[#090d14] p-4 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="Q-Techx logo" className="h-8 w-auto" />
                <div className="leading-none">
                  <div className="text-base font-black tracking-tight text-white">Q-TECHX</div>
                  <div className="mt-1 text-[7px] font-semibold tracking-[0.28em] text-orange-300">SOLUTIONS</div>
                </div>
              </div>

              <button type="button" onClick={() => setMobileMenu(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-white">
                <FiX />
              </button>
            </div>

            <div className="space-y-2">
              <NavLink to="/" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
                <span>Home</span>
              </NavLink>

              <NavLink to="/about" onClick={() => setMobileMenu(false)} className={mobileLinkClass}>
                <span>About</span>
              </NavLink>

              <button
                type="button"
                onClick={() => setMobileSubMenu((prev) => (prev === "services" ? null : "services"))}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-3 text-left text-base font-medium text-white/80"
              >
                <span>Services</span>
                <FiChevronDown className={`text-sm transition ${mobileSubMenu === "services" ? "rotate-180" : ""}`} />
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
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/3 px-3 py-3 text-left text-base font-medium text-white/80"
              >
                <span>Who We Are?</span>
                <FiChevronDown className={`text-sm transition ${mobileSubMenu === "whoWeAre" ? "rotate-180" : ""}`} />
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

              {user && (
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
                >
                  <FiLogOut /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </nav>
  );
};

export default Navbar;
