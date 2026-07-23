import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import Button from "../Components/Button";
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
  const dropdownRef = useRef(null);
  const location = useLocation();

  const services = [
    { id: 1, title: "Web Development", path: "/services/web-development", icon: "FaLaptopCode" },
    { id: 2, title: "Mobile App Development", path: "/services/mobile-app-development", icon: "FaMobileAlt" },
    { id: 3, title: "UI/UX Design", path: "/services/ui-ux-design", icon: "FaPaintBrush" },
    { id: 4, title: "Digital Marketing", path: "/services/digital-marketing", icon: "FaBullhorn" },
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

      <Link to="/contact" className="hidden md:block">
        <Button>Contact</Button>
      </Link>

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
    </nav>
  );
};

export default Navbar;
