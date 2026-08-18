import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SocialMedia from "../Home/SocialMedia";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const WhyChooseUs = () => {
  const features = [
    {
      img: "/WhyChooseUs/CustomerExperience.jpg",
      title: "Customer Experience",
      desc: "At Q-Techx Solutions, we put customers first. Every interaction with our products and services is designed to leave a positive impression, ensuring seamless usability and long-term satisfaction.",
    },
    {
      img: "/WhyChooseUs/Unique Services.jpg",
      title: "Unique Services",
      desc: "We understand that every business is different. That’s why we craft tailored digital solutions that align with your goals, highlight your strengths, and help maximize revenue growth.",
    },
    {
      img: "/WhyChooseUs/Enterprise Modernization.jpg",
      title: "Enterprise Modernization",
      desc: "Our team helps organizations upgrade and modernize their technologies to stay ahead in the digital era. We leverage the latest tools and frameworks to ensure your business runs smarter, faster, and more efficiently.",
    },
    {
      img: "/WhyChooseUs/On-Time Project Delivery.jpg",
      title: "On-Time Project Delivery",
      desc: "We value your time. Our project managers streamline workflows, guide our expert teams, and ensure your project is delivered on schedule—without compromising on quality.",
    },
    {
      img: "/WhyChooseUs/Better HR Process.jpg",
      title: "Better HR Process",
      desc: "At Q-Techx Solutions, we believe strong teams build strong businesses. We follow a fast and efficient onboarding process, and our Customer Relationship Supervisors continuously track performance to maintain excellence.",
    },
    {
      img: "/WhyChooseUs/Specialized Teams.jpg",
      title: "Specialized Teams",
      desc: "Our skilled professionals bring years of IT outsourcing experience. By joining forces with us, you gain a team that is not only ready to work but also dedicated to continuous learning and innovation.",
    },
  ];

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
        title="Why Choose Us"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/whychooseus">
              Why Choose Us
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
              OUR VALUE PROPOSITION
            </p>

            <h2
              data-aos="zoom-in"
              className="hero-font text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.2rem]"
            >
              WHY <span className="text-[#FF6A00]">CHOOSE US</span>
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
              At Q-Techx Solutions, our solutions are cutting-edge and delivered on time.
              We leverage innovative processes and advanced technologies to achieve
              customer-focused results. With years of experience across diverse
              industries, we’ve seen it all—and know exactly how to make your project a
              success.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {features.map((item, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="
                    group
                    relative
                    flex
                    h-full
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-gradient-to-br
                    from-[#171d22]
                    via-[#11171c]
                    to-[#0d1216]
                    shadow-[0_12px_35px_rgba(0,0,0,0.75),0_0_20px_rgba(255,106,0,0.08)]
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:border-[#FF6A00]/50
                    hover:from-[#1d2429]
                    hover:via-[#141b20]
                    hover:to-[#0f1519]
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_32px_rgba(255,106,0,0.20)]
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

                  {/* Image Wrapper */}
                  <div className="relative h-60 w-full overflow-hidden bg-[#080d11]">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-110
                      "
                      onError={(e) => {
                        e.currentTarget.src = "/WhyChooseUs/CustomerExperience.jpg";
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-[#0d1216]
                        via-[#03070a]/20
                        to-transparent
                      "
                    />

                    {/* Step Number Pill */}
                    <span
                      className="
                        absolute
                        left-4
                        top-4
                        z-10
                        rounded-full
                        border
                        border-[#FF6A00]/50
                        bg-[#03070a]/85
                        px-3
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#FF6A00]
                        backdrop-blur-md
                        shadow-[0_0_12px_rgba(255,106,0,0.2)]
                      "
                    >
                      0{index + 1}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-6 text-left">
                    <h3
                      className="
                        text-lg
                        font-bold
                        tracking-tight
                        text-white
                        transition-colors
                        duration-300
                        group-hover:text-[#FF6A00]
                        sm:text-xl
                      "
                    >
                      {item.title}
                    </h3>

                    {/* Small Accent Line */}
                    <div
                      className="
                        mb-3
                        mt-2
                        h-[2px]
                        w-8
                        bg-[#FF6A00]
                        shadow-[0_0_8px_rgba(255,106,0,0.4)]
                        transition-all
                        duration-300
                        group-hover:w-14
                      "
                    />

                    <p
                      className="
                        text-justify
                        text-xs
                        leading-[23px]
                        text-white/65
                        sm:text-sm
                      "
                    >
                      {item.desc}
                    </p>
                  </div>

                  {/* Card Bottom Glow */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      -bottom-20
                      left-1/2
                      h-36
                      w-36
                      -translate-x-1/2
                      rounded-full
                      bg-[#FF6A00]/10
                      opacity-50
                      blur-[45px]
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

export default WhyChooseUs;
