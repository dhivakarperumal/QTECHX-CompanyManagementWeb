import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiZap,
  FiTarget,
  FiEye,
  FiCompass,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiShield,
  FiCpu,
  FiCheckCircle,
  FiArrowRight,
  FiGlobe,
} from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";

import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";
import SocialMedia from "../Home/SocialMedia";
import aboutImg from "/images/about4.webp";
import Head from "../Components/Head";

// Animated Counter Component with IntersectionObserver
const Counter = ({ end, suffix = "", label, icon: Icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 1800;
    const incrementTime = 25;
    const totalSteps = duration / incrementTime;
    const step = Math.max(1, Math.ceil(end / totalSteps));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div
      ref={ref}
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
        text-center
        shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
        transition-all
        duration-500
        hover:-translate-y-1.5
        hover:border-[#FF6A00]/50
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.18)]
      "
    >
      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Icon */}
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white">
          <Icon size={22} />
        </div>
      )}

      {/* Number */}
      <h3 className="hero-font text-3xl font-bold tracking-tight text-white sm:text-4xl">
        <span className="text-white">{count}</span>
        <span className="text-[#FF6A00]">{suffix}</span>
      </h3>

      {/* Label */}
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/70 sm:text-sm">
        {label}
      </p>

      {/* Ambient hover glow */}
      <div className="pointer-events-none absolute -bottom-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#FF6A00]/10 blur-xl transition-all duration-500 group-hover:bg-[#FF6A00]/25" />
    </div>
  );
};

