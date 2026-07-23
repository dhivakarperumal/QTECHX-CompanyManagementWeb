import React from "react";
import { Phone } from "lucide-react";
import { useLocation } from "react-router-dom";
import "./FloatingSupport.css";

const FloatingSupport = () => {
  const location = useLocation();
  const whatsappNumber = "919876543210";
  const phoneNumber = "+919876543210";

  // Hide on login page
  if (location.pathname === "/login") return null;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Hello, I need some help!`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <div className="floating-support-container">

      {/* WhatsApp */}
      <div className="support-item whatsapp" onClick={handleWhatsApp} title="WhatsApp">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.492.658 4.833 1.806 6.857L2 30l7.338-1.788A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.45 11.45 0 0 1-5.835-1.597l-.418-.248-4.354 1.06 1.094-4.23-.272-.434A11.5 11.5 0 1 1 16 27.5zm6.29-8.61c-.345-.172-2.04-1.006-2.356-1.12-.316-.115-.546-.172-.776.172-.23.345-.892 1.12-1.093 1.35-.2.23-.4.26-.746.086-.345-.172-1.457-.537-2.775-1.713-1.025-.916-1.717-2.047-1.918-2.392-.2-.345-.022-.531.15-.703.155-.155.345-.402.518-.603.172-.2.23-.345.345-.575.115-.23.057-.431-.029-.603-.086-.172-.776-1.87-1.063-2.56-.28-.673-.565-.582-.776-.593l-.66-.012c-.23 0-.603.086-.919.431-.316.345-1.207 1.18-1.207 2.876s1.236 3.337 1.408 3.567c.172.23 2.432 3.712 5.892 5.207.823.355 1.466.567 1.967.726.827.263 1.58.226 2.174.137.663-.099 2.04-.834 2.328-1.638.287-.804.287-1.492.2-1.638-.086-.143-.316-.23-.66-.402z"/>
        </svg>
        <span className="tooltip">🟢 WhatsApp</span>
      </div>

      {/* Call */}
      <div className="support-item call" onClick={handleCall} title="Call Us">
        <Phone size={22} />
        <span className="tooltip">📞 Call Us</span>
      </div>

    </div>
  );
};

export default FloatingSupport;
