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
      border-[#FF6A00]/50
      bg-[#151d22]
      shadow-[0_14px_34px_rgba(0,0,0,0.45),0_0_24px_rgba(255,106,0,0.14)]
      transition-all
      duration-500
      ease-[cubic-bezier(0.22,1,0.36,1)]
      hover:-translate-y-1.5
      hover:border-[#FF6A00]/70
      hover:shadow-[0_18px_40px_rgba(0,0,0,0.5),0_0_28px_rgba(255,106,0,0.18)]
    "
    >

      {/* ================= TOP ORANGE ACCENT ================= */}

      <div
        className="
        absolute
        left-0
        right-0
        top-0
        z-20
        h-[2px]
        bg-[#FF6A00]
      "
      />

      {/* ================= HOVER LIGHT SWEEP ================= */}

      <div
        className="
        pointer-events-none
        absolute
        inset-y-0
        -left-1/2
        z-20
        w-1/3
        -skew-x-12
        bg-gradient-to-r
        from-transparent
        via-white/[0.07]
        to-transparent
        transition-transform
        duration-700
        ease-out
        group-hover:translate-x-[430%]
      "
      />

      {/* ================= IMAGE ================= */}

      <div
        className="
        relative
        mx-2
        h-[175px]
        w-[calc(100%-1rem)]
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

        {/* Image Gradient */}
        <div
          className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-[#0b1014]/35
          via-transparent
          to-transparent
        "
        />

        {/* ================= CATEGORY BADGE ================= */}

        <span
          className="
          absolute
          left-3
          top-3
          z-10
          rounded-lg
          border
          border-[#FF6A00]
          bg-[#FF6A00]
          px-3.5
          py-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-white
          shadow-[0_0_16px_rgba(255,106,0,0.25)]
        "
        >
          {project.category || "Project"}
        </span>

      </div>

      {/* ================= CONTENT ================= */}

      <div
        className="
        flex
        min-h-[238px]
        flex-1
        flex-col
        px-5
        pb-5
        pt-3
        sm:px-5
        sm:pb-5
      "
      >

        {/* ================= TITLE ================= */}

        <h3
          className="
          line-clamp-2
          min-h-[37px]
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

        {/* ================= ORANGE ACCENT ================= */}

        <div
          className="
          h-[2px]
          w-10
          bg-[#FF6A00]
          shadow-[0_0_8px_rgba(255,106,0,0.4)]
          transition-all
          duration-300
          group-hover:w-14
        "
        />

        {/* ================= DESCRIPTION ================= */}

        <p
          className="
          mt-2.5
          line-clamp-2
          min-h-[40px]
          text-xs
          leading-5
          text-white/65
          sm:text-sm
          sm:leading-5
        "
        >
          {project.description ||
            "Scalable digital solution engineered for modern business performance."}
        </p>

        {/* ================= TECH FEATURES ================= */}

        {project.features && project.features.length > 0 && (
          <div
            className="
            mt-4
            flex
            flex-wrap
            gap-1.5
            sm:gap-2
          "
          >
            {project.features.slice(0, 4).map((feature, index) => (
              <span
                key={index}
                className="
                rounded-md
                border
                border-[#FF6A00]/30
                bg-[#FF6A00]/10
                px-2.5
                py-1
                text-[10px]
                font-medium
                text-white/75
                backdrop-blur-sm
                transition-all
                duration-200
                group-hover:border-[#FF6A00]/50
                group-hover:bg-[#FF6A00]/15
                group-hover:text-white
              "
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* ================= FOOTER ACTIONS ================= */}

        <div
          className="
          mt-auto
          flex
          items-center
          justify-between
          border-t
          border-[#FF6A00]/20
          pt-4
        "
        >

          {/* View Project */}

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
            <span
              className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-white/40
            "
            >
              Internal Enterprise Project
            </span>
          )}

          {/* Quick View */}

          {onSelect && (
            <button
              onClick={() => onSelect(project)}
              aria-label={`Quick view ${project.title}`}
              title="Quick View"
              className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-[#FF6A00]
              bg-[#FF6A00]
              text-white
              hover:border-[#FF6A00]/50
              hover:bg-[#FF6A00]/10
              font-bold
              uppercase
              tracking-wider
              cursor-pointer
              transition-all
              duration-300
              hover:-translate-y-0.5
              
              hover:shadow-[0_0_16px_rgba(255,106,0,0.3)]
            "
            >
              <FiEye size={12} />
            </button>
          )}

        </div>
      </div>

      {/* ================= BOTTOM ORANGE GLOW ================= */}

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
        bg-[#FF6A00]/15
        opacity-60
        blur-[40px]
        transition-all
        duration-500
        group-hover:bg-[#FF6A00]/25
        group-hover:opacity-100
      "
      />

    </div>
  );
};

export default ProjectCard;
