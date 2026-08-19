import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import toast from "react-hot-toast";

import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import {
  FiZap,
  FiClock,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiCpu,
  FiAward,
  FiSend,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiDollarSign,
  FiCheck,
  FiLayers,
} from "react-icons/fi";

import PageContainer from "../CommonComponents/PageContainer";
import api from "../../api";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ServiceSlider from "./ServiceSlider";

const ServiceDetails = () => {
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-in-out",
      offset: 60,
    });
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/services/public/${id}`);
        if (!data.success) throw new Error(data.message || "Failed to fetch service");

        let serviceData = data.data;

        // Parse singlepageimage if it's stored as JSON string
        if (serviceData.singlepageimage) {
          if (typeof serviceData.singlepageimage === "string") {
            try {
              serviceData.singlepageimage = JSON.parse(serviceData.singlepageimage);
            } catch (e) {
              serviceData.singlepageimage = [serviceData.singlepageimage];
            }
          }
          if (!Array.isArray(serviceData.singlepageimage)) {
            serviceData.singlepageimage = [serviceData.singlepageimage];
          }
        } else {
          serviceData.singlepageimage = [];
        }

        // Parse array / object fields
        const arrayFields = [
          "what_we_offer",
          "key_features",
          "technologies_we_use",
          "service_process",
          "industries",
          "project_type",
        ];
        arrayFields.forEach((field) => {
          if (serviceData[field] && typeof serviceData[field] === "string") {
            try {
              serviceData[field] = JSON.parse(serviceData[field]);
            } catch (e) {
              serviceData[field] = [];
            }
          }
        });

        if (serviceData.why_choose_us && typeof serviceData.why_choose_us === "string") {
          try {
            serviceData.why_choose_us = JSON.parse(serviceData.why_choose_us);
          } catch (e) {
            serviceData.why_choose_us = {};
          }
        }

        if (serviceData.pricing && typeof serviceData.pricing === "string") {
          try {
            serviceData.pricing = JSON.parse(serviceData.pricing);
          } catch (e) {
            serviceData.pricing = {};
          }
        }

        if (serviceData.duration && typeof serviceData.duration === "string") {
          try {
            serviceData.duration = JSON.parse(serviceData.duration);
          } catch (e) {
            serviceData.duration = {};
          }
        }

        setService(serviceData);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  useEffect(() => {
    const fetchAvailableServices = async () => {
      try {
        const { data } = await api.get("/services/public/all");
        if (data.success && Array.isArray(data.data)) {
          setAvailableServices(data.data);
        }
      } catch (err) {
        console.warn("Failed to load service options:", err?.message);
      }
    };

    fetchAvailableServices();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Please fill in your name and email.");
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/service-requests", {
        service_id: service.id,
        service_title: service.title,
        ...formData,
      });
      if (!data.success) throw new Error(data.message || "Failed to submit request");
      toast.success("Thank you! Your request has been received. We will contact you shortly.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#03070a] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent shadow-[0_0_20px_rgba(255,106,0,0.4)]" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/60">
          Loading Service Details...
        </p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#03070a] px-4 text-center text-white">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-xl max-w-md">
          <p className="text-base font-bold text-red-400">
            {error || "Service Not Found"}
          </p>
          <Link
            to="/services"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00] bg-[#FF6A00]/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#FF6A00] transition-colors hover:bg-[#FF6A00] hover:text-white"
          >
            ← View All Services
          </Link>
        </div>
      </div>
    );
  }

  // Fallbacks for rich content display
  const whyChooseUsEntries =
    service.why_choose_us &&
      typeof service.why_choose_us === "object" &&
      Object.keys(service.why_choose_us).length > 0
      ? Object.entries(service.why_choose_us)
      : [
        [
          "Custom-Built Architecture",
          "Engineered specifically for your exact business requirements, ensuring frictionless workflow automation.",
        ],
        [
          "Scalable Next-Gen Stack",
          "Constructed using high-performance frameworks that easily handle massive user and traffic spikes.",
        ],
        [
          "Enterprise Security & Speed",
          "End-to-end data encryption, strict authentication protocols, and lightning-fast response times.",
        ],
        [
          "Dedicated 24/7 Support",
          "Continuous monitoring, proactive system optimization, and round-the-clock developer maintenance.",
        ],
      ];

  const offerings =
    Array.isArray(service.what_we_offer) && service.what_we_offer.length > 0
      ? service.what_we_offer
      : [
        "Custom Web & System Architecture",
        "Front-end & Back-end Full-Stack Integration",
        "RESTful API & Scalable Database Design",
        "Security & Role-Based Authentication",
        "Real-Time Features & Analytics Dashboards",
        "Long-Term Maintenance & Cloud Upgrades",
      ];

  const technologies =
    Array.isArray(service.technologies_we_use) && service.technologies_we_use.length > 0
      ? service.technologies_we_use
      : ["React.js", "Node.js", "MongoDB", "Express.js", "Tailwind CSS", "AWS"];

  const startingPrice = service.pricing?.starting_price
    ? `₹${Number(service.pricing.starting_price).toLocaleString("en-IN")}`
    : "Custom Scope";
  const pricingType = service.pricing?.pricing_type || "Starting From";
  const estimatedDuration = service.duration?.estimated_time || "2-6 Weeks";
  const deliveryType = service.duration?.delivery_type || "Milestone Based";

  return (
    <div className="w-full bg-[#03070a] text-white">
      {/* ── HEAD SECTION (UNMODIFIED AS REQUESTED) ── */}
      <Head
        title={
          <>
            <p className="text-xl truncate md:overflow-visible md:text-4xl md:w-auto w-80">
              {service.title}
            </p>
          </>
        }
        subtitle={
          <>
            <Link className=" text-md md:text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className=" text-md md:text-lg font-bold text-white mx-1" />
            <Link
              className=" text-md md:text-lg truncate md:overflow-visible w-70 md:w-auto font-semibold text-white"
              to={`/services/${service.id}`}
            >
              {service.title}
            </Link>
          </>
        }
      />

      {/* =====================================================
          1. TOP PROCESS & OVERVIEW SECTION (SLIDER + DETAILS)
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-14 sm:py-16 md:py-20">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute -left-36 top-0 h-80 w-80 rounded-full bg-[#FF6A00]/15 blur-[140px]" />
        <div className="pointer-events-none absolute -right-36 top-1/2 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />

        {/* Tech Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,106,0,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,106,0,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <PageContainer className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">

            {/* Left: Animated Slider / High-Tech Frame */}
            <div data-aos="zoom-in-up" className="relative">
              <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-[#FF6A00]/15 blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border border-[#FF6A00]/40 bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#080b0e] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.15)]">
                {/* Top orange laser line */}
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />

                {service.singlepageimage &&
                  Array.isArray(service.singlepageimage) &&
                  service.singlepageimage.length > 0 ? (
                  <ServiceSlider images={service.singlepageimage} />
                ) : (
                  <div className="flex h-[260px] w-full items-center justify-center rounded-xl bg-[#090d10] md:h-[400px]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      High-Performance Architecture
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Process Content */}
            <div data-aos="zoom-in-left" className="space-y-5">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs">
                  ENGINEERED FOR EXCELLENCE
                </p>
                <h2 className="hero-font text-2xl font-bold uppercase leading-tight text-white sm:text-3xl md:text-4xl">
                  OUR <span className="text-[#FF6A00]">PROCESS & APPROACH</span>
                </h2>
                <div className="mt-3 h-[2px] w-12 bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.5)]" />
              </div>

              {/* Tagline / Subtitle */}
              {service.tagline && (
                <p className="text-sm font-semibold text-[#FF6A00] sm:text-base">
                  ⚡ {service.tagline}
                </p>
              )}

              {/* Detailed Description */}
              {(() => {
                const text =
                  service.detailed_description ||
                  service.description ||
                  service.short_description ||
                  "";
                if (!text) return null;

                const mid = Math.floor(text.length / 2);
                let splitIndex = text.indexOf(".", mid);
                if (splitIndex === -1) splitIndex = text.length;

                const firstHalf = text.substring(0, splitIndex + 1).trim();
                const secondHalf = text.substring(splitIndex + 1).trim();

                return (
                  <div className="space-y-4">
                    <p className="text-justify text-sm leading-relaxed text-white/75 sm:text-base sm:leading-7">
                      {firstHalf}
                    </p>
                    {secondHalf && (
                      <p className="text-justify text-sm leading-relaxed text-white/75 sm:text-base sm:leading-7">
                        {secondHalf}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Key Features Badges */}
              <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
                {[
                  "Agile Sprint Delivery",
                  "100% On-Time Milestones",
                  "Full Code Transparency",
                  "Dedicated Project Lead",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2 text-xs font-semibold text-white/90"
                  >
                    <FiCheckCircle className="shrink-0 text-[#FF6A00]" size={15} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          2. PRICING & DURATION SECTION (REQUESTED FEATURE)
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-14 sm:py-16 md:py-20">
        {/* Neon divider line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-[#FF6A00]/40 shadow-[0_0_8px_rgba(255,106,0,0.2)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#FF6A00]/40 shadow-[0_0_8px_rgba(255,106,0,0.2)]" />

        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6A00]/10 blur-[150px]" />

        <PageContainer className="relative z-10">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs">
              TRANSPARENT ENGAGEMENT
            </p>
            <h2 className="hero-font text-2xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
              PROJECT <span className="text-[#FF6A00]">INVESTMENT & TIMELINE</span>
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-14 bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.5)]" />
            <p className="mx-auto mt-3 max-w-xl text-xs text-white/60 sm:text-sm">
              Clear scope estimations, scalable architectures, and rapid delivery
              milestones tailored to your business goals.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Pricing */}
            <div
              data-aos="fade-up"
              data-aos-delay="100"
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
                p-7
                shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#FF6A00]/50
                hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.20)]
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white">
                <FiDollarSign size={24} />
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                {pricingType}
              </p>
              <h3 className="hero-font mt-1 text-3xl font-bold text-white">
                {startingPrice}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/65">
                Full-featured custom engineering, scalable database setup, and production deployment with no hidden fees.
              </p>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#FF6A00]" />
                  <span>Custom Feature Roadmap</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#FF6A00]" />
                  <span>Complete Source Code Ownership</span>
                </div>
              </div>
            </div>

            {/* Card 2: Duration */}
            <div
              data-aos="fade-up"
              data-aos-delay="200"
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
                p-7
                shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#FF6A00]/50
                hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.20)]
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white">
                <FiClock size={24} />
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                {deliveryType}
              </p>
              <h3 className="hero-font mt-1 text-3xl font-bold text-white">
                {estimatedDuration}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/65">
                Structured sprint cycles with weekly demo reviews, proactive testing, and fast-track implementation.
              </p>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#FF6A00]" />
                  <span>Sprint Iterations & Demos</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#FF6A00]" />
                  <span>On-Time Milestone Sign-Offs</span>
                </div>
              </div>
            </div>

            {/* Card 3: Support SLA */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
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
                p-7
                shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#FF6A00]/50
                hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.20)]
                sm:col-span-2
                lg:col-span-1
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white">
                <FiShield size={24} />
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                Service Level Assurance
              </p>
              <h3 className="hero-font mt-1 text-3xl font-bold text-white">
                24/7 Support
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-white/65">
                Comprehensive post-launch warranty, security monitoring, and continuous performance fine-tuning.
              </p>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#FF6A00]" />
                  <span>Free Post-Launch Bug Fix Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#FF6A00]" />
                  <span>Proactive Security Patches</span>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>


      {/* =====================================================
          4. WHY CHOOSE US SECTION (REQUESTED FEATURE)
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-14 sm:py-16 md:py-20">
        {/* Neon lines */}
        <div className="absolute left-0 right-0 top-0 h-px bg-[#FF6A00]/40 shadow-[0_0_8px_rgba(255,106,0,0.2)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#FF6A00]/40 shadow-[0_0_8px_rgba(255,106,0,0.2)]" />

        {/* Glow */}
        <div className="pointer-events-none absolute -right-36 top-10 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />

        <PageContainer className="relative z-10">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs">
              WHY PARTNER WITH US
            </p>
            <h2 className="hero-font text-2xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
              WHY CHOOSE US FOR <span className="text-[#FF6A00]">{service.title}</span>
            </h2>
            <div className="mx-auto mt-3 h-[2px] w-14 bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.5)]" />
            <p className="mx-auto mt-3 max-w-xl text-xs text-white/60 sm:text-sm">
              Discover why top businesses trust Q-Techx Solutions for their most critical IT projects.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUsEntries.map(([title, desc], idx) => {
              const icons = [FiAward, FiZap, FiShield, FiCpu, FiCheckCircle];
              const IconComp = icons[idx % icons.length];

              return (
                <div
                  key={idx}
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
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
                    p-6
                    shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:border-[#FF6A00]/50
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.20)]
                  "
                >
                  <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white">
                    <IconComp size={22} />
                  </div>

                  <h3 className="mb-2 text-base font-bold text-white transition-colors duration-300 group-hover:text-[#FF6A00] sm:text-lg">
                    {title}
                  </h3>

                  <p className="text-xs leading-relaxed text-white/65 sm:text-sm">
                    {desc}
                  </p>

                  <div className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#FF6A00]/10 blur-xl transition-all duration-500 group-hover:bg-[#FF6A00]/20" />
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          3. WHAT WE OFFER, TECH STACK & REQUEST FORM
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-14 sm:py-16 md:py-20">
        {/* Glow */}
        <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />

        <PageContainer className="relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">

            {/* Left Column: What We Offer & Technologies (7 Cols) */}
            <div data-aos="fade-right" className="space-y-10 lg:col-span-7">

              {/* Short Description */}
              {service.short_description && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs">
                    SOLUTION HIGHLIGHTS
                  </p>
                  <h3 className="hero-font text-xl font-bold uppercase text-white sm:text-2xl">
                    CORE <span className="text-[#FF6A00]">CAPABILITIES</span>
                  </h3>
                  <p className="mt-3 text-justify text-sm leading-relaxed text-white/75 sm:text-base sm:leading-7">
                    {service.short_description}
                  </p>
                </div>
              )}

              {/* What We Offer */}
              {offerings.length > 0 && (
                <div>
                  <h3 className="hero-font mb-4 text-lg font-bold uppercase text-white sm:text-xl">
                    WHAT WE <span className="text-[#FF6A00]">OFFER</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {offerings.map((offer, idx) => (
                      <div
                        key={idx}
                        className="
                          group
                          flex
                          items-start
                          gap-3
                          rounded-xl
                          border
                          border-white/10
                          bg-gradient-to-br
                          from-[#171d22]
                          to-[#11171c]
                          p-4
                          transition-all
                          duration-300
                          hover:border-[#FF6A00]/50
                          hover:bg-[#141b20]
                        "
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/20 text-xs font-bold text-[#FF6A00] transition-colors group-hover:bg-[#FF6A00] group-hover:text-white">
                          ✓
                        </span>
                        <span className="text-xs font-semibold leading-relaxed text-white/90 sm:text-sm">
                          {offer}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies We Use */}
              {technologies.length > 0 && (
                <div>
                  <h3 className="hero-font mb-4 text-lg font-bold uppercase text-white sm:text-xl">
                    TECHNOLOGIES <span className="text-[#FF6A00]">WE USE</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          border
                          border-white/10
                          bg-[#11171c]
                          px-4
                          py-2
                          text-xs
                          font-bold
                          text-white/85
                          shadow-inner
                          transition-all
                          duration-300
                          hover:-translate-y-0.5
                          hover:border-[#FF6A00]
                          hover:bg-[#FF6A00]/10
                          hover:text-[#FF6A00]
                          hover:shadow-[0_0_15px_rgba(255,106,0,0.2)]
                          sm:text-sm
                        "
                      >
                        <FiCpu className="text-[#FF6A00]" size={14} />
                        <span>{tech}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Contact / Request Form (5 Cols) */}
            <div data-aos="fade-left" className="lg:col-span-5">
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#FF6A00]/40
                  bg-gradient-to-br
                  from-[#171d22]
                  via-[#11171c]
                  to-[#080b0e]
                  p-6
                  shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.15)]
                  sm:p-8
                "
              >
                {/* Top orange laser line */}
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />

                <div className="mb-6">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                    <FiZap size={12} />
                    <span>Instant Project Inquiry</span>
                  </div>
                  <h3 className="hero-font text-xl font-bold uppercase text-white sm:text-2xl">
                    SEND US A <span className="text-[#FF6A00]">REQUEST</span>
                  </h3>
                  <p className="mt-1.5 text-xs text-white/60">
                    Tell us about your project requirements and our team will get
                    back to you within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Selected service */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                      Selected Service *
                    </label>
                    <select
                      value={service.id}
                      onChange={(event) => navigate(`/services/${event.target.value}`)}
                      className="w-full rounded-xl border border-white/10 bg-[#090d10] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                    >
                      {availableServices.length > 0 ? (
                        availableServices.map((option) => (
                          <option key={option.id} value={option.id} className="bg-[#090d10] text-white">
                            {option.title}
                          </option>
                        ))
                      ) : (
                        <option value={service.id}>{service.title}</option>
                      )}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-white/10 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-white/10 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-white/10 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                      Project Details / Message
                    </label>
                    <div className="relative">
                      <textarea
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={handleFormChange}
                        placeholder="Describe your goals, requirements, or timeline..."
                        className="w-full rounded-xl border border-white/10 bg-[#090d10] p-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2.5
                      rounded-full
                      bg-[#FF6A00]
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white
                      shadow-[0_0_25px_rgba(255,106,0,0.35)]
                      transition-all
                      duration-300
                      hover:bg-[#e05e00]
                      hover:shadow-[0_0_35px_rgba(255,106,0,0.55)]
                      disabled:opacity-60
                      sm:text-sm
                    "
                  >
                    <FiSend size={15} />
                    <span>{isSubmitting ? "Submitting..." : "Send Request"}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </PageContainer>
      </section>


      {/* =====================================================
          5. SOCIAL MEDIA SECTION
      ====================================================== */}
    </div>
  );
};

export default ServiceDetails;

