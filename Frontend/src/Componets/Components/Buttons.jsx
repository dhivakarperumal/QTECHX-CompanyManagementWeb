import React from "react";

const Buttons = ({ children, className = "" }) => {
  return (
    <button
      className={`
        relative group
        w-full sm:w-auto   /* full width on mobile, auto on bigger screens */
        px-4 md:px-12 py-3 md:py-2
        text-[14px] md:text-[17px] font-medium
        border border-primary
        rounded-full
        text-primary
        overflow-hidden
        cursor-pointer
        transition-colors duration-700 ease-out
        ${className}
      `}
    >
      {/* Text */}
      <span className="relative z-10 mx-2 flex items-center justify-center gap-2 transition-colors duration-700 group-hover:text-white">
        {children}
      </span>

      {/* Animated Background */}
      <span
        className="
          absolute
          w-[20em] h-[20em]
          -left-10
          top-1/2 -translate-y-1/2
          rounded-full
          transition-[box-shadow] duration-700 ease-out
          z-0
          group-hover:shadow-[inset_0_0_0_10em_#F8740E]
        "
      ></span>
    </button>
  );
};

export default Buttons;
