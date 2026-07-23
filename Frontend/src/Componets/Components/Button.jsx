import React from "react";



const Button = ({ children, className = "" }) => {
  return (
    <button
      className={`
        relative group
        px-2.5 md:px-4 py-1.5 md:py-2
        text-[14px] md:text-[17px]  font-medium
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
      <span className="relative z-10 mx-2 flex items-center gap-2 transition-colors duration-700 group-hover:text-white">
        {children} 
      </span>

      {/* This span replaces ::before */}
      <span
        className="
          absolute
          w-[20em] h-[20em]
          -left-25
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

export default Button;