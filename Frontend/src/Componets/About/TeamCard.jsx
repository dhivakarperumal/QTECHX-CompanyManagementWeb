import React from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaEnvelope } from "react-icons/fa";

const TeamCard = ({ member }) => {
  return (
    // <div className="group relative flex h-[350px] cursor-pointer group-hover:text-white w-[260px] flex-col justify-center overflow-hidden rounded-[10px] bg-white shadow-[0_14px_26px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]">
      <div className="group relative flex h-[350px] cursor-pointer group-hover:text-white w-[260px] flex-col justify-center overflow-hidden rounded-[10px] bg-white 
    shadow-[0_14px_26px_rgba(0,0,0,0.04)] 
    transition-all duration-300 ease-out 
    hover:-translate-y-1 hover:scale-[1.02] 
    hover:shadow-[0_14px_26px_rgba(248,116,14,0.7)]">
      {/* Image with dark overlay + social icons */}
      <div className="relative w-full h-[270px] overflow-hidden">
        <img
          src={member.image}
          alt={member.name}
          className="h-full w-full object-cover cursor-pointer  transition-transform duration-300 group-hover:scale-100"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/30  cursor-pointer opacity-0 transition-opacity   duration-300 group-hover:opacity-100"></div>

        {/* Social icons */}
        <div className="absolute top-1/3 right-[-60px] flex -translate-y-1/2 flex-col space-y-4 opacity-0 transition-all duration-300 group-hover:right-4 group-hover:opacity-100">
          <a href={member.instagram_link} target="_blank" rel="noreferrer">
            <FaInstagram className="h-6 w-6 text-white hover:text-primary" />
          </a>
          
          <a href={member.linkedin_link} target="_blank" rel="noreferrer">
            <FaLinkedin className="h-6 w-6 text-white hover:text-primary" />
          </a>
          <a href={`mailto:${member.mail_id}`} target="_blank" rel="noreferrer">
            <FaEnvelope className="h-6 w-6 text-white hover:text-primary" />
          </a>
        </div>
      </div>

      {/* Name + Position section */}
     <div className="flex flex-col items-center justify-center p-6 text-center text-gray-900 transition-colors duration-600  ">
  <p className="text-lg font-medium">{member.name}</p>
  <span className="text-sm">{member.position}</span>
</div>
    </div>
  );
};

export default TeamCard;