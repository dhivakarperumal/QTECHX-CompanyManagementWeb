import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PageContainer from "../CommonComponents/PageContainer";

const heroSlides = [
  {
    id: 1,
    badge: "WELCOME TO Q-TECHX SOLUTIONS",
    titleLine1: "SMART IDEAS.",
    titleLine2: "POWERFUL SOFTWARE.",
    titleHighlight: "REAL RESULTS.",
    description:
      "We build powerful software, scalable cloud systems, and user-focused digital platforms that fuel innovation and accelerate business growth.",
    primaryButton: {
      text: "Explore Q-TechX",
      link: "/about",
    },
    secondaryButton: {
      text: "Book A Call",
      link: "/booknow",
    },
    image: "/images/hero image.png",
    alt: "Q-Techx Solutions software innovation",
  },
  {
    id: 2,
    badge: "ENTERPRISE DIGITAL SOLUTIONS",
    titleLine1: "CUSTOM CLOUD &",
    titleLine2: "WEB APPLICATIONS FOR",
    titleHighlight: "SCALE & SPEED.",
    description:
      "Transform your operations with tailor-made enterprise software, robust APIs, and agile web architectures built to scale with your business.",
    primaryButton: {
      text: "View Our Projects",
      link: "/projects",
    },
    secondaryButton: {
      text: "Contact Us",
      link: "/contact",
    },
    image: "/images/hero1.png",
    alt: "Custom Cloud and Web Applications",
  },
  {
    id: 3,
    badge: "NEXT-GEN PRODUCT ENGINEERING",
    titleLine1: "INNOVATIVE APPS.",
    titleLine2: "SEAMLESS USER EXPERIENCE.",
    titleHighlight: "MARKET IMPACT.",
    description:
      "From intuitive mobile apps to full-scale digital products, we craft exceptional user experiences powered by modern, reliable technology stacks.",
    primaryButton: {
      text: "Explore Pricing",
      link: "/prices",
    },
    secondaryButton: {
      text: "Book Now",
      link: "/booknow",
    },
    image: "/images/hero3.png",
    alt: "Next-Gen Product Engineering",
  },
  {
    id: 4,
    badge: "ACCELERATE YOUR GROWTH",
    titleLine1: "FUTURE-READY TECH",
    titleLine2: "DESIGNED FOR YOUR",
    titleHighlight: "BUSINESS SUCCESS.",
    description:
      "Partner with an expert engineering team to automate processes, optimize workflows, and build high-performance digital solutions that win.",
    primaryButton: {
      text: "Get In Touch",
      link: "/contact",
    },
    secondaryButton: {
      text: "About Us",
      link: "/about",
    },
    image: "/images/hero2.png",
    alt: "Future-Ready Tech and Growth Consulting",
  },
];

const AUTO_PLAY_INTERVAL = 5000; // 5 seconds per slide

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const slideTimerRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play effect
  useEffect(() => {
    if (isPaused) return;

    slideTimerRef.current = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);

    return () => {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
    };
  }, [nextSlide, isPaused, currentSlide]);

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const activeSlide = heroSlides[currentSlide];

  return (
    <section
      className="relative mt-[72px] w-full overflow-hidden bg-[#03070a] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Hero Carousel"
    >
      {/* ================= FULL WIDTH BACKGROUND GLOWS & GRID ================= */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#FF6A00]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#FF6A00]/10 blur-[150px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,106,0,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,106,0,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* Top border */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-white/30" />

      {/* ================= MAIN CONTENT SLIDER ================= */}
      <PageContainer className="relative z-10">
        <div className="relative min-h-[580px] py-10 sm:py-14 lg:min-h-[620px] lg:py-8 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="grid w-full items-center gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-0"
            >
              {/* ================= LEFT CONTENT (DIFFERENT FOR ALL 4 SLIDES) ================= */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative z-20 max-w-[650px] text-center lg:text-left"
              >
                {/* Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3.5 py-1 text-xs md:text-sm font-bold uppercase tracking-wider text-[#FF6A00]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
                  {activeSlide.badge}
                </div>

                {/* Main Heading */}
                <h1 className="hero-font text-[1.35rem] font-bold uppercase leading-[1.25] tracking-[-0.035em] text-white sm:text-3xl md:text-3xl lg:text-[2.85rem] xl:text-[2.7rem]">
                  {activeSlide.titleLine1}
                  <br />
                  {activeSlide.titleLine2}
                  <br />
                  <span className="text-[#FF6A00]">
                    {activeSlide.titleHighlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="mx-auto mt-5 max-w-[590px] text-sm font-normal leading-relaxed text-white/80 sm:text-sm md:text-base md:leading-7 lg:mx-0 lg:text-[17px] lg:leading-8">
                  {activeSlide.description}
                </p>

                {/* Call-to-action buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <Link
                    to={activeSlide.primaryButton.link}
                    className="group inline-flex items-center gap-3.5 rounded-lg bg-[#FF6A00] px-5 py-2.5 md:px-7 md:py-3 text-xs md:text-sm font-bold uppercase text-white shadow-[0_8px_25px_rgba(255,106,0,0.25)] transition-all duration-300 hover:bg-[#ff7515] hover:shadow-[0_10px_35px_rgba(255,106,0,0.45)] active:scale-95"
                  >
                    <span>{activeSlide.primaryButton.text}</span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/80 text-sm leading-none transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#FF6A00]">
                      →
                    </span>
                  </Link>

                  {activeSlide.secondaryButton && (
                    <Link
                      to={activeSlide.secondaryButton.link}
                      className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-semibold uppercase text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-[#FF6A00]/60 hover:bg-white/10 hover:text-white active:scale-95"
                    >
                      {activeSlide.secondaryButton.text}
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* ================= RIGHT IMAGE (DIFFERENT FOR ALL 4 SLIDES) ================= */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="relative flex min-h-[300px] items-center justify-center lg:min-h-[520px] lg:justify-end"
              >
                {/* Image background radial glow */}
                <div className="pointer-events-none absolute right-[10%] top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-[#FF6A00]/12 blur-[100px] sm:h-[380px] sm:w-[380px] lg:h-[480px] lg:w-[480px]" />

                <img
                  src={activeSlide.image}
                  alt={activeSlide.alt}
                  className="relative z-10 w-full max-w-[380px] object-contain drop-shadow-[0_0_35px_rgba(255,106,0,0.18)] transition-transform duration-700 hover:scale-[1.02] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[620px] xl:max-w-[690px]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

       
      </PageContainer>

      {/* Bottom line */}
      <div className="h-px w-full bg-white/30" />
    </section>
  );
};

export default Hero;