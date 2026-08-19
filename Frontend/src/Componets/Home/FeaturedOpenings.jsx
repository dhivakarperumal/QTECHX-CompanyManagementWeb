import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Users,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import api from "../../api";
import PageContainer from "../CommonComponents/PageContainer";

// Date formatting helper
const formatDeadline = (dateString) => {
  if (!dateString) return "Open until filled";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Open until filled";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Open until filled";
  }
};

// Calculate days remaining helper
const getDaysLeftBadge = (dateString) => {
  if (!dateString) return null;
  const deadline = new Date(dateString);
  if (isNaN(deadline.getTime())) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineEnd = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate()
  );
  const diffTime = deadlineEnd - todayStart;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays === 0) return { text: "Closes Today", urgent: true };
  if (diffDays === 1) return { text: "1 Day Left", urgent: true };
  if (diffDays <= 3) return { text: `${diffDays} Days Left`, urgent: true };
  return { text: `${diffDays} Days Left`, urgent: false };
};

// Check if job is active and due date has not passed
const isJobActiveAndNotExpired = (job) => {
  if (job.job_status && String(job.job_status).toLowerCase() !== "active") {
    return false;
  }

  const deadlineRaw =
    job.application_deadline || job.due_date || job.expiry_date;
  if (!deadlineRaw) return true; // If no deadline specified, consider it open

  const deadline = new Date(deadlineRaw);
  if (isNaN(deadline.getTime())) return true;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineEnd = new Date(
    deadline.getFullYear(),
    deadline.getMonth(),
    deadline.getDate(),
    23,
    59,
    59,
    999
  );

  // If deadline date is in the past, do not show
  return deadlineEnd >= todayStart;
};

