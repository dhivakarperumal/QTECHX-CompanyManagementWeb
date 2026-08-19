import React, { useEffect } from "react";
import { BsArrowRight } from "react-icons/bs";

import aboutImg from "/images/whychooseus.png";
import Logo from "/images/logo.png";

import Button from "../Components/Button";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

import AOS from "aos";
import "aos/dist/aos.css";

const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 80,
    });
  }, []);

  const features = [
    "Reliable Technology",
    "Creative Strategies",
    "Expert Support",
  ];

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#03070a]
        text-white
      "
    >
      {/* =====================================================
          BACKGROUND GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-10
          h-80
          w-80
          rounded-full
          bg-[#FF6A00]/10
          blur-[140px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-0
          h-[450px]
          w-[450px]
          rounded-full
          bg-[#FF6A00]/10
          blur-[150px]
        "
      />

      {/* =====================================================
          GRID BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,106,0,0.8) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,106,0,0.8) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* =====================================================
          TOP ORANGE LINE
      ====================================================== */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-[#FF6A00]/60
          shadow-[0_0_8px_rgba(255,106,0,0.25)]
        "
      />

      {/* =====================================================
          LEFT DECORATIVE DOTS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-7
          top-10
          hidden
          md:grid
          grid-cols-4
          gap-2
          opacity-70
        "
      >
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="
              h-[3px]
              w-[3px]
              rounded-full
              bg-[#FF6A00]
            "
          />
        ))}
      </div>

      {/* =====================================================
          RIGHT DECORATIVE DOTS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-8
          bottom-12
          hidden
          md:grid
          grid-cols-3
          gap-2
          opacity-70
        "
      >
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="
              h-[3px]
              w-[3px]
              rounded-full
              bg-[#FF6A00]
            "
          />
        ))}
      </div>

      {/* =====================================================
          PAGE CONTAINER
      ====================================================== */}

      <PageContainer className="relative z-10">
        <div
          className="
            grid
            items-center
            gap-3
            py-4
            sm:py-8
            md:grid-cols-[1fr_1fr]
            lg:gap-4
            lg:py-10
          "
        >

          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <div
            data-aos="fade-right"
            className="
              relative
              z-20
              order-2
              md:order-1
            "
          >

            {/* Content Card */}

            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                bg-gradient-to-br
                from-[#11171c]
                via-[#0b1014]
                to-[#080b0e]
                p-5
                shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_25px_rgba(255,106,0,0.07)]
                transition-all
                duration-500
                hover:bg-gradient-to-br
                hover:from-[#151b20]
                hover:via-[#0e1419]
                hover:to-[#090d11]
                hover:shadow-[0_18px_50px_rgba(0,0,0,0.55),0_0_35px_rgba(255,106,0,0.14)]
                sm:p-7
                lg:p-8
              "
            >

              {/* Subtle orange glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -left-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  bg-[#FF6A00]/5
                  blur-[60px]
                "
              />

              {/* Background Logo */}

              <img
                src={Logo}
                alt=""
                className="
                  pointer-events-none
                  absolute
                  -bottom-8
                  -right-8
                  w-32
                  opacity-[0.035]
                  sm:w-40
                "
              />

              {/* Heading */}
              <SectionTitle
                subtitle="WHY CHOOSE US"
                align="left"
                className="mb-0"
                underlineClassName="mr-auto"
              >
                WE'RE{" "}
                <span className="text-[#FF6A00]">
                  Q-TECHX
                </span>
                <br />
                SOLUTIONS
              </SectionTitle>

              {/* Description */}

              <p
                className="
                  relative
                  z-10
                  mt-5
                  text-sm
                  leading-6
                  text-justify
                  text-white/80
                  sm:text-base
                  sm:leading-7
                  lg:text-[15px]
                  lg:leading-7
                "
              >
                At Q-Techx Solutions, we take your business beyond limits.
                As a full-service IT partner, we provide end-to-end solutions
                that drive innovation, improve efficiency, and accelerate
                growth.
              </p>

              <p
                className="
                  relative
                  z-10
                  mt-3
                  text-sm
                  leading-6
                  text-white/80
                  sm:text-base
                  text-justify
                  sm:leading-7
                  lg:text-[15px]
                  lg:leading-7
                "
              >
                Our team delivers reliable technology, creative strategies,
                and expert support to keep your business ahead in today's
                competitive digital world.
              </p>

            
              {/* Button */}

              <div
                className="
                  relative
                  z-10
                  mt-6
                "
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <Button>
                  <span
                    className="
                      flex
                      items-center
                      gap-3
                      text-xs
                      font-bold
                      sm:text-sm
                    "
                  >
                    Explore More
                    <BsArrowRight size={15} />
                  </span>
                </Button>
              </div>

            </div>
          </div>

          {/* =================================================
              RIGHT IMAGE
          ================================================== */}

          <div
            data-aos="fade-left"
            className="
              relative
              order-1
              flex
              min-h-[300px]
              items-center
              justify-center
              md:order-2
              md:min-h-[420px]
              md:justify-center
            "
          >

            {/* Large Orange Glow */}

            <div
              className="
                pointer-events-none
                absolute
                right-[5%]
                top-1/2
                h-[280px]
                w-[280px]
                -translate-y-1/2
                rounded-full
                bg-[#FF6A00]/10
                blur-[100px]
                sm:h-[360px]
                sm:w-[360px]
                md:h-[450px]
                md:w-[450px]
              "
            />

            {/* =================================================
                IMAGE CARD - INCREASED WIDTH
            ================================================== */}

            <div
              className="
                group
                relative
                w-full
                max-w-[480px]
                rounded-2xl
                border
                border-[#FF6A00]/40
                bg-gradient-to-br
                from-[#11171c]
                via-[#0b1014]
                to-[#080b0e]
                p-3
                shadow-[0_15px_45px_rgba(0,0,0,0.5),0_0_25px_rgba(255,106,0,0.08)]
                transition-all
                duration-500
                hover:border-[#FF6A00]/80
                hover:shadow-[0_20px_55px_rgba(0,0,0,0.55),0_0_35px_rgba(255,106,0,0.18)]
                sm:max-w-[540px]
                lg:max-w-[600px]
              "
            >

              {/* Image */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-xl
                  bg-[#080d11]
                "
              >
                <img
                  src={aboutImg}
                  alt="Why Choose Q-TechX Solutions"
                  className="
                    relative
                    z-10
                    h-[300px]
                    w-full
                    object-contain
                    p-4
                    transition-transform
                    duration-700
                    group-hover:scale-[1.03]
                    sm:h-[360px]
                    md:h-[400px]
                    lg:h-[440px]
                  "
                />

                {/* Image Overlay */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    z-20
                    bg-gradient-to-t
                    from-[#03070a]/30
                    via-transparent
                    to-[#FF6A00]/5
                  "
                />
              </div>

              {/* Orange Corner */}

              <div
                className="
                  absolute
                  -bottom-4
                  -left-4
                  z-30
                  h-16
                  w-16
                  rounded-full
                  bg-[#FF6A00]
                  shadow-[0_0_25px_rgba(255,106,0,0.3)]
                  transition-all
                  duration-500
                  group-hover:scale-105
                  group-hover:shadow-[0_0_35px_rgba(255,106,0,0.4)]
                  sm:h-20
                  sm:w-20
                "
              />

              {/* Orange Corner Glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-8
                  -left-8
                  h-24
                  w-24
                  rounded-full
                  bg-[#FF6A00]/20
                  blur-[35px]
                "
              />

            </div>
          </div>
        </div>
      </PageContainer>

      {/* =====================================================
          BOTTOM ORANGE LINE
      ====================================================== */}

      <div
        className="
          h-px
          w-full
          bg-[#FF6A00]/60
          shadow-[0_0_8px_rgba(255,106,0,0.25)]
        "
      />
    </section>
  );
};

export default WhyChooseUs;