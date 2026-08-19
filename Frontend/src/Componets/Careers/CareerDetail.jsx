import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, IndianRupee, Calendar, Users } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { FiCheckCircle, FiSend, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";
import SocialMedia from "../Home/SocialMedia";
import PageContainer from "../CommonComponents/PageContainer";
import emailjs from "@emailjs/browser";
import api from "../../api";
import SectionTitle from "../CommonComponents/SectionTitle";

const getAppliedJobs = () => {
  try {
    const raw = localStorage.getItem("applied_jobs");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "Invalid date";
  }
};

const CareerDetail = () => {
  const navigate = useNavigate();
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        const { data: result } = await api.get("/jobs", {
          params: { status: "active", public: true },
        });

        const data = Array.isArray(result?.data) ? result.data : [];
        const appliedJobs = getAppliedJobs();

        setJobs(
          data.map((job) => {
            const totalVacancies = Number(job.vacancies || 1);
            const totalApplications = Number(job.total_applications || 0);
            const remainingVacancies = Math.max(0, totalVacancies - totalApplications);
            const alreadyApplied = appliedJobs.includes(String(job.id));

            return {
              id: job.id,
              title: job.job_title || "Untitled Role",
              desc: job.short_description || job.full_job_description || "Job description not available yet.",
              type: job.employment_type || job.work_mode || "Full-time",
              salary:
                job.minimum_salary && job.maximum_salary
                  ? `${job.currency || "INR"} ${job.minimum_salary} - ${job.maximum_salary}`
                  : job.minimum_salary
                    ? `${job.currency || "INR"} ${job.minimum_salary}`
                    : "Competitive",
              company: job.company_name || "Q Techx",
              location: job.city || job.state || job.country || "Remote",
              vacancies: totalVacancies,
              totalApplications,
              remainingVacancies,
              alreadyApplied,
              applicationStartDate: job.application_start_date,
              applicationDeadline: job.application_deadline,
            };
          })
        );
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    position: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(false);

  const handleApplyJob = (jobId) => {
    navigate(`/apply/${jobId}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";

    if (!form.mobile.trim()) newErrors.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Invalid number";

    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.position.trim()) newErrors.position = "Position is required";

    if (!form.message.trim()) newErrors.message = "Message is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const templateParams = {
          to_name: "HR Team",
          applicant_name: form.name,
          applicant_email: form.email,
          applicant_mobile: form.mobile,
          applicant_location: form.location,
          applicant_position: form.position,
          applicant_message: form.message,
        };

        await emailjs.send(
          "service_sh3mfta",
          "template_a4t1wuo",
          templateParams,
          "KHyC14cxAzIwpo4vI"
        );

        setPopup(true);
        setForm({
          name: "",
          email: "",
          mobile: "",
          location: "",
          position: "",
          message: "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to send application. Please try again.");
      }
    }
  };

  return (
    <>
      {/* ── HERO BANNER (PRESERVED) ── */}
      <Head
        title="Career"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/career">
              Career
            </Link>
          </>
        }
      />

      {/* ── MAIN CONTENT (BLACK & ORANGE THEME) ── */}
      <div className="relative w-full overflow-hidden bg-[#03070a] text-white">
        {/* Top Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-40 h-72 w-72 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

        {/* Cyberpunk Grid Texture */}
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


        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF6A00]/40 to-transparent" />

        {/* Section 2: Opening Positions */}
        <PageContainer className="relative z-10 py-14 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitle
              subtitle="CURRENT VACANCIES"
              title="OPENING"
              highlight="POSITIONS"
              size="default"
            />
          </div>

          {loading && (
            <div className="my-16 flex flex-col items-center justify-center gap-3 text-white/70">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent shadow-[0_0_15px_rgba(255,106,0,0.4)]" />
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                Loading available positions...
              </p>
            </div>
          )}

          {error && (
            <div className="mx-auto my-12 max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400">
              Failed to load jobs: {error}
            </div>
          )}

          {jobs.length === 0 && !loading && !error ? (
            <div
              className="
                relative
                mx-auto
                my-12
                max-w-3xl
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-gradient-to-br
                from-[#171d22]
                via-[#11171c]
                to-[#0d1216]
                p-8
                text-center
                shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,106,0,0.12)]
                sm:p-12
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.2)]">
                  <FiBell size={28} />
                </div>

                <h3 className="hero-font text-xl font-bold uppercase text-white sm:text-2xl">
                  OPENINGS NOT AVAILABLE CURRENTLY
                </h3>

                <p className="max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
                  We are continuously scaling our engineering capability. Click below to be notified as soon as new openings are posted.
                </p>

                <button
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-2
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
                    hover:bg-[#ff781a]
                    hover:shadow-[0_0_35px_rgba(255,106,0,0.5)]
                  "
                  onClick={() => setNotifyModal(true)}
                >
                  <FiBell size={14} />
                  <span>Notify Me</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, i) => (
                <div
                  data-aos="fade-up"
                  data-aos-delay={(i % 3) * 100}
                  key={job.id ?? i}
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
                    bg-gradient-to-br
                    from-[#171d22]
                    via-[#11171c]
                    to-[#0d1216]
                    p-6
                    shadow-[0_12px_35px_rgba(0,0,0,0.75),0_0_20px_rgba(255,106,0,0.08)]
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:border-[#FF6A00]/50
                    hover:from-[#1d2429]
                    hover:via-[#141b20]
                    hover:to-[#0f1519]
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_32px_rgba(255,106,0,0.20)]
                    sm:p-7
                  "
                >
                  {/* Top Laser Line */}
                  <div className="absolute left-0 right-0 top-0 h-[2px] origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-500 group-hover:scale-x-100" />

                  <div>
                    {/* Header: Title and Company */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#FF6A00] sm:text-xl">
                        {job.title}
                      </h3>
                      <span className="shrink-0 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                        {job.company}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mb-4 text-xs leading-relaxed text-white/65 line-clamp-3 sm:text-sm">
                      {job.desc}
                    </p>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white">
                        <Clock size={14} className="text-[#FF6A00]" /> {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white">
                        <IndianRupee size={14} className="text-[#FF6A00]" /> {job.salary}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/70">
                        {job.location}
                      </span>
                    </div>
                  </div>

                  {/* Dates and Vacancies Footer */}
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/60">
                      <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-1">
                        <Calendar size={12} className="text-[#FF6A00]" />
                        <span>Start: <strong className="text-white">{formatDate(job.applicationStartDate)}</strong></span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-1">
                        <Calendar size={12} className="text-red-400" />
                        <span>Due: <strong className="text-white">{formatDate(job.applicationDeadline)}</strong></span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-1">
                        <Users size={12} className="text-emerald-400" />
                        <span><strong className="text-emerald-400">{job.vacancies}</strong> Openings</span>
                      </span>
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => handleApplyJob(job.id)}
                      className="
                        mt-5
                        w-full
                        rounded-xl
                        bg-[#FF6A00]
                        py-3
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-white
                        shadow-[0_0_20px_rgba(255,106,0,0.3)]
                        transition-all
                        duration-300
                        hover:bg-[#ff781a]
                        hover:shadow-[0_0_30px_rgba(255,106,0,0.45)]
                      "
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notify Modal */}
          {notifyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#1b2228] to-[#0f1418] p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,106,0,0.25)] sm:p-8">
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />

                {!notifySubmitted ? (
                  <>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF6A00]">
                      <FiBell size={24} />
                    </div>

                    <h3 className="hero-font mb-2 text-xl font-bold uppercase text-white">
                      GET NOTIFIED!
                    </h3>
                    <p className="mb-5 text-xs text-white/70 sm:text-sm">
                      Enter your email and we will notify you immediately when new engineering roles are open.
                    </p>

                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Your email address"
                      className="
                        mb-5
                        w-full
                        rounded-xl
                        border
                        border-white/15
                        bg-[#080d11]
                        px-4
                        py-3
                        text-sm
                        text-white
                        placeholder-white/30
                        outline-none
                        focus:border-[#FF6A00]
                        focus:ring-1
                        focus:ring-[#FF6A00]
                      "
                    />

                    <div className="flex justify-center gap-3">
                      <button
                        className="flex-1 rounded-full bg-[#FF6A00] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,0,0.35)] transition-all hover:bg-[#ff781a]"
                        onClick={() => {
                          if (!notifyEmail || !/\S+@\S+\.\S+/.test(notifyEmail)) {
                            alert("Please enter a valid email");
                            return;
                          }
                          setNotifySubmitted(true);
                        }}
                      >
                        Submit
                      </button>
                      <button
                        className="flex-1 rounded-full border border-white/20 bg-white/[0.05] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all"
                        onClick={() => {
                          setNotifyModal(false);
                          setNotifyEmail("");
                          setNotifySubmitted(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <FiCheckCircle size={28} />
                    </div>

                    <h3 className="hero-font mb-2 text-xl font-bold uppercase text-white">
                      YOU WILL BE NOTIFIED!
                    </h3>
                    <p className="mb-6 text-xs text-white/70 sm:text-sm">
                      Thank you! We will email you once relevant opportunities become available.
                    </p>
                    <button
                      onClick={() => {
                        setNotifyModal(false);
                        setNotifyEmail("");
                        setNotifySubmitted(false);
                      }}
                      className="w-full rounded-full bg-[#FF6A00] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,0,0.35)] transition-all hover:bg-[#ff781a]"
                    >
                      OK
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </PageContainer>

        {/* Bottom Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </div>

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
      <SocialMedia />
    </>
  );
};

export default CareerDetail;