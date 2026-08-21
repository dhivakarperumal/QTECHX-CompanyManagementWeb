import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

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
            <SectionTitle
              subtitle="INDUSTRIES & DOMAINS"
              title="WHO WE"
              highlight="WORK WITH"
              size="lg"
              align="center"
              className="mb-0"
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
                  data-aos-delay={(index % 4) * 110}
                  className="
                    group
                    relative
                    min-h-[250px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/10
                    bg-[#0e1419]
                    p-3
                    text-center
                    shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(255,106,0,0.06)]
                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    hover:-translate-y-1.5
                    hover:border-[#FF6A00]/45
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

                  {/* Corner number accent */}
                  <span className="absolute right-4 top-3 z-20 font-mono text-[10px] font-bold tracking-widest text-white/25 transition-all duration-300 group-hover:text-[#FF6A00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Visual frame */}
                  <div className="relative flex min-h-[178px] flex-1 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1a242a] via-[#111a20] to-[#0a1014] transition-colors duration-500 group-hover:border-[#FF6A00]/30">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,106,0,0.12),transparent_55%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-white/10 bg-[#0b1115]/80 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105 group-hover:border-[#FF6A00]/40 group-hover:shadow-[0_0_24px_rgba(255,106,0,0.18)]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 px-2 py-2">
                    <h3 className="text-left text-sm font-bold leading-5 tracking-tight text-white transition-colors duration-300 group-hover:text-[#FF6A00] sm:text-base">
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-lg text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#FF6A00]" aria-hidden="true">↗</span>
                  </div>
                </div>
              ))}
            </div>
          
        </PageContainer>

        {/* Bottom Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </section>

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
    </>
  );
};

export default WhoWeWorkWith;