const About = () => {
  const [activeTab, setActiveTab] = useState("goal");

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-in-out",
      offset: 60,
    });
  }, []);

  const tabData = {
    mission: {
      icon: FiTarget,
      title: "Our Mission",
      subtitle: "Driving Measurable Growth Through Innovation",
      description:
        "To revolutionize businesses through smart, scalable IT solutions that simplify complexity, enhance performance, and fuel measurable growth. We aim to be a catalyst for digital transformation through continuous innovation, uncompromising quality, and rock-solid integrity.",
      highlights: [
        "Transforming legacy workflows into smart digital engines",
        "Delivering robust, scalable, and secure cloud infrastructures",
        "Empowering global enterprises with high-ROI software solutions",
      ],
    },
    vision: {
      icon: FiEye,
      title: "Our Vision",
      subtitle: "Defining the Future of Digital Excellence",
      description:
        "To be recognized as the most trusted global IT partner — empowering businesses with intelligent technology, setting new industry standards for quality, security, and innovation, and redefining what digital success looks like across every sector.",
      highlights: [
        "Setting world-class benchmarks in web & mobile engineering",
        "Pioneering user-centric designs with state-of-the-art tech stacks",
        "Fostering long-term client success and sustainable technological growth",
      ],
    },
    goal: {
      icon: FiCompass,
      title: "Our Goal",
      subtitle: "Empowering Modern Businesses to Lead & Thrive",
      description:
        "At Q-Techx Solutions, our goal is to empower businesses to succeed in the digital era. We strive to deliver innovative, high-quality, and tailored IT solutions that drive growth, enhance operational efficiency, and create lasting value for our clients through technology, creativity, and strategic insight.",
      highlights: [
        "Accelerating time-to-market with agile delivery methodologies",
        "Building scalable systems ready for exponential user growth",
        "Providing dedicated 24/7 support and strategic tech consulting",
      ],
    },
  };

  const timeline = [
    {
      year: "2021",
      title: "Foundation & Inception",
      description:
        "M8 MEDIA of M8 groups was established. M8 MEDIA was registered as an online B2B and B2C platform, exclusively catering to the demands of the education sector.",
      icon: FiZap,
    },
    {
      year: "2022",
      title: "Growth & Multi-Tech Expansion",
      description:
        "We expanded our capabilities to include end-to-end mobile app development, digital marketing campaigns, and custom software solutions for a rapidly growing client base.",
      icon: FiTrendingUp,
    },
    {
      year: "2023",
      title: "Innovation & Enterprise Delivery",
      description:
        "Strengthened our engineering team, integrated cutting-edge modern tech stacks, and completed over 150+ successful projects, establishing a reputation for speed and reliability.",
      icon: FiCpu,
    },
    {
      year: "2024",
      title: "Global Reach & Digital Scaling",
      description:
        "Q-Techx Solutions expanded services globally, empowering international startups and enterprise clients with end-to-end IT solutions and strategic transformation consulting.",
      icon: FiGlobe,
    },
    {
      year: "2025",
      title: "Continuous Excellence & Beyond",
      description:
        "Delivering 300+ milestones, focusing on next-gen architecture, artificial intelligence, client success, and fostering an empowered workforce of elite developers.",
      icon: FiAward,
    },
  ];

  const pillars = [
    {
      icon: FiCpu,
      title: "Next-Gen Tech Stacks",
      description:
        "Architecting scalable web, cloud, and mobile systems built on high-performance frameworks and clean modular design.",
    },
    {
      icon: FiShield,
      title: "Enterprise Security",
      description:
        "Strict adherence to modern data protection, encryption protocols, and bulletproof security standards across all applications.",
    },
    {
      icon: FiZap,
      title: "Agile & Rapid Delivery",
      description:
        "Fast-paced sprint execution, transparent milestone reporting, and 100% on-time project delivery without compromising quality.",
    },
    {
      icon: FiClock,
      title: "24/7 Dedicated Support",
      description:
        "Round-the-clock technical monitoring, maintenance, and support teams to keep your mission-critical operations smooth.",
    },
  ];

  const ActiveIcon = tabData[activeTab].icon;

  return (
    <div className="w-full bg-[#03070a] text-white">

       <Head
        title="About Us"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/career">
              About Us
            </Link>
          </>
        }
      />

      {/* =====================================================
          2. WHO WE ARE & COMPANY OVERVIEW
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20 lg:py-24">
        {/* Glows */}
        <div className="pointer-events-none absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#FF6A00]/10 blur-[140px]" />

        <PageContainer className="relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            
            {/* Left Content */}
            <div data-aos="fade-right" className="space-y-6">
              <SectionTitle
                subtitle="WHO WE ARE"
                title="EMPOWERING YOUR BUSINESS THROUGH"
                highlight="NEXT-GEN TECH"
                align="left"
                size="lg"
                className="mb-0"
              />

              <p className="text-justify text-sm leading-relaxed text-white/75 sm:text-base sm:leading-7">
                Q-Techx Solutions delivers cutting-edge IT solutions globally,
                from web and mobile applications to digital marketing, UI/UX
                design, and enterprise systems. With 4+ years of expertise and
                hundreds of completed projects, we blend creativity, engineering
                rigor, and on-time execution to help companies scale confidently.
              </p>

              <p className="text-justify text-sm leading-relaxed text-white/75 sm:text-base sm:leading-7">
                Whether you are a rising startup looking to make an impact or an
                established enterprise modernizing legacy architecture, our
                cross-functional teams ensure results that accelerate efficiency,
                drive revenue, and build sustainable advantage.
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Custom Web & Mobile Engineering",
                  "Secure & Scalable Architectures",
                  "Dedicated 24/7 Technical Support",
                  "On-Time Delivery Guarantee",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-xs font-semibold text-white/90 sm:text-sm"
                  >
                    <FiCheckCircle className="shrink-0 text-[#FF6A00]" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA Action */}
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-3
                    rounded-full
                    border
                    border-[#FF6A00]
                    bg-[#FF6A00]/10
                    px-6
                    py-3
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-white
                    shadow-[0_0_20px_rgba(255,106,0,0.15)]
                    transition-all
                    duration-300
                    hover:bg-[#FF6A00]
                    hover:shadow-[0_0_28px_rgba(255,106,0,0.35)]
                    sm:text-sm
                  "
                >
                  <span>Connect With Us</span>
                  <FiArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Right Image Frame */}
            <div data-aos="fade-left" className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                {/* Back glow */}
                <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[#FF6A00]/15 blur-2xl" />

                {/* Outer frame */}
                <div className="relative overflow-hidden rounded-2xl border border-[#FF6A00]/50 bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#080b0e] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.15)]">
                  <img
                    src={aboutImg}
                    alt="Q-Techx Solutions Company"
                    className="h-[300px] w-full rounded-xl object-cover object-center transition-transform duration-700 hover:scale-105 sm:h-[380px] lg:h-[420px]"
                    onError={(e) => {
                      e.currentTarget.src = "/images/about us (2).png";
                    }}
                  />

                  {/* Top neon line overlay */}
                  <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />
                </div>

                {/* Floating Experience Badge */}
                <div className="absolute -bottom-6 -left-4 rounded-xl border border-[#FF6A00]/60 bg-[#0b1014]/95 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,106,0,0.2)] backdrop-blur-md sm:-bottom-7 sm:-left-6 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF6A00]">
                      <FiAward size={22} />
                    </div>
                    <div>
                      <p className="hero-font text-xl font-bold leading-none text-white sm:text-2xl">
                        4+ <span className="text-[#FF6A00]">Years</span>
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:text-xs">
                        Proven Excellence
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          3. CORE PILLARS / VALUES
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-36 top-10 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />

        <PageContainer className="relative z-10">
          {/* Heading */}
          <SectionTitle
            subtitle="WHAT DRIVES US"
            title="OUR FOUNDATIONAL"
            highlight="PILLARS"
            size="lg"
            className="mb-12 sm:mb-14"
          />

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon;
              return (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 120}
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
                  {/* Top orange line on hover */}
                  <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Icon */}
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF6A00] group-hover:text-white">
                    <PillarIcon size={24} />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#FF6A00]">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-white/60 sm:text-sm">
                    {pillar.description}
                  </p>

                  {/* Glow */}
                  <div className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-[#FF6A00]/10 blur-xl transition-all duration-500 group-hover:bg-[#FF6A00]/20" />
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          4. INTERACTIVE MISSION, VISION & GOALS
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20 lg:py-24">
        {/* Glow */}
        <div className="pointer-events-none absolute -left-36 bottom-0 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />

        <PageContainer className="relative z-10">
          <SectionTitle
            subtitle="PURPOSE & DIRECTION"
            title="MISSION, VISION &"
            highlight="GOALS"
            size="lg"
            className="mb-10 sm:mb-12"
          />

          {/* Interactive Tab Switcher */}
          <div
            data-aos="fade-up"
            className="mx-auto mb-8 flex flex-wrap justify-center gap-2.5 sm:gap-4"
          >
            {[
              { id: "mission", label: "Our Mission", icon: FiTarget },
              { id: "vision", label: "Our Vision", icon: FiEye },
              { id: "goal", label: "Our Goal", icon: FiCompass },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-2.5
                    rounded-full
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    transition-all
                    duration-300
                    sm:px-6
                    sm:py-3
                    sm:text-sm
                    ${
                      isActive
                        ? "border border-[#FF6A00] bg-[#FF6A00] text-white shadow-[0_0_25px_rgba(255,106,0,0.4)]"
                        : "border border-white/10 bg-[#11171c] text-white/70 hover:border-[#FF6A00]/40 hover:text-white"
                    }
                  `}
                >
                  <TabIcon
                    size={16}
                    className={`transition-colors ${
                      isActive ? "text-white" : "text-[#FF6A00]"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card */}
          <div
            data-aos="zoom-in"
            className="
              mx-auto
              max-w-4xl
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-gradient-to-br
              from-[#171d22]
              via-[#11171c]
              to-[#0d1216]
              p-6
              shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(255,106,0,0.1)]
              transition-all
              duration-500
              hover:border-[#FF6A00]/50
              sm:p-8
              md:p-10
            "
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              {/* Icon */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.2)]">
                <ActiveIcon size={32} />
              </div>

              {/* Text content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="hero-font text-xl font-bold uppercase text-white sm:text-2xl">
                    {tabData[activeTab].title}
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#FF6A00] sm:text-sm">
                    {tabData[activeTab].subtitle}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-white/80 sm:text-base sm:leading-7">
                  {tabData[activeTab].description}
                </p>

                {/* Highlights */}
                <div className="mt-4 space-y-2.5 pt-2">
                  {tabData[activeTab].highlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs text-white/85 sm:text-sm"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6A00]/20 text-[#FF6A00]">
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          5. COMPANY JOURNEY / TIMELINE
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20 lg:py-24">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />

        <PageContainer className="relative z-10">
          <SectionTitle
            subtitle="OUR MILESTONES"
            title="OUR JOURNEY"
            highlight="STARTED"
            size="lg"
            description="Tracing our evolution from an education platform to a premier global software solutions provider."
            className="mb-14 sm:mb-16"
          />

          {/* Timeline Structure */}
          <div className="relative mx-auto max-w-5xl">
            {/* Center Orange Laser Line */}
            <div className="absolute left-4 top-0 hidden h-full w-[2px] bg-gradient-to-b from-[#FF6A00]/80 via-[#FF6A00] to-[#FF6A00]/40 shadow-[0_0_10px_rgba(255,106,0,0.5)] md:left-1/2 md:-translate-x-1/2 md:block" />

            <div className="space-y-8 sm:space-y-12">
              {timeline.map((item, index) => {
                const ItemIcon = item.icon;
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={index}
                    data-aos={isEven ? "fade-right" : "fade-left"}
                    data-aos-delay={index * 100}
                    className={`
                      relative
                      flex
                      flex-col
                      items-center
                      md:flex-row
                      ${isEven ? "md:justify-start" : "md:justify-end"}
                    `}
                  >
                    {/* Left Year Label (Desktop for Even) */}
                    {isEven && (
                      <div className="hidden w-1/2 pr-12 text-right md:block">
                        <span className="hero-font inline-block rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 px-4 py-1.5 text-2xl font-bold text-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.2)]">
                          {item.year}
                        </span>
                      </div>
                    )}

                    {/* Central Node Circle */}
                    <div className="absolute left-1/2 z-20 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#FF6A00] bg-[#0b1014] text-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.6)] md:flex">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF6A00] animate-ping" />
                    </div>

                    {/* Content Box */}
                    <div className="w-full md:w-1/2 md:px-12">
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
                          p-6
                          shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
                          transition-all
                          duration-500
                          hover:-translate-y-1
                          hover:border-[#FF6A00]/50
                          hover:shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(255,106,0,0.18)]
                        "
                      >
                        {/* Orange top accent */}
                        <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {/* Mobile Year Badge */}
                        <div className="mb-3 flex items-center justify-between md:hidden">
                          <span className="hero-font rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 px-3 py-1 text-sm font-bold text-[#FF6A00]">
                            {item.year}
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6A00]/10 text-[#FF6A00]">
                            <ItemIcon size={16} />
                          </div>
                        </div>

                        {/* Card Header */}
                        <div className="flex items-center gap-3">
                          <div className="hidden h-9 w-9 items-center justify-center rounded-lg border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-[#FF6A00] md:flex">
                            <ItemIcon size={18} />
                          </div>
                          <h3 className="text-base font-bold text-white transition-colors duration-300 group-hover:text-[#FF6A00] sm:text-lg">
                            {item.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-xs leading-relaxed text-white/65 sm:text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Right Year Label (Desktop for Odd) */}
                    {!isEven && (
                      <div className="hidden w-1/2 pl-12 text-left md:block">
                        <span className="hero-font inline-block rounded-full border border-[#FF6A00]/50 bg-[#FF6A00]/10 px-4 py-1.5 text-2xl font-bold text-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.2)]">
                          {item.year}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          6. STATS / IMPACT NUMBERS
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20">
        {/* Neon line dividers */}
        <div className="absolute left-0 right-0 top-0 h-px bg-[#FF6A00]/40 shadow-[0_0_8px_rgba(255,106,0,0.2)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#FF6A00]/40 shadow-[0_0_8px_rgba(255,106,0,0.2)]" />

        <PageContainer className="relative z-10">
          <SectionTitle
            subtitle="PROVEN RESULTS"
            title="OUR IMPACT IN"
            highlight="NUMBERS"
            size="lg"
            className="mb-12 sm:mb-14"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div data-aos="zoom-in" data-aos-delay="100">
              <Counter
                end={5}
                suffix="+"
                label="Years Of Experience"
                icon={FiClock}
              />
            </div>
            <div data-aos="zoom-in" data-aos-delay="200">
              <Counter
                end={150}
                suffix="+"
                label="Trained & Mentored"
                icon={FiUsers}
              />
            </div>
            <div data-aos="zoom-in" data-aos-delay="300">
              <Counter
                end={50}
                suffix="+"
                label="Happy Clients"
                icon={FiAward}
              />
            </div>
            <div data-aos="zoom-in" data-aos-delay="400">
              <Counter
                end={40}
                suffix="+"
                label="Completed Projects"
                icon={FiTrendingUp}
              />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          7. CALL TO ACTION BANNER
      ====================================================== */}
      <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20">
        <PageContainer className="relative z-10">
          <div
            data-aos="zoom-in"
            className="
              relative
              overflow-hidden
              rounded-3xl
              border
              border-[#FF6A00]/50
              bg-gradient-to-br
              from-[#171d22]
              via-[#11171c]
              to-[#080b0e]
              p-8
              text-center
              shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.18)]
              sm:p-12
              lg:p-16
            "
          >
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute -left-20 top-0 h-40 w-40 rounded-full bg-[#FF6A00]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-40 w-40 rounded-full bg-[#FF6A00]/20 blur-3xl" />

            <h2 className="hero-font text-2xl font-bold uppercase text-white sm:text-4xl lg:text-[2.8rem]">
              READY TO BUILD YOUR NEXT <span className="text-[#FF6A00]">BIG IDEA?</span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm md:text-base">
              Partner with Q-Techx Solutions today. Let’s collaborate to turn
              your visionary ideas into robust, scalable, and high-impact digital
              realities.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-full
                  bg-[#FF6A00]
                  px-7
                  py-3.5
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-white
                  shadow-[0_0_25px_rgba(255,106,0,0.4)]
                  transition-all
                  duration-300
                  hover:bg-[#e05e00]
                  hover:shadow-[0_0_35px_rgba(255,106,0,0.6)]
                  sm:text-sm
                "
              >
                <span>Get In Touch</span>
                <FiArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/projects"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2.5
                  rounded-full
                  border
                  border-white/20
                  bg-white/[0.04]
                  px-7
                  py-3.5
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-white
                  transition-all
                  duration-300
                  hover:border-[#FF6A00]/60
                  hover:bg-[#FF6A00]/10
                  hover:text-[#FF6A00]
                  sm:text-sm
                "
              >
                <span>View Our Projects</span>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* =====================================================
          8. SOCIAL MEDIA SECTION
      ====================================================== */}
      <SocialMedia />

    </div>
  );
};

export default About;

