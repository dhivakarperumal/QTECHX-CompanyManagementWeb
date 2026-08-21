// Projects.jsx

import React, { useEffect, useState } from "react";
import SliderLib from "react-slick";
import {
  FiArrowRight,
  FiArrowLeft,
  FiExternalLink,
} from "react-icons/fi";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import api from "../../api";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

const Slider = SliderLib.default ? SliderLib.default : SliderLib;

const BACKEND_BASE_URL = (api?.defaults?.baseURL || "http://localhost:5000/api").replace(/\/api$/, "");

const getImageUrl = (image) => {
  if (!image) {
    return "/Project/p1.jpg";
  }

  // If array, recurse on first item
  if (Array.isArray(image)) {
    return image.length > 0 ? getImageUrl(image[0]) : "/Project/p1.jpg";
  }

  // If JSON string or serialized data
  if (typeof image === "string") {
    const trimmed = image.trim();
    if (!trimmed) {
      return "/Project/p1.jpg";
    }

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return getImageUrl(parsed);
      } catch {
        // Continue to regular string handling
      }
    }

    // Already a complete URL
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }

    const normalized = trimmed.replace(/\\/g, "/");
    if (normalized.startsWith("/uploads/")) {
      return `${BACKEND_BASE_URL}${normalized}`;
    }
    if (normalized.startsWith("uploads/")) {
      return `${BACKEND_BASE_URL}/${normalized}`;
    }
    if (normalized.startsWith("/")) {
      return normalized;
    }

    return `/${normalized}`;
  }

  // If object
  if (typeof image === "object") {
    const imageValue =
      image.file_path ||
      image.filePath ||
      image.url ||
      image.path ||
      image.image ||
      image.src ||
      image.filename ||
      image.file ||
      "";

    return getImageUrl(imageValue);
  }

  return "/Project/p1.jpg";
};

const normalizeUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#" || trimmed === "-" || trimmed === "—") return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const Projects = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [slidesToShow, setSlidesToShow] = useState(2);

  /* =========================================================
     FETCH PROJECTS
  ========================================================== */

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [adminProjectsRes, completedProjectsRes] = await Promise.allSettled([
          api.get("/projects/public/all?limit=500&current_status=Completed"),
          api.get("/completed-projects/public/all?limit=500")
        ]);

        let adminList = [];
        if (adminProjectsRes.status === "fulfilled" && adminProjectsRes.value?.data) {
          const raw = adminProjectsRes.value.data.data;
          if (Array.isArray(raw)) {
            adminList = raw.filter(
              (p) => (p.current_status || p.status || "").toString().toLowerCase() === "completed"
            );
          }
        }

        let completedList = [];
        if (completedProjectsRes.status === "fulfilled" && completedProjectsRes.value?.data) {
          const raw = completedProjectsRes.value.data.data;
          if (Array.isArray(raw)) {
            completedList = raw;
          }
        }

        const seen = new Set();
        const combined = [];
        [...completedList, ...adminList].forEach((p) => {
          const key = p.uuid || p.id || p.project_name;
          if (key && !seen.has(key)) {
            seen.add(key);
            combined.push(p);
          }
        });

        const transformedProjects = combined.map((project) => {
          let projectImages = [];

          if (project.project_images) {
            if (typeof project.project_images === "string") {
              try {
                const parsed = JSON.parse(project.project_images);
                projectImages = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                projectImages = [project.project_images];
              }
            } else if (Array.isArray(project.project_images)) {
              projectImages = project.project_images;
            } else if (typeof project.project_images === "object") {
              projectImages = [project.project_images];
            }
          }

          let features = [];
          if (project.frontend_tech) {
            features = project.frontend_tech
              .split(",")
              .map((tech) => tech.trim())
              .filter(Boolean);
          } else if (Array.isArray(project.technologies)) {
            features = project.technologies;
          } else if (typeof project.technologies === "string") {
            try {
              const parsed = JSON.parse(project.technologies);
              features = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              features = project.technologies.split(",").map((t) => t.trim()).filter(Boolean);
            }
          }

          const imageCandidate = projectImages.length > 0
            ? projectImages[0]
            : (project.image || project.file_path || project.project_images);

          return {
            id: project.uuid || project.id,
            title: project.project_name || project.title || "Untitled Project",
            image: getImageUrl(imageCandidate),
            category:
              project.category || project.project_category || "General",
            description:
              project.description || project.project_description || "",
            features,
            link: project.url || project.project_url || project.domain_name || project.sub_domain_name || project.github_link || project.link || "#",
          };
        });

        setItems(transformedProjects);
        setLoading(false);
      } catch (err) {
        setError(
          err.message || "Failed to fetch projects"
        );
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  /* =========================================================
     RESPONSIVE SLIDES
  ========================================================== */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  /* =========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <section className="relative bg-[#03070a] py-16 text-white">
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="text-center">
            <div
              className="
                mx-auto
                mb-4
                h-10
                w-10
                animate-spin
                rounded-full
                border-2
                border-white/10
                border-t-[#FF6A00]
              "
            />

            <p className="text-sm text-white/50">
              Loading projects...
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* =========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <section className="relative bg-[#03070a] py-16 text-white">
        <p className="text-center text-sm text-red-400">
          Error: {error}
        </p>
      </section>
    );
  }

  /* =========================================================
     CATEGORIES
  ========================================================== */

  const categories = [
    "All",
    ...new Set(items.map((project) => project.category)),
  ];

  /* =========================================================
     FILTER
  ========================================================== */

  const filteredProjects =
    activeCategory === "All"
      ? items
      : items.filter(
        (project) =>
          project.category === activeCategory
      );

  /* =========================================================
     NEXT ARROW
  ========================================================== */

  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      aria-label="Next project"
      className="
        absolute
        right-[-14px]
        top-1/2
        z-30
        flex
        h-10
        w-10
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        border
        border-[#FF6A00]/50
        bg-[#FF6A00]
        text-white
        cursor-pointer
        shadow-[0_0_20px_rgba(255,106,0,0.12)]
        transition-all
        duration-300
        hover:border-[#FF6A00]
        hover:bg-[#0b1014]
        hover:text-white
        hover:shadow-[0_0_25px_rgba(255,106,0,0.3)]
      "
    >
      <FiArrowRight size={18} />
    </button>
  );

  /* =========================================================
     PREVIOUS ARROW
  ========================================================== */

  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      aria-label="Previous project"
      className="
        absolute
        left-[-14px]
        top-1/2
        z-30
        flex
        h-10
        w-10
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        border
        border-[#FF6A00]/50
        bg-[#FF6A00]
        text-white
        shadow-[0_0_20px_rgba(255,106,0,0.12)]
        transition-all
        duration-300
        hover:border-[#FF6A00]
        hover:bg-[#0b1014]
        cursor-pointer
        hover:text-white
        hover:shadow-[0_0_25px_rgba(255,106,0,0.3)]
      "
    >
      <FiArrowLeft size={18} />
    </button>
  );

  /* =========================================================
     SLIDER SETTINGS
  ========================================================== */

  const settings = {
    dots: false,
    infinite: filteredProjects.length > slidesToShow,
    speed: 600,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2800,
    pauseOnHover: true,
    arrows: window.innerWidth >= 768,
    // nextArrow: <NextArrow />,
    // prevArrow: <PrevArrow />,
  };

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#03070a]
        text-white
      "
    >
      {/* =====================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-10
          h-80
          w-80
          rounded-full
          bg-[#FF6A00]/10
          blur-[140px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-0
          h-[450px]
          w-[450px]
          rounded-full
          bg-[#FF6A00]/10
          blur-[150px]
        "
      />

      {/* =====================================================
          GRID BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,106,0,0.8) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,106,0,0.8) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* =====================================================
          TOP LINE
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-white/30
        "
      />

      {/* =====================================================
          DECORATIVE DOTS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-7
          top-12
          hidden
          grid-cols-4
          gap-2
          opacity-70
          md:grid
        "
      >
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="
              h-[3px]
              w-[3px]
              rounded-full
              bg-[#FF6A00]
            "
          />
        ))}
      </div>

      {/* =====================================================
          PAGE CONTAINER
      ====================================================== */}

      <PageContainer className="relative z-10">
        <div className="py-9 sm:py-11 lg:py-12">

          {/* =================================================
              HEADING
          ================================================== */}

          <SectionTitle
            subtitle="OUR WORK"
            title="LATEST"
            highlight="PROJECTS"
          />

          {/* =================================================
              MAIN PROJECT AREA
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-7
              lg:grid-cols-[190px_1fr]
              lg:gap-6
            "
          >

            {/* ===============================================
                LEFT FILTER
            ================================================ */}

            <div>
              <div
                className="
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#11171c]
                  via-[#0b1014]
                  to-[#080b0e]
                  p-4
                  shadow-[0_10px_35px_rgba(0,0,0,0.4),0_0_20px_rgba(255,106,0,0.06)]
                "
              >

                <p
                  className="
                    mb-3
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#FF6A00]
                  "
                >
                  EXPLORE
                </p>

                <h3
                  className="
                    mb-4
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  Categories
                </h3>

                <div className="space-y-1.5">
                  {categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        setActiveCategory(category)
                      }
                      className={`
                        group
                        flex
                        w-full
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2
                        text-left
                        text-sm
                        transition-all
                        duration-300
                        ${activeCategory === category
                          ? "bg-[#FF6A00]/10 text-[#FF6A00]"
                          : "text-white/80 hover:bg-white/[0.03] hover:text-white"
                        }
                      `}
                    >
                      <span
                        className={`
                          transition-transform
                          duration-300
                          ${activeCategory === category
                            ? "translate-x-1 text-[#FF6A00]"
                            : "text-white/20 group-hover:text-[#FF6A00]"
                          }
                        `}
                      >
                        →
                      </span>

                      <span>
                        {category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>


            {/* ===============================================
                PROJECT SLIDER
            ================================================ */}

            <div className="relative min-w-0">

              {/* Slider heading */}

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                "
              >
                <div>


                  <h3
                    className="
                      text-lg
                      font-bold
                      text-white
                      sm:text-xl
                    "
                  >
                    {activeCategory === "All"
                      ? "All Projects"
                      : activeCategory}
                  </h3>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-[#FF6A00]/50
                    bg-[#FF6A00]/5
                    px-3
                    py-1
                    text-[10px]
                    font-semibold
                    text-[#FF6A00]
                  "
                >
                  {filteredProjects.length} Projects
                </span>
              </div>


              {/* No Projects */}

              {filteredProjects.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[300px]
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#11171c]
                    via-[#0b1014]
                    to-[#080b0e]
                    shadow-[0_10px_35px_rgba(0,0,0,0.4)]
                  "
                >
                  <p className="text-sm text-white/40">
                    No projects available in this category.
                  </p>
                </div>
              ) : (
                <Slider {...settings}>
                  {filteredProjects.map((project, index) => {
                    const targetUrl = normalizeUrl(
                      project.link ||
                      project.url ||
                      project.project_url ||
                      project.domain_name ||
                      project.sub_domain_name ||
                      project.github_link
                    );

                    const handleOpenUrl = () => {
                      if (targetUrl) {
                        window.open(targetUrl, "_blank", "noopener,noreferrer");
                      }
                    };

                    return (
                      <div
                        key={project.id}
                        className="px-2 pb-2"
                      >
                        {/* =================================
                            PROJECT CARD
                        ================================== */}
                        <div
                          className="
                            group
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[#FF6A00]/60
                            bg-gradient-to-br
                            from-[#171d22]
                            via-[#11171c]
                            to-[#0d1216]
                            shadow-[0_12px_35px_rgba(0,0,0,0.75),0_0_20px_rgba(255,106,0,0.10)]
                            transition-all
                            duration-500
                            hover:-translate-y-1
                            hover:border-[#FF6A00]/50
                            hover:from-[#1d2429]
                            hover:via-[#141b20]
                            hover:to-[#0f1519]
                            hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_32px_rgba(255,106,0,0.20)]
                          "
                        >
                          {/* Orange top line */}
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

                          {/* =================================
                              IMAGE
                          ================================== */}
                          <div
                            onClick={handleOpenUrl}
                            className={`
                              relative
                              h-[170px]
                              overflow-hidden
                              bg-[#080d11]
                              sm:h-[180px]
                              ${targetUrl ? "cursor-pointer" : ""}
                            `}
                          >
                            <img
                              src={project.image}
                              alt={project.title}
                              className="
                                h-full
                                w-full
                                object-contain
                                p-2
                                transition-transform
                                duration-700
                                group-hover:scale-105
                              "
                              onError={(e) => {
                                console.error("❌ Project image failed:", project.image);
                                if (!e.currentTarget.dataset.fallback) {
                                  e.currentTarget.dataset.fallback = "true";
                                  e.currentTarget.src = "/Project/p1.jpg";
                                }
                              }}
                            />
                          </div>

                          {/* =================================
                              PROJECT NAME + CATEGORY + DESCRIPTION
                          ================================== */}
                          <div className="px-4 py-4 text-left">
                            {/* Project Name */}
                            <h3
                              onClick={handleOpenUrl}
                              className={`
                                min-h-[24px]
                                text-base
                                font-semibold
                                leading-6
                                text-white
                                transition-colors
                                duration-300
                                sm:text-lg
                                ${targetUrl ? "cursor-pointer hover:text-[#FF6A00] group-hover:text-[#FF6A00]" : ""}
                              `}
                            >
                              {project.title}
                            </h3>

                            {/* Category */}
                            <span
                              className="
                                mt-2
                                inline-flex
                                items-center
                                rounded-full
                                border
                                border-[#FF6A00]/40
                                bg-[#FF6A00]/10
                                px-2.5
                                py-1
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.12em]
                                text-[#FF6A00]
                                transition-all
                                duration-300
                                group-hover:border-[#FF6A00]/70
                                group-hover:bg-[#FF6A00]/15
                              "
                            >
                              {project.category}
                            </span>

                            {/* Description */}
                            <p
                              className="
                                mt-3
                                h-[40px]
                                overflow-hidden
                                line-clamp-2
                                text-xs
                                leading-5
                                text-white/55
                                sm:text-sm
                                sm:leading-5
                              "
                            >
                              {project.description ||
                                "Scalable digital solution engineered for modern business performance."}
                            </p>

                            {/* {targetUrl && (
                              <div
                                onClick={handleOpenUrl}
                                className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 cursor-pointer text-[#FF6A00] group-hover:text-white transition-colors"
                              >
                                <span className="text-[11px] font-bold uppercase tracking-wider truncate max-w-[170px]">
                                  {targetUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                                </span>
                                <FiExternalLink size={12} className="shrink-0" />
                              </div>
                            )} */}
                          </div>
                          {/* Bottom glow */}

                          <div
                            className="
                              pointer-events-none
                              absolute
                              -bottom-20
                              left-1/2
                              h-40
                              w-40
                              -translate-x-1/2
                              rounded-full
                              bg-[#FF6A00]/10
                              opacity-60
                              blur-[50px]
                              transition-all
                              duration-500
                              group-hover:bg-[#FF6A00]/20
                              group-hover:opacity-100
                            "
                          />

                        </div>
                      </div>
                    );
                  })}
                </Slider>
              )}

            </div>
          </div>

        </div>
      </PageContainer>

      {/* =====================================================
          BOTTOM LINE
      ====================================================== */}

      <div
        className="
          h-px
          w-full
          bg-white/30
        "
      />
    </section>
  );
};

export default Projects;