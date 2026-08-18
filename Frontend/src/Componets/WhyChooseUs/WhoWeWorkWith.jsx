import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SocialMedia from "../Home/SocialMedia";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const categories = [
  { title: "Cryptocurrency Exchange", image: "/WhyChooseUs/Cryptocurrency Exchange.png" },
  { title: "Financial Technologies", image: "/WhyChooseUs/Financial Technologies.png" },
  { title: "Retail & E-commerce", image: "/WhyChooseUs/ecommerce.png" },
  { title: "Healthcare / Telemedicine", image: "/WhyChooseUs/health.png" },
  { title: "On-demand services", image: "/WhyChooseUs/demand services.png" },
  { title: "Entertainment", image: "/WhyChooseUs/entertainment.png" },
  { title: "Education", image: "/WhyChooseUs/education.png" },
  { title: "Logistics", image: "/WhyChooseUs/logistic.png" },
  { title: "Food Industries", image: "/WhyChooseUs/food.png" },
  { title: "Public Sectors", image: "/WhyChooseUs/sector.png" },
  { title: "Travel and Transport", image: "/WhyChooseUs/transport.webp" },
  { title: "Media & Publishing", image: "/WhyChooseUs/Media.png" },
];

const WhoWeWorkWith = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
    AOS.refresh();
  }, []);

  return (
    <>
      {/* ── HERO BANNER (PRESERVED) ── */}
      <Head
        title="Who We Work With"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/whoweworkwith">
              Who We Work With
            </Link>
          </>
        }
      />

      {/* ── MAIN CONTENT (BLACK & ORANGE THEME MATCHING HOME) ── */}
      <section className="relative w-full overflow-hidden bg-[#03070a] text-white">
        {/* Top Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-20 h-72 w-72 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

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

        <PageContainer className="relative z-10 py-14 sm:py-16 md:py-20">
          {/* Section Header */}
          <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
            <p
              data-aos="fade-down"
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs md:text-sm"
            >
              INDUSTRIES & DOMAINS
            </p>

            <h2
              data-aos="zoom-in"
              className="hero-font text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.2rem]"
            >
              WHO WE <span className="text-[#FF6A00]">WORK WITH</span>
            </h2>

            <div
              data-aos="fade-up"
              className="mx-auto mt-3 h-[2px] w-14 bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.5)]"
            />

            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="mx-auto mt-4 text-justify text-xs leading-[25px] text-white/70 sm:text-sm sm:text-center md:text-base"
            >
              At Q-Techx Solutions, we partner with businesses that are committed to growth
              and innovation. Our clients often invest in new capabilities, integrate
              acquisitions, and modernize their IT systems—and we provide end-to-end
              solutions to help them achieve these goals efficiently and effectively.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {categories.map((item, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={(index % 4) * 80}
                  className="
                    group
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
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
                    hover:-translate-y-2
                    hover:border-[#FF6A00]/50
                    hover:from-[#1d2429]
                    hover:via-[#141b20]
                    hover:to-[#0f1519]
                    hover:shadow-[0_18px_45px_rgba(0,0,0,0.8),0_0_28px_rgba(255,106,0,0.18)]
                  "
                >
                  {/* Top Laser Accent Line */}
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

                  {/* Icon Box */}
                  <div
                    className="
                      relative
                      mb-4
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      p-3
                      shadow-[inset_0_0_15px_rgba(255,106,0,0.05)]
                      transition-all
                      duration-300
                      group-hover:scale-110
                      group-hover:border-[#FF6A00]/40
                      group-hover:bg-[#FF6A00]/10
                      group-hover:shadow-[0_0_20px_rgba(255,106,0,0.25)]
                    "
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="
                      text-sm
                      font-bold
                      tracking-tight
                      text-white
                      transition-colors
                      duration-300
                      group-hover:text-[#FF6A00]
                      sm:text-base
                    "
                  >
                    {item.title}
                  </h3>

                  {/* Card Bottom Glow */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -bottom-16
                      left-1/2
                      h-28
                      w-28
                      -translate-x-1/2
                      rounded-full
                      bg-[#FF6A00]/10
                      opacity-40
                      blur-[35px]
                      transition-all
                      duration-500
                      group-hover:bg-[#FF6A00]/25
                      group-hover:opacity-100
                    "
                  />
                </div>
              ))}
            </div>
          
        </PageContainer>

        {/* Bottom Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </section>

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
      <SocialMedia />
    </>
  );
};

export default WhoWeWorkWith;
