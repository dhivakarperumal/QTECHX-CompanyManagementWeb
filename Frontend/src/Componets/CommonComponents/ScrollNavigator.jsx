// src/components/ScrollNavigator.jsx
import React, { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

const ScrollNavigator = () => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowButtons(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  return (
    showButtons && (
      <div className="fixed right-5.5 bottom-20 z-30 flex flex-col gap-3 sm:right-6.5 sm:bottom-24">
        <button
          onClick={scrollToTop}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#FF6A00] text-white shadow-[0_8px_22px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#e85d00] hover:shadow-[0_10px_26px_rgba(255,106,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/50"
          aria-label="Scroll to top"
        >
          <FiArrowUp size={24} strokeWidth={3} />
        </button>
      </div>
    )
  );
};

export default ScrollNavigator;