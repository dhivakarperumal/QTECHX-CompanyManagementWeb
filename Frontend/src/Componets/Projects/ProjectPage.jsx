import React, { useEffect, useState, useCallback, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Head from "../Components/Head";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FiSearch,
  FiX,
  FiExternalLink,
  FiLayers,
  FiArrowRight,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";
import ProjectCard from "../Components/ProjectCard";
import PageContainer from "../CommonComponents/PageContainer";
import api from "../../api";

const getImageUrl = (image) => {
  if (!image) return "/Project/p1.jpg";

  if (Array.isArray(image)) {
    return image.length > 0 ? getImageUrl(image[0]) : "/Project/p1.jpg";
  }

  if (typeof image === "string") {
    const trimmed = image.trim();
    if (!trimmed) return "/Project/p1.jpg";

    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return getImageUrl(parsed);
      } catch {
        // Continue to regular string handling
      }
    }

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }

    if (trimmed.startsWith("/")) {
      return trimmed;
    }

    return `/${trimmed}`;
  }

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

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/projects/public/all?limit=100&page=1");
      const projectList = Array.isArray(data?.data) ? data.data : [];
      setProjects(projectList);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    AOS.init({ duration: 900, easing: "ease-in-out", once: true, offset: 60 });
  }, [fetchProjects]);

  // Transform API response
  const transformedProjects = useMemo(() => {
    return projects.map((proj) => {
      let imageCandidate = proj.image || proj.file_path || proj.project_images;

      if (proj.project_images) {
        if (typeof proj.project_images === "string") {
          try {
            const parsed = JSON.parse(proj.project_images);
            imageCandidate = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {
            imageCandidate = proj.project_images;
          }
        } else if (Array.isArray(proj.project_images)) {
          imageCandidate = proj.project_images[0];
        }
      }

      const features = proj.frontend_tech
        ? proj.frontend_tech
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean)
        : [];

      return {
        id: proj.uuid || proj.id,
        title: proj.project_name || proj.title || "Untitled Project",
        image: getImageUrl(imageCandidate),
        link: proj.github_link || proj.link || "#",
        category: proj.project_category || proj.category || "General",
        description: proj.description || proj.project_description || "",
        features,
      };
    });
  }, [projects]);

  // Dynamic Categories with Counts
  const categories = useMemo(() => {
    const defaultCats = ["Web Application", "Website", "E-Commerce", "Mobile App", "Education"];
    const foundCats = Array.from(
      new Set(transformedProjects.map((p) => p.category).filter(Boolean))
    );
    const merged = Array.from(new Set([...foundCats, ...defaultCats]));
    return ["All", ...merged];
  }, [transformedProjects]);

  // Filtered Projects based on category and search query
  const filteredProjects = useMemo(() => {
    return transformedProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === "All" || project.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query) ||
        project.features.some((f) => f.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [transformedProjects, selectedCategory, searchQuery]);

  return (
    <>
      {/* ── HERO BANNER (PRESERVED AS REQUESTED) ── */}
      <Head
        title="Our Projects"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/projects">
              Our Projects
            </Link>
          </>
        }
      />

      {/* ── MAIN CONTENT (DARK CYBERPUNK HOME-MATCHING THEME) ── */}
      <div className="relative w-full overflow-hidden bg-[#03070a] text-white">
        {/* Top Accent Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-20 h-72 w-72 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

        {/* Tech Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,106,0,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,106,0,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "70px 70px",
          }}
        />

        {/* Decorative Orange Dots */}
        <div className="pointer-events-none absolute right-8 top-12 hidden grid-cols-4 gap-2 opacity-70 md:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              className="h-[3px] w-[3px] rounded-full bg-[#FF6A00]"
            />
          ))}
        </div>

        <PageContainer className="relative z-10 py-14 sm:py-16 md:py-20">
          {/* =====================================================
              SECTION HEADING
          ====================================================== */}
          <div className="mb-10 text-center sm:mb-14">
            <p
              data-aos="fade-down"
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs md:text-sm"
            >
              PORTFOLIO & CASE STUDIES
            </p>

            <h2
              data-aos="zoom-in"
              className="hero-font text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.2rem]"
            >
              EXPLORE OUR <span className="text-[#FF6A00]">RECENT PROJECTS</span>
            </h2>

            <div
              data-aos="fade-up"
              className="mx-auto mt-3 h-[2px] w-14 bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.5)]"
            />

          
          </div>

          {/* =====================================================
              SEARCH & FILTER CONTROLS
          ====================================================== */}
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="mb-10 space-y-6"
          >
            {/* Search Input Bar */}
            <div className="mx-auto max-w-xl">
              <div className="relative flex items-center">
                <FiSearch className="pointer-events-none absolute left-4 text-white/40" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by project name, tech stack, or keyword..."
                  className="
                    w-full
                    rounded-full
                    border
                    border-white/15
                    bg-gradient-to-r
                    from-[#11171c]
                    to-[#0d1216]
                    py-3
                    pl-11
                    pr-10
                    text-xs
                    text-white
                    placeholder-white/40
                    shadow-[0_8px_25px_rgba(0,0,0,0.5)]
                    outline-none
                    backdrop-blur-md
                    transition-all
                    duration-300
                    focus:border-[#FF6A00]
                    focus:shadow-[0_0_20px_rgba(255,106,0,0.25)]
                    sm:text-sm
                  "
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-[#FF6A00] hover:text-white"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? transformedProjects.length
                    : transformedProjects.filter((p) => p.category === cat).length;

                // Only show category if count > 0 or it's 'All'
                if (count === 0 && cat !== "All") return null;

                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      group
                      relative
                      flex
                      items-center
                      gap-2
                      rounded-full
                      px-4
                      py-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      transition-all
                      duration-300
                      sm:px-5
                      sm:py-2.5
                      sm:text-xs
                      ${
                        isActive
                          ? "border border-[#FF6A00] bg-[#FF6A00] text-white shadow-[0_0_20px_rgba(255,106,0,0.4)]"
                          : "border border-white/10 bg-[#11171c] text-white/70 hover:border-[#FF6A00]/40 hover:text-white"
                      }
                    `}
                  >
                    <span>{cat}</span>
                    <span
                      className={`
                        rounded-full
                        px-2
                        py-0.5
                        text-[9px]
                        font-bold
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-white/50 group-hover:text-white/80"
                        }
                      `}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Counter Summary */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5 font-semibold text-white/70">
                <FiLayers className="text-[#FF6A00]" size={14} />
                <span>
                  Showing {filteredProjects.length} of {transformedProjects.length} Projects
                </span>
              </span>

              {(selectedCategory !== "All" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="font-bold text-[#FF6A00] underline-offset-4 hover:underline"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* =====================================================
              LOADING / ERROR / EMPTY / GRID
          ====================================================== */}
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.3)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Loading Projects Showcase...
              </p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
              <p className="text-sm font-bold text-red-400">Error: {error}</p>
              <button
                onClick={fetchProjects}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00] bg-[#FF6A00]/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#FF6A00] transition hover:bg-[#FF6A00] hover:text-white"
              >
                Retry
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#0d1216] p-12 text-center shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00]">
                <FiSearch size={24} />
              </div>
              <h3 className="hero-font text-xl font-bold uppercase text-white">
                No Projects Found
              </h3>
              <p className="mt-2 text-xs text-white/60 sm:text-sm">
                No projects matched your selected filter or search query "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-6 rounded-full border border-[#FF6A00] bg-[#FF6A00] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,0,0.3)] transition hover:bg-[#ff7515]"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {filteredProjects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  aosDelay={(i % 6) * 100}
                  onSelect={(p) => setSelectedProjectModal(p)}
                />
              ))}
            </div>
          )}

          {/* =====================================================
              BOTTOM CALL TO ACTION (CTA)
          ====================================================== */}
          <div
            data-aos="fade-up"
            className="
              mt-16
              overflow-hidden
              rounded-2xl
              border
              border-[#FF6A00]/40
              bg-gradient-to-br
              from-[#1a2127]
              via-[#11171c]
              to-[#0a0e12]
              p-8
              text-center
              shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(255,106,0,0.15)]
              sm:p-12
            "
          >
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                <FiZap className="animate-pulse" />
                <span>LET'S BUILD TOGETHER</span>
              </div>

              <h3 className="hero-font text-2xl font-bold uppercase text-white sm:text-3xl md:text-4xl">
                HAVE AN AMBITIOUS PROJECT <span className="text-[#FF6A00]">IN MIND?</span>
              </h3>

              <p className="mx-auto max-w-xl text-xs leading-relaxed text-white/70 sm:text-sm">
                From concept to deployment, our specialized engineering teams turn complex
                ideas into scalable, high-performance digital reality.
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  to="/booknow"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-3
                    rounded-full
                    bg-[#FF6A00]
                    px-7
                    py-3
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-white
                    shadow-[0_0_25px_rgba(255,106,0,0.35)]
                    transition-all
                    duration-300
                    hover:bg-[#ff7515]
                    hover:shadow-[0_0_35px_rgba(255,106,0,0.5)]
                    sm:text-sm
                  "
                >
                  <span>Start Your Project</span>
                  <FiArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/contact"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/20
                    bg-white/[0.04]
                    px-6
                    py-3
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-white
                    transition-all
                    duration-300
                    hover:border-[#FF6A00]
                    hover:bg-white/[0.08]
                    sm:text-sm
                  "
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>

        {/* Bottom Accent Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </div>

      {/* =====================================================
          QUICK VIEW MODAL
      ====================================================== */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#FF6A00]/50 bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#0d1216] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,106,0,0.25)] text-white sm:p-8">
            {/* Top Accent line */}
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />

            {/* Close button */}
            <button
              onClick={() => setSelectedProjectModal(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition hover:bg-[#FF6A00] hover:text-white"
            >
              <FiX size={16} />
            </button>

            {/* Modal Image */}
            <div className="relative mb-5 h-[240px] w-full overflow-hidden rounded-xl bg-[#080d11] sm:h-[280px]">
              <img
                src={selectedProjectModal.image}
                alt={selectedProjectModal.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/Project/p1.jpg";
                }}
              />
              <span className="absolute left-3 top-3 rounded-full border border-[#FF6A00]/50 bg-[#03070a]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                {selectedProjectModal.category}
              </span>
            </div>

            {/* Title & Desc */}
            <h3 className="hero-font text-xl font-bold uppercase text-white sm:text-2xl">
              {selectedProjectModal.title}
            </h3>
            <div className="mt-2 h-[2px] w-12 bg-[#FF6A00]" />

            <p className="mt-4 text-xs leading-relaxed text-white/75 sm:text-sm">
              {selectedProjectModal.description ||
                "Full-stack custom application crafted with scalable engineering and intuitive UI/UX."}
            </p>

            {/* Tech Stack */}
            {selectedProjectModal.features && selectedProjectModal.features.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                  Technologies Used:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedProjectModal.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              {selectedProjectModal.link && selectedProjectModal.link !== "#" && (
                <a
                  href={selectedProjectModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF6A00] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,0,0.3)] transition hover:bg-[#ff7515]"
                >
                  <span>Visit Live Project</span>
                  <FiExternalLink size={14} />
                </a>
              )}
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
    </>
  );
};

export default ProjectPage;