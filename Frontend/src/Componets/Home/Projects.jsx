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

const Slider = SliderLib.default ? SliderLib.default : SliderLib;

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
        const { data } = await api.get(
          "/projects/public/all?limit=100&page=1"
        );

        if (data.success && Array.isArray(data.data)) {
          const transformedProjects = data.data.map((project) => {
            let projectImages = [];

            if (project.project_images) {
              if (typeof project.project_images === "string") {
                try {
                  projectImages = JSON.parse(project.project_images);
                } catch {
                  projectImages = [];
                }
              } else if (Array.isArray(project.project_images)) {
                projectImages = project.project_images;
              }
            }

            const features = project.frontend_tech
              ? project.frontend_tech
                .split(",")
                .map((tech) => tech.trim())
              : [];

            return {
              id: project.id,
              title: project.project_name || "",
              image:
                projectImages[0] ||
                "/images/default-project.jpg",
              category:
                project.project_category || "General",
              description:
                project.project_description || "",
              features,
              link: project.github_link || "#",
            };
          });

          setItems(transformedProjects);
        }

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
        setSlidesToShow(3);
      } else {
        setSlidesToShow(4);
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
        bg-[#0b1014]
        text-[#FF6A00]
        shadow-[0_0_20px_rgba(255,106,0,0.12)]
        transition-all
        duration-300
        hover:border-[#FF6A00]
        hover:bg-[#FF6A00]
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
        bg-[#0b1014]
        text-[#FF6A00]
        shadow-[0_0_20px_rgba(255,106,0,0.12)]
        transition-all
        duration-300
        hover:border-[#FF6A00]
        hover:bg-[#FF6A00]
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
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />, 
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
          bg-[#FF6A00]/60
          shadow-[0_0_8px_rgba(255,106,0,0.25)]
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

          <div
            className="
              mb-8
              text-center
              sm:mb-10
            "
          >
            <p
              className="
                mb-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#FF6A00]
                sm:text-xs
                md:text-sm
              "
            >
              OUR WORK
            </p>

            <h2
              className="
                hero-font
                text-[2.3rem]
                font-bold
                uppercase
                leading-none
                tracking-[-0.035em]
                text-white
                sm:text-4xl
                md:text-5xl
                lg:text-[3.5rem]
              "
            >
              LATEST{" "}
              <span className="text-[#FF6A00]">
                PROJECTS
              </span>
            </h2>

            <div
              className="
                mx-auto
                mt-3
                h-[2px]
                w-14
                bg-[#FF6A00]
                shadow-[0_0_10px_rgba(255,106,0,0.5)]
              "
            />

          </div>

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
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-widest
                      text-white/35
                    "
                  >
                    SHOWING
                  </p>

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
                    border-[#FF6A00]/25
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
                  {filteredProjects.map(
                    (project, index) => (
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
  border-white/10
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
                            className="
                              relative
                              h-[220px]
                              overflow-hidden
                              bg-[#080d11]
                              sm:h-[240px]
                            "
                          >

                            <img
                              src={project.image}
                              alt={project.title}
                              className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-700
                                group-hover:scale-105
                              "
                            />

                            {/* Image overlay */}

                            <div
                              className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-[#03070a]
                                via-[#03070a]/20
                                to-transparent
                              "
                            />

                            {/* Category */}

                            <span
                              className="
                                absolute
                                left-4
                                top-4
                                rounded-full
                                border
                                border-[#FF6A00]/40
                                bg-[#03070a]/80
                                px-3
                                py-1
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-wider
                                text-[#FF6A00]
                                backdrop-blur-sm
                              "
                            >
                              {project.category}
                            </span>

                          </div>


                          {/* =================================
                              CONTENT
                          ================================== */}

                          <div className="p-5">

                            <h3
                              className="
                                text-xl
                                font-bold
                                text-white
                                transition-colors
                                duration-300
                                group-hover:text-[#FF6A00]
                              "
                            >
                              {project.title}
                            </h3>


                            <div
                              className="
                                mt-2
                                h-[2px]
                                w-8
                                bg-[#FF6A00]
                                transition-all
                                duration-300
                                group-hover:w-14
                              "
                            />


                            <p
                              className="
                                mt-3
                                line-clamp-3
                                text-sm
                                leading-6
                                text-white/50
                              "
                            >
                              {project.description}
                            </p>


                            {/* Features */}

                            {project.features.length > 0 && (
                              <div
                                className="
                                  mt-4
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >
                                {project.features
                                  .slice(0, 3)
                                  .map(
                                    (feature, featureIndex) => (
                                      <span
                                        key={featureIndex}
                                        className="
                                          rounded-md
                                          border
                                          border-white/10
                                          bg-white/[0.03]
                                          px-2
                                          py-1
                                          text-[9px]
                                          text-white/45
                                        "
                                      >
                                        {feature}
                                      </span>
                                    )
                                  )}
                              </div>
                            )}


                            {/* View Project */}

                            {project.link &&
                              project.link !== "#" && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="
                                    group/link
                                    mt-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-[#FF6A00]
                                    transition-all
                                    duration-300
                                    hover:text-white
                                  "
                                >
                                  View Project

                                  <span
                                    className="
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      rounded-full
                                      border
                                      border-[#FF6A00]/50
                                      transition-all
                                      duration-300
                                      group-hover/link:translate-x-1
                                      group-hover/link:bg-[#FF6A00]
                                      group-hover/link:text-white
                                    "
                                  >
                                    <FiExternalLink
                                      size={11}
                                    />
                                  </span>
                                </a>
                              )}

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
                    )
                  )}
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
          bg-[#FF6A00]/60
          shadow-[0_0_8px_rgba(255,106,0,0.25)]
        "
      />
    </section>
  );
};

export default Projects;