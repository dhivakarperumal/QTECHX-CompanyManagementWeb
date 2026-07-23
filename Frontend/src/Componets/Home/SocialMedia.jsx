
import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaGoogle,
  FaLinkedinIn,
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa";

function SocialMedia() {
  const socialLinks = [
    { icon: <FaFacebookF />, url: "https://www.facebook.com/share/1A1X9dVCTm/" },
    { icon: <FaTwitter />, url: "https://x.com/QTechxTpt?t=fmfCt7ZX-5RoQIbHJ-4s_A&s=09" },
    { icon: <FaGoogle />, url: "mailto:info@qtechx.com" },
    { icon: <FaLinkedinIn />, url:"https://www.linkedin.com/in/q-techx-solutions-724346366/" },
     { icon: <FaWhatsapp className="font-extrabold text-xl" />, url: "https://wa.me/919123589879?text=Hello%20Q-Techx%20Solutions%2C%20I%20am%20interested%20in%20your%20services.%20Please%20share%20more%20details." 
   }, // ✅ WhatsApp link
    { icon: <FaInstagram className="font-extrabold text-xl" />, url: "https://www.instagram.com/qtech.x?igsh=MXNsODg2YjA5N21wbA==" },
  ];

  return (
    <div className="bg-primary/10 py-10 md:py-4 px-6 md:px-17 flex flex-col md:flex-row justify-between items-center">
      {/* Company Logo */}
      <div className="flex items-center gap-0.5 mb-6">
        <img
          src="/images/logo.png"
          alt="Q-TechX Solutions"
          className="w-14"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-gray-900">Q-Techx</span>
          <span className="text-sm text-center text-gray-600">Solutions</span>
        </div>
      </div>

      {/* Social Icons Section */}
      <div className="flex gap-3">
        {socialLinks.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded-full shadow-md cursor-pointer 
                       hover:bg-primary hover:text-white transition transform hover:scale-110"
          >
            {item.icon}
          </a>
        ))}
      </div>
    </div>
  );
}

export default SocialMedia;
