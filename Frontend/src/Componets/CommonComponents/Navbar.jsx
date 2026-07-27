import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import Button from "../Components/Button";
import { useAuth } from "../../PrivateRouter/AuthContext";
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

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  const services = [
    { id: 1, title: "Web Development", path: "/services/1", icon: "FaLaptopCode" },
    { id: 5, title: "Mobile App Development", path: "/services/5", icon: "FaMobileAlt" },
    { id: 3, title: "UI/UX Design", path: "/services/3", icon: "FaPaintBrush" },
    { id: 10, title: "Digital Marketing", path: "/services/10", icon: "FaBullhorn" },
  ];

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

  return (
    <nav className="fixed left-0 top-0 z-50 flex h-18 w-full items-center justify-between bg-white px-6 py-2 shadow-md md:px-15">
      <Link to="/" className="flex items-center gap-0.5">
        <img src="/images/logo.png" alt="logo" className="h-12 w-auto" />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-gray-900 md:text-lg">Q-Techx</span>
          <span className="text-center text-xs text-gray-800 md:text-sm">Solutions</span>
        </div>
      </Link>

      <ul className="hidden items-center justify-center gap-8 font-medium md:flex" ref={dropdownRef}>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-primary font-medium" : "text-gray-900 hover:text-primary"
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-primary font-medium" : "text-gray-900 hover:text-primary"
            }
          >
            About
          </NavLink>
        </li>

        <li className="relative">
          <div
            onClick={() => toggleMenu("services")}
            className="flex cursor-pointer items-center gap-1"
          >
            Services <FiChevronDown />
          </div>
          {openMenu === "services" && (
            <div className="absolute left-[-2.5rem] top-full mt-2 grid w-[24rem] grid-cols-2 gap-2 rounded-md bg-white p-4 shadow-lg z-50">
              {services.map((srv) => {
                const Icon = iconMap[srv.icon] || FaCode;
                return (
                  <NavLink
                    key={srv.id}
                    to={srv.path}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary"
                        : "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                    }
                  >
                    <Icon className="text-xl text-primary" />
                    {srv.title}
                  </NavLink>
                );
              })}
            </div>
          )}
        </li>

        <li>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive ? "text-primary font-medium" : "text-gray-900 hover:text-primary"
            }
          >
            Projects
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/prices"
            className={({ isActive }) =>
              isActive ? "text-primary font-medium" : "text-gray-900 hover:text-primary"
            }
          >
            Prices
          </NavLink>
        </li>

        <li className="relative">
          <div
            onClick={() => toggleMenu("whoWeAre")}
            className="flex cursor-pointer items-center gap-1"
          >
            Who We Are? <FiChevronDown />
          </div>
          {openMenu === "whoWeAre" && (
            <div className="absolute top-full mt-2 w-60 rounded-md bg-white p-2 shadow-lg z-50">
              {whoWeAreLinks.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "block rounded-md px-3 py-2 text-sm font-medium text-primary"
                      : "block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                  }
                >
                  {item.title}
                </NavLink>
              ))}
            </div>
          )}
        </li>

        <li>
          <NavLink
            to="/career"
            className={({ isActive }) =>
              isActive ? "text-primary font-medium" : "text-gray-900 hover:text-primary"
            }
          >
            Career
          </NavLink>
        </li>
      </ul>

      <div className="hidden items-center gap-4 md:flex">
        <Link to="/contact">
          <Button>Contact</Button>
        </Link>
        {user && (
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 rounded-md border border-red-500 px-4 py-2 font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut /> Logout
          </button>
        )}
      </div>

      <button className="text-2xl md:hidden" onClick={() => setMobileMenu(true)}>
        <FiMenu />
      </button>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1 bg-black/40" onClick={() => setMobileMenu(false)}></div>

          <div className="h-full w-full overflow-y-auto bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setMobileMenu(false)}>
                <FiX className="text-2xl" />
              </button>
            </div>

            <NavLink
              to="/"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                isActive ? "block py-2 font-medium text-primary" : "block py-2 text-gray-900 hover:text-primary"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                isActive ? "block py-2 font-medium text-primary" : "block py-2 text-gray-900 hover:text-primary"
              }
            >
              About
            </NavLink>

            <button onClick={() => setMobileSubMenu("services")} className="block w-full py-2 text-left">
              Services →
            </button>

            <NavLink
              to="/projects"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                isActive ? "block py-2 font-medium text-primary" : "block py-2 text-gray-900 hover:text-primary"
              }
            >
              Projects
            </NavLink>

            <NavLink
              to="/prices"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                isActive ? "block py-2 font-medium text-primary" : "block py-2 text-gray-900 hover:text-primary"
              }
            >
              Prices
            </NavLink>

            <button onClick={() => setMobileSubMenu("whoWeAre")} className="block w-full py-2 text-left">
              Who We Are →
            </button>

            <NavLink
              to="/career"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                isActive ? "block py-2 font-medium text-primary" : "block py-2 text-gray-900 hover:text-primary"
              }
            >
              Career
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                isActive
                  ? "mt-4 block rounded-full border border-primary py-2 text-center font-medium text-primary"
                  : "mt-4 block rounded-full border border-primary py-2 text-center text-gray-900 hover:text-primary"
              }
            >
              Contact
            </NavLink>

            {user && (
              <button
                onClick={() => {
                  setMobileMenu(false);
                  setShowLogoutConfirm(true);
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-red-500 py-2 font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <FiLogOut /> Logout
              </button>
            )}
          </div>
        </div>
      )}

      {mobileSubMenu && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1 bg-black/40" onClick={() => setMobileSubMenu(null)}></div>
          <div className="h-full w-full overflow-y-auto bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{mobileSubMenu === "services" ? "Services" : "Who We Are"}</h2>
              <button onClick={() => setMobileSubMenu(null)}>
                <FiX className="text-2xl" />
              </button>
            </div>

            {mobileSubMenu === "services" &&
              services.map((srv) => {
                const Icon = iconMap[srv.icon] || FaCode;
                return (
                  <NavLink
                    key={srv.id}
                    to={srv.path}
                    onClick={() => {
                      setMobileMenu(false);
                      setMobileSubMenu(null);
                    }}
                    className={({ isActive }) =>
                      isActive ? "flex items-center gap-2 py-2 font-medium text-primary" : "flex items-center gap-2 py-2 text-gray-900 hover:text-primary"
                    }
                  >
                    <Icon className="text-xl text-primary" />
                    {srv.title}
                  </NavLink>
                );
              })}

            {mobileSubMenu === "whoWeAre" &&
              whoWeAreLinks.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenu(false)}
                  className={({ isActive }) =>
                    isActive ? "block py-2 font-medium text-primary" : "block py-2 text-gray-900 hover:text-primary"
                  }
                >
                  {item.title}
                </NavLink>
              ))}
          </div>
        </div>
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity px-4">
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
                className="flex-1 rounded-xl bg-red-600 py-2.5 font-medium text-white transition-colors hover:bg-red-700 shadow-sm shadow-red-200"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
