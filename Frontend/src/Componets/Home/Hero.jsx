import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Button from "../Components/Button";
import PageContainer from "../CommonComponents/PageContainer";

const rocketImg = "/images/hero image.png";

const Hero = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 80,
    });
  }, []);

  return (
    <section className="relative mt-[72px] w-full overflow-hidden bg-[#03070a]">

      {/* ================= FULL WIDTH BACKGROUND ================= */}

      {/* Orange glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#FF6A00]/10 blur-[150px]" />

      {/* Grid */}
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
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-[#FF6A00]/20" />

      {/* ================= ONLY CONTENT ================= */}

      <PageContainer className="relative z-10">
        <div className="grid min-h-[590px] items-center gap-4 py-12 sm:py-16 lg:min-h-[620px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-0 lg:py-3">

          {/* LEFT CONTENT */}
          <div
            data-aos="fade-right"
            className="relative z-20 max-w-[650px] text-center lg:text-left"
          >
            <p className="mb-5 text-xs md:text-sm font-bold uppercase tracking-wide text-[#FF6A00] sm:text-base">
              WELCOME TO Q-TECHX SOLUTIONS
            </p>

            <h1
              className="
              hero-font
              text-[1.3rem]
              font-bold
              uppercase
              leading-[1.3]
              tracking-[-0.035em]
              text-white
              sm:text-3xl
              md:text-3xl
              lg:text-[3rem]
              xl:text-[2.7rem]
            "
            >
              SMART IDEAS.
              <br />

              POWERFUL SOFTWARE.
              <br />

              <span className="text-[#FF6A00]">
                REAL RESULTS.
              </span>
            </h1>

            <p
              className="
              mx-auto
              mt-7
              max-w-[590px]
              text-sm
              font-normal
              leading-5
              md:leading-7
              text-white/80
              sm:text-sm  
              lg:mx-0
              lg:text-[17px]
              lg:leading-8
            "
            >
              We build powerful software, scalable cloud systems, and
              user-focused digital platforms that fuel innovation and
              accelerate business growth.
            </p>

           <div className="mt-8 flex justify-center lg:justify-start">
  <Link
    to="/career"
    className="
      group
      inline-flex
      items-center
      gap-4
      rounded-lg
      bg-[#FF6A00]
      px-4
      py-2
      md:px-7
      md:py-3
      text-xs
      md:text-sm
      font-bold
      uppercase
      text-white
      transition-all
      duration-300
      hover:bg-[#ff7515]
      hover:shadow-[0_8px_30px_rgba(255,106,0,0.35)]
      active:scale-95
    "
  >
    <span>Explore Q-TechX</span>

    <span
      className="
        flex
        h-6
        w-6
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-white/80
        text-sm
        leading-none
        transition-all
        duration-300
        group-hover:translate-x-1
        group-hover:bg-white
        group-hover:text-[#FF6A00]
      "
    >
      →
    </span>
  </Link>
</div>
          </div>

          {/* RIGHT IMAGE */}
          <div
            data-aos="fade-left"
            className="
            relative
            flex
            min-h-[320px]
            items-center
            justify-center
            lg:min-h-[550px]
            lg:justify-end
          "
          >
            {/* Image glow - still full within content area */}
            <div
              className="
              pointer-events-none
              absolute
              right-[10%]
              top-1/2
              h-[260px]
              w-[260px]
              -translate-y-1/2
              rounded-full
              bg-[#FF6A00]/10
              blur-[100px]
              sm:h-[380px]
              sm:w-[380px]
              lg:h-[500px]
              lg:w-[500px]
            "
            />

            <img
              src={rocketImg}
              alt="Q-Techx Solutions software innovation"
              className="
              relative
              z-10
              w-full
              max-w-[430px]
              object-contain
              drop-shadow-[0_0_35px_rgba(255,106,0,0.12)]
              transition-transform
              duration-700
              hover:scale-[1.02]
              sm:max-w-[520px]
              md:max-w-[600px]
              lg:max-w-[690px]
              xl:max-w-[760px]
            "
            />
          </div>

        </div>
      </PageContainer>
      {/* Orange line below navbar */}
      <div className="h-px w-full bg-white/30" />

    </section>
  );
};

export default Hero;