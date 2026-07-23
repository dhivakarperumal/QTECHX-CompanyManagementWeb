// src/components/SidebarMenu.jsx
import React from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const SidebarMenu = ({ title, items, isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <Link
              key={idx}
              to={item.link}
              className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
              onClick={onClose}
            >
              {item.title}
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No items found</p>
        )}
      </div>
    </div>
  );
};

export default SidebarMenu;
