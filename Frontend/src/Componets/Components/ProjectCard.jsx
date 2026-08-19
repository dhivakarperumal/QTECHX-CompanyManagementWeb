// src/components/ProjectCard.jsx
import React, { useState } from "react";
import { FiExternalLink, FiArrowRight, FiEye } from "react-icons/fi";

const ProjectCard = ({ project, aosDelay = 0, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageSrc = imageError || !project.image ? "/Project/p1.jpg" : project.image;

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={aosDelay}
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-white/[0.12]
        bg-gradient-to-b from-[#182127] to-[#0e151a]
        shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_16px_rgba(255,106,0,0.05)]
        transition-all
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-1.5
        hover:border-[#FF6A00]/50
        hover:bg-[#151d22]
        hover:shadow-[0_14px_34px_rgba(0,0,0,0.45),0_0_24px_rgba(255,106,0,0.14)]
      "
    >
      {/* Top Laser Accent Line */}
      <div
        className="
          absolute
          left-0
          right-0
          top-0
          z-20
          h-[2px]
          origin-left
          scale-x-0
          bg-[#FF6A00]
          transition-transform
          duration-500
          group-hover:scale-x-100
        "
      />

      {/* Hover light sweep */}
      <div className="pointer-events-none absolute inset-y-0 -left-1/2 z-20 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[430%]" />

      {/* Image Wrapper */}
      <div
        className="
          relative
          mx-2
          h-[175px]
          w-full
          overflow-hidden
          rounded-2xl
          bg-[#080d11]
          sm:h-[185px]
        "
      >
        <img
          src={imageSrc}
          alt={project.title}
          onError={handleImageError}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-105
          "
        />

        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1014]/35 via-transparent to-transparent" />

        {/* Category Badge */}
        <span
          className="
            absolute
            left-3
            top-3
            z-10
            rounded-full
            border
            border-[#FF6A00]/50
            bg-[#03070a]/85
            px-3
            py-1
            text-[10px]
            font-semibold
            uppercase
            tracking-wider
            text-[#FF6A00]
            backdrop-blur-md
            shadow-[0_0_12px_rgba(255,106,0,0.2)]
          "
        >
          {project.category || "Project"}
        </span>

        <div className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-[#03070a]/70 text-white/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:border-[#FF6A00]/60 group-hover:text-[#FF6A00] group-hover:opacity-100">
          <FiArrowRight size={14} />
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="flex min-h-[238px] flex-1 flex-col px-5 pb-5 pt-2 sm:px-5 sm:pb-5">
        {/* Title */}
        <h3
          className="
            line-clamp-2
            min-h-[48px]
            text-lg
            font-bold
            tracking-tight
            text-white
            transition-colors
            duration-300
            group-hover:text-[#FF6A00]
            sm:text-xl
          "
        >
          {project.title}
        </h3>

        {/* Orange Accent Bar */}
        <div
          className="
            mt-2.5
            h-[2px]
            w-8
            bg-[#FF6A00]
            shadow-[0_0_8px_rgba(255,106,0,0.4)]
            transition-all
            duration-300
            group-hover:w-14
          "
        />

        {/* Description */}
        <p
          className="
            mt-2.5
            line-clamp-2
            text-xs
            leading-relaxed
            text-white/65
            sm:text-sm
            sm:leading-5
          "
        >
          {project.description || "Scalable digital solution engineered for modern business performance."}
        </p>

        {/* Dynamic Tech Features */}
        {project.features && project.features.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            {project.features.slice(0, 4).map((feature, index) => (
              <span
                key={index}
                className="
                  rounded-md
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-2.5
                  py-1
                  text-[10px]
                  font-medium
                  text-white/60
                  backdrop-blur-sm
                  transition-colors
                  duration-200
                  group-hover:border-[#FF6A00]/30
                  group-hover:text-white/80
                "
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
          <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-4">
          {project.link && project.link !== "#" ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group/btn
                inline-flex
                items-center
                gap-2.5
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-[#FF6A00]
                transition-all
                duration-300
                hover:text-white
              "
            >
              <span>View Project</span>
              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#FF6A00]/40
                  bg-[#FF6A00]/10
                  text-[#FF6A00]
                  transition-all
                  duration-300
                  group-hover/btn:translate-x-1
                  group-hover/btn:border-[#FF6A00]
                  group-hover/btn:bg-[#FF6A00]
                  group-hover/btn:text-white
                  group-hover/btn:shadow-[0_0_12px_rgba(255,106,0,0.5)]
                "
              >
                <FiExternalLink size={12} />
              </span>
            </a>
          ) : (
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Internal Enterprise Project
            </span>
          )}

          {onSelect && (
            <button
              onClick={() => onSelect(project)}
              aria-label={`Quick view ${project.title}`}
              title="Quick View"
              className="
                flex h-8 w-8 items-center justify-center rounded-full border border-[#FF6A00]/35 bg-[#FF6A00]/10
                font-bold
                uppercase
                tracking-wider
                text-[#FFB066]
                transition-all
                duration-300
                hover:-translate-y-0.5 hover:border-[#FF6A00] hover:bg-[#FF6A00] hover:text-white hover:shadow-[0_0_16px_rgba(255,106,0,0.3)]
              "
            >
              <FiEye size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Card Bottom Glow */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-24
          left-1/2
          h-28
          w-28
          -translate-x-1/2
          rounded-full
          bg-[#FF6A00]/10
          opacity-30
          blur-[40px]
          transition-all
          duration-500
          group-hover:bg-[#FF6A00]/20
          group-hover:opacity-100
        "
      />
    </div>
  );
};

export default ProjectCard;
