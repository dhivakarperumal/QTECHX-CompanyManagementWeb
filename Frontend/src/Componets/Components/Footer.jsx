import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import  Buttons from './Buttons'

const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 md:px-18 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        
       {/* Left Section - Company Info */}
<div className="flex flex-col items-start ">
{/* Company Logo */}
  <div className="flex items-center gap-0.5 mb-6">
  <img
    src="/images/logo.png" 
    alt="Q-TechX Solutions"
    className="w-14"
  />
  <div className="flex flex-col leading-tight">
    <span className="text-base md:text-lg font-bold text-gray-900">Q-Techx</span>
    <span className="text-xs md:text-sm text-center text-gray-600">Solutions</span>
  </div>
</div>
  {/* Address & Contact */}
  <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
    <p className="flex items-start gap-2">
      <FaMapMarkerAlt className="text-primary mt-1 shrink-0" />
      <span>Tirupattur, Tamil Nadu, India, 635 653.</span>
    </p>
    <p className="flex items-center gap-2">
      <FaPhoneAlt className="text-primary shrink-0" /> 
      <span>+91 91235 89879</span>
    </p>
    <p className="flex items-center gap-2">
      <FaEnvelope className="text-primary shrink-0" /> 
      <span>info@qtechx.com</span>
    </p>
  </div>
</div>


       
{/* Quick Links */}
<div>
  <h2 className="text-lg font-bold mb-5 text-gray-900">Quick Links</h2>
  <ul className="space-y-3 text-gray-700 text-sm">
    {[
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Services", path: "/services" },
      { name: "Products", path: "/products" },
      { name: "Career", path: "/career" },
      { name: "Contact", path: "/contact" },
    ].map((link, idx) => (
      <li key={idx}>
        <Link
          to={link.path}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <MdOutlineArrowForwardIos  className="text-primary text-xs"/>
          {link.name}
        </Link>
      </li>
    ))}
  </ul>
</div>
       {/* Features */}
<div>
  <h2 className="text-lg font-bold mb-5 text-gray-900">Our Features</h2>
  <ul className="space-y-3 text-gray-700 text-sm">
    {[
      { name: "Why Choose Us", path: "/why-choose-us" },
      { name: "Who We Work", path: "/who-we-work" },
      { name: "What We Do", path: "/what-we-do" },
      { name: "Our Achievements", path: "/achievements" },
      { name: "Terms Of Services", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy-policy" },
    ].map((item, idx) => (
      <li
        key={idx}
        className="flex items-center  gap-2 justify-between hover:text-primary cursor-pointer transition-colors"
      >
        <MdOutlineArrowForwardIos className="ml-2 text-primary  group-hover:text-primary transition" />

        <Link to={item.path} className="flex-1">
          {item.name}
        </Link>
      </li>
    ))}
  </ul>
</div>

        {/* Newsletter */}
        <div>
          <h2 className="text-lg font-bold mb-5 text-gray-900">Get Newsletter</h2>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Subscribe to get promotional updates & latest business news.
          </p>
          <div className="flex items-center justify-center bg-white shadow-md rounded-full overflow-hidden mb-4">
            <input
              type="email"
              placeholder="example@gmail.com"
              className="flex-1 px-4 py-3 text-center text-sm outline-none"
            />
            <button className="bg-primary text-white px-5 py-4 cursor-pointer transition">
              <FaEnvelope />
            </button>
          </div>
          <Buttons>
            Subscribe Now 
          </Buttons>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-purple-200 text-center py-5 text-sm text-gray-600">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-primary">Q-Techx Solutions</span> — All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;