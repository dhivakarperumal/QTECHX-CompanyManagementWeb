import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ChatBot from "./ChatBot";
import "./FloatingSupport.css";

const FloatingSupport = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const currentRoute = hash?.startsWith("#") ? hash.slice(1) : pathname;

  const isAuthPage = currentRoute === "/login" || currentRoute === "/register";
  const isAdmin = currentRoute === "/admin" || currentRoute.startsWith("/admin/");
  const isEmployee =
    currentRoute === "/employee" ||
    currentRoute.startsWith("/employee/") ||
    currentRoute === "/trainee" ||
    currentRoute.startsWith("/trainee/");
  const isPublicPage = !isAuthPage && !isAdmin && !isEmployee;

  // 1. WhatsApp and Call are visible on all public pages (Home, About, Services, Contact, etc.) for both guests & users
  //    and strictly hidden on admin, employee, and auth pages.
  const showWhatsAppAndCall = isPublicPage;

  // 2. AI ChatBot is ONLY visible on /admin panel routes, and NOT on public pages (even for admin) or employee panel.
  const showChatBot = isAdmin;

  // If neither should show on this route, render nothing
  if (!showWhatsAppAndCall && !showChatBot) {
    return null;
  }

  const whatsappNumber = "919597293504"; // Company WhatsApp number (+91 95972 93504)
  const phoneNumber = "+919597293504";   // Company Call line (+91 95972 93504)

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Q-Techx Solutions, I need some help!")}`,
      "_blank"
    );
  };

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <>
      {/* Chatbot panel – only appears for admin panel */}
      {showChatBot && <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />}

      {/* Floating button container – always fixed to bottom‑right */}
      <div className="floating-support-container">
        {/* WhatsApp button - visible on public pages (guests & users) */}
        {showWhatsAppAndCall && (
          <div
            className="support-item whatsapp"
            onClick={handleWhatsApp}
            title="WhatsApp (+91 95972 93504)"
          >
            <FaWhatsapp size={26} />
            <span className="tooltip">🟢 WhatsApp (+91 95972 93504)</span>
          </div>
        )}

        {/* Call button - visible on public pages (guests & users) */}
        {showWhatsAppAndCall && (
          <div
            className="support-item call"
            onClick={handleCall}
            title="Call Us (+91 95972 93504)"
          >
            <Phone size={22} />
            <span className="tooltip">📞 Call (+91 95972 93504)</span>
          </div>
        )}

        {/* Chat toggle button - ONLY visible in /admin panels */}
        {showChatBot && (
          <div
            className={`support-item chatbot ${chatOpen ? "chatbot-active" : ""}`}
            onClick={() => setChatOpen((prev) => !prev)}
            title="AI Chat Assistant"
          >
            {chatOpen ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="9" y1="14" x2="13" y2="14" />
              </svg>
            )}
            <span className="tooltip">{chatOpen ? "Close Chat" : "AI Assistant"}</span>
            {!chatOpen && <span className="chat-ping" />}
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingSupport;
