import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import api from "../../api";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

// Format deadline helper
const formatDeadline = (dateString) => {
  if (!dateString) return "Open";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "Open";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Open";
  }
};

// Check if job is active and deadline has not passed
const isJobActiveAndNotExpired = (job) => {
  if (
    job.job_status &&
    String(job.job_status).toLowerCase() !== "active"
  ) {
    return false;
  }

  const deadlineRaw =
    job.application_deadline ||
    job.due_date ||
    job.expiry_date;

  if (!deadlineRaw) return true;

  const deadline = new Date(deadlineRaw);

  if (isNaN(deadline.getTime())) return true;

  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const deadlineEnd = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
    23,
    59,
    59,
    999
  );

  return deadlineEnd >= todayStart;
};

const FeaturedOpenings = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 40,
    });

    const fetchFeaturedOpenings = async () => {
      try {
        setLoading(true);

        const { data: result } = await api.get("/jobs", {
          params: {
            status: "active",
            public: true,
          },
        });

        const rawData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        // Filter active + unexpired jobs
        const validJobs = rawData
          .filter(isJobActiveAndNotExpired)
          .map((job) => ({
            id: job.id,
            title:
              job.job_title ||
              job.title ||
              "Untitled Role",
            vacancies: Number(job.vacancies || 1),
            applicationDeadline:
              job.application_deadline ||
              job.due_date ||
              job.expiry_date,
          }));

        // Show up to 4 openings
        setOpenings(validJobs.slice(0, 4));
      } catch (err) {
        console.error(
          "Failed to load featured openings:",
          err
        );

        setOpenings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedOpenings();
  }, []);

  // Do not show the component if not loading and 0 openings are available
  if (!loading && openings.length === 0) {
    return null;
  }

  // During loading, don't show an empty component if not ready yet
  if (loading) {
    return null;
  }

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#03070a]
        py-8
        text-white
        sm:py-10
      "
    >
      {/* ================= TOP BORDER ================= */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-[#FF6A00]/40
          shadow-[0_0_8px_rgba(255,106,0,0.2)]
        "
      />

      <PageContainer className="relative z-10">

        {/* ================= SECTION TITLE ================= */}

        <SectionTitle
          subtitle="WE ARE HIRING"
          title="HOT"
          highlight="OPENINGS"
          className="mb-6 sm:mb-8"
        />

        {/* ================= 4 JOB CARDS ================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-2.5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {openings.map((job, idx) => (
            <div
              key={job.id || idx}
              data-aos="fade-up"
              data-aos-delay={idx * 60}
              className="
                group
                relative
                flex
                h-[76px]
                items-center
                justify-between
                gap-3
                overflow-hidden
                rounded-xl
                border
                border-[#FF6A00]/60
                bg-[#0a0e12]/95
                px-3.5
                shadow-[0_4px_20px_rgba(0,0,0,0.5)]
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-[#FF6A00]/80
                hover:bg-[#0f141a]
                hover:shadow-[0_4px_20px_rgba(255,106,0,0.18)]
              "
            >
              {/* ================= HOVER LINE ================= */}

              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-0
                  h-[2px]
                  origin-left
                  scale-x-0
                  bg-[#FF6A00]
                  transition-transform
                  duration-300
                  group-hover:scale-x-100
                "
              />

              {/* ================= JOB INFO ================= */}

              <div className="min-w-0 flex-1">
                <h3
                  title={job.title}
                  className="
                    hero-font
                    truncate
                    text-xs
                    font-bold
                    uppercase
                    tracking-tight
                    text-white
                    transition-colors
                    duration-300
                    group-hover:text-[#FF6A00]
                    sm:text-[13px]
                  "
                >
                  {job.title}
                </h3>

                <div
                  className="
                    mt-1
                    flex
                    flex-wrap
                    items-center
                    gap-x-2.5
                    gap-y-1
                    text-[10px]
                    text-white/60
                  "
                >
                  {/* Deadline */}

                  <span className="inline-flex items-center gap-1 truncate">
                    <Calendar
                      size={11}
                      className="text-[#FF6A00] shrink-0"
                    />

                    <span>
                      Due:{" "}

                      <strong className="font-semibold text-white/85">
                        {formatDeadline(
                          job.applicationDeadline
                        )}
                      </strong>
                    </span>
                  </span>

                  {/* Vacancies */}

                  <span className="inline-flex items-center gap-1 shrink-0">
                    <Users
                      size={11}
                      className="text-emerald-400"
                    />

                    <span>
                      {job.vacancies}{" "}
                      {job.vacancies > 1
                        ? "Openings"
                        : "Opening"}
                    </span>
                  </span>
                </div>
              </div>

              {/* ================= APPLY BUTTON ================= */}

              <button
                type="button"
                onClick={() =>
                  navigate(`/apply/${job.id}`)
                }
                title={`Apply for ${job.title}`}
                aria-label={`Apply for ${job.title}`}
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[#FF6A00]
                  text-white
                  shadow-[0_0_10px_rgba(255,106,0,0.3)]
                  transition-all
                  duration-300
                  hover:scale-105
                  hover:bg-[#ff7a1c]
                  hover:shadow-[0_0_15px_rgba(255,106,0,0.5)]
                  active:scale-95
                "
              >
                <ArrowUpRight size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* ================= ALL POSITIONS LINK ================= */}

        <div className="mt-5 flex justify-center">
          <Link
            to="/career"
            className="
              group
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-white/70
              transition-colors
              duration-300
              hover:text-[#FF6A00]
            "
          >
            <span>View All Positions</span>

            <ArrowRight
              size={13}
              className="
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>
      </PageContainer>

      
      
    </section>
  );
};

export default FeaturedOpenings;