const FeaturedOpenings = () => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 60,
    });

    const fetchFeaturedOpenings = async () => {
      try {
        setLoading(true);
        const { data: result } = await api.get("/jobs", {
          params: { status: "active", public: true },
        });

        const rawData = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : [];

        // Filter out expired openings and format
        const validJobs = rawData
          .filter(isJobActiveAndNotExpired)
          .map((job) => ({
            id: job.id,
            title: job.job_title || job.title || "Untitled Role",
            desc:
              job.short_description ||
              job.full_job_description ||
              job.desc ||
              "Join our core engineering team to build scalable digital products.",
            type:
              job.employment_type ||
              job.work_mode ||
              job.type ||
              "Full-Time",
            category:
              job.job_category || job.department || "ENGINEERING",
            salary:
              job.minimum_salary && job.maximum_salary
                ? `${job.currency || "INR"} ${job.minimum_salary} - ${job.maximum_salary}`
                : job.minimum_salary
                ? `${job.currency || "INR"} ${job.minimum_salary}`
                : "Competitive",
            company: job.company_name || job.company || "Q-TechX",
            location:
              job.city ||
              job.state ||
              job.location ||
              job.country ||
              "Remote / On-site",
            vacancies: Number(job.vacancies || 1),
            applicationDeadline:
              job.application_deadline || job.due_date || job.expiry_date,
          }));

        // Take only the first 3 openings
        setOpenings(validJobs.slice(0, 3));
      } catch (err) {
        console.error("Failed to load featured job openings:", err);
        setOpenings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedOpenings();
  }, []);

  // If not loading and no active, unexpired openings exist, don't display section
  if (!loading && openings.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#03070a] py-10 sm:py-12 md:py-14 text-white">
      {/* Top Laser Border Divider */}
      <div className="absolute left-0 right-0 top-0 h-px bg-[#FF6A00]/40 shadow-[0_0_10px_rgba(255,106,0,0.25)]" />

      {/* Ambient Cyberpunk Glows */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#FF6A00]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

      {/* Background Subtle Grid */}
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

      <PageContainer className="relative z-10">
        {/* Section Header */}
        <div
          data-aos="fade-up"
          className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 sm:mb-10 sm:flex-row sm:items-end"
        >
          <div>
            {/* Live hiring status tag */}
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#FF6A00]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6A00] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF6A00]"></span>
              </span>
              <span>WE ARE HIRING</span>
            </div>

            <h2 className="hero-font text-2xl font-bold uppercase tracking-tight sm:text-3xl lg:text-[2.2rem]">
              FEATURED <span className="text-[#FF6A00]">OPENINGS</span>
            </h2>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              Explore key positions currently open for application before the
              deadlines.
            </p>
          </div>

          <Link
            to="/career"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6A00] transition-colors duration-300 hover:text-white"
          >
            <span>View All Careers</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[260px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              />
            ))}
          </div>
        )}

        {/* 3 Featured Openings Grid */}
        {!loading && openings.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {openings.map((job, idx) => {
              const daysBadge = getDaysLeftBadge(job.applicationDeadline);

              return (
                <div
                  key={job.id || idx}
                  data-aos="fade-up"
                  data-aos-delay={idx * 120}
                  className="
                    group
                    relative
                    flex
                    flex-col
                    justify-between
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-gradient-to-b
                    from-[#0f1419]/90
                    via-[#0a0e12]/95
                    to-[#06090c]
                    p-5
                    sm:p-6
                    shadow-[0_10px_30px_rgba(0,0,0,0.7)]
                    backdrop-blur-md
                    transition-all
                    duration-400
                    hover:-translate-y-1.5
                    hover:border-[#FF6A00]/60
                    hover:shadow-[0_16px_36px_rgba(255,106,0,0.16)]
                  "
                >
                  {/* Glowing Top Laser Line on Hover */}
                  <div className="absolute left-0 right-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#FF6A00] to-[#ff9944] transition-transform duration-500 group-hover:scale-x-100" />

                  {/* Corner Glow */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#FF6A00]/10 blur-[40px] transition-opacity duration-300 group-hover:opacity-100 opacity-50" />

                  {/* Top Content */}
                  <div>
                    {/* Header Tags */}
                    <div className="mb-3.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                        <Briefcase size={11} />
                        <span className="truncate max-w-[120px]">
                          {job.category}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-white/80">
                        <Clock size={11} className="text-[#FF6A00]" />
                        <span>{job.type}</span>
                      </span>
                    </div>

                    {/* Job Title */}
                    <h3
                      title={job.title}
                      className="hero-font text-lg font-bold uppercase tracking-tight text-white transition-colors duration-300 group-hover:text-[#FF6A00] line-clamp-1"
                    >
                      {job.title}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs leading-relaxed text-white/65 line-clamp-2">
                      {job.desc}
                    </p>

                    {/* Quick Metadata */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/75">
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 border border-white/[0.06]">
                        <MapPin size={12} className="text-[#FF6A00]" />
                        <span className="truncate max-w-[130px]">
                          {job.location}
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 border border-white/[0.06]">
                        <Users size={12} className="text-emerald-400" />
                        <span>
                          {job.vacancies}{" "}
                          {job.vacancies > 1 ? "Openings" : "Opening"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Middle / Bottom: Due Date Box & CTA */}
                  <div className="mt-5 border-t border-white/10 pt-4">
                    {/* Due Date Indicator Box */}
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
                          <Calendar size={13} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-white/50">
                            Due Date
                          </span>
                          <span className="text-xs font-bold text-white">
                            {formatDeadline(job.applicationDeadline)}
                          </span>
                        </div>
                      </div>

                      {/* Days Remaining Pill */}
                      {daysBadge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight ${
                            daysBadge.urgent
                              ? "border border-red-500/40 bg-red-500/15 text-red-300 animate-pulse"
                              : "border border-[#FF6A00]/40 bg-[#FF6A00]/15 text-[#FF6A00]"
                          }`}
                        >
                          {daysBadge.text}
                        </span>
                      )}
                    </div>

                    {/* Apply Now Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/apply/${job.id}`)}
                      className="
                        group/btn
                        relative
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        overflow-hidden
                        rounded-xl
                        bg-[#FF6A00]
                        py-2.5
                        px-4
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-white
                        shadow-[0_4px_16px_rgba(255,106,0,0.3)]
                        transition-all
                        duration-300
                        hover:bg-[#ff7a1c]
                        hover:shadow-[0_6px_22px_rgba(255,106,0,0.45)]
                        active:scale-[0.98]
                      "
                    >
                      <span>Apply For Position</span>
                      <ChevronRight
                        size={14}
                        className="transition-transform duration-300 group-hover/btn:translate-x-1"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>

      {/* Bottom Laser Border Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#FF6A00]/40 shadow-[0_0_10px_rgba(255,106,0,0.25)]" />
    </section>
  );
};

export default FeaturedOpenings;
