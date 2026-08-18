import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaPenNib, FaBullhorn, FaCode } from "react-icons/fa";

import PageContainer from "../CommonComponents/PageContainer";

const Methodology = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 80,
    });
  }, []);

  const items = [
    {
      icon: FaPenNib,
      number: "01",
      title: "Branding",
      description:
        "At Q-Techx Solutions, we build brands that stand out. From logos to complete strategies, we craft identities that connect with your audience and inspire lasting trust.",
    },
    {
      icon: FaBullhorn,
      number: "02",
      title: "Marketing",
      description:
        "We blend creativity with data to grow your business. From SEO to social media, our campaigns drive visibility, engagement, and real results.",
    },
    {
      icon: FaCode,
      number: "03",
      title: "Development",
      description:
        "We create scalable, secure, and user-friendly websites, apps, and software. Our solutions help you innovate, streamline, and grow in the digital world.",
    },
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
          top-0
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
          h-[400px]
          w-[400px]
          rounded-full
          bg-[#FF6A00]/10
          blur-[150px]
        "
      />

      {/* =====================================================
          TECH GRID
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
          LEFT DOTS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-6
          top-12
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
          RIGHT DOTS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-6
          top-20
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
            py-8
            sm:py-10
            lg:py-12
          "
        >

          {/* =================================================
              HEADING
          ================================================== */}

          <div
            className="
              mx-auto
              mb-8
              max-w-3xl
              text-center
              sm:mb-10
            "
            data-aos="fade-up"
          >
            <p
              className="
                mb-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#FF6A00]
                sm:text-xs
              "
            >
              HOW WE WORK
            </p>

            <h2
              className="
                hero-font
                text-[2.3rem]
                font-bold
                uppercase
                leading-none
                tracking-[-0.035em]
                text-white
                sm:text-4xl
                md:text-5xl
                lg:text-[3.4rem]
              "
            >
              OUR{" "}
              <span className="text-[#FF6A00]">
                METHODOLOGY
              </span>
            </h2>

            {/* Orange underline */}

            <div
              className="
                mx-auto
                mt-3
                h-[2px]
                w-14
                bg-[#FF6A00]
                shadow-[0_0_10px_rgba(255,106,0,0.5)]
              "
            />

          </div>

          {/* =================================================
              METHODOLOGY CARDS
          ================================================== */}

          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-3
              lg:gap-6
            "
          >
            {items.map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 180}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#FF6A00]/40
                  bg-gradient-to-br
                  from-[#11171c]
                  via-[#0b1014]
                  to-[#080b0e]
                  p-5
                  shadow-[0_10px_35px_rgba(0,0,0,0.45),0_0_22px_rgba(255,106,0,0.08)]
                  transition-all
                  duration-500
                  hover:-translate-y-2
                  hover:border-[#FF6A00]
                  hover:from-[#171d22]
                  hover:via-[#0e1419]
                  hover:to-[#090d11]
                  hover:shadow-[0_18px_50px_rgba(0,0,0,0.55),0_0_35px_rgba(255,106,0,0.18)]
                  sm:p-6
                "
              >

                {/* =================================================
                    TOP ORANGE ANIMATION
                ================================================== */}

                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-[2px]
                    origin-left
                    scale-x-0
                    bg-[#FF6A00]
                    transition-transform
                    duration-500
                    group-hover:scale-x-100
                  "
                />

                {/* =================================================
                    NUMBER
                ================================================== */}

                <div
                  className="
                    absolute
                    left-4
                    top-4
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-[#FF6A00]/60
                    bg-[#03070a]
                    text-xs
                    font-bold
                    text-[#FF6A00]
                    shadow-[0_0_12px_rgba(255,106,0,0.08)]
                  "
                >
                  {item.number}
                </div>

                {/* Large background number */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-0
                    text-7xl
                    font-bold
                    text-white/[0.025]
                    transition-all
                    duration-500
                    group-hover:text-[#FF6A00]/10
                  "
                >
                  {item.number}
                </span>

                {/* =================================================
                    IMAGE
                ================================================== */}

                <div
                  className="
                    relative
                    mx-auto
                    mb-5
                    mt-4
                    flex
                    h-32
                    w-32
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#FF6A00]/40
                    bg-gradient-to-br
                    from-[#171d21]
                    to-[#090d10]
                    shadow-[0_0_25px_rgba(255,106,0,0.10)]
                    transition-all
                    duration-500
                    group-hover:border-[#FF6A00]
                    group-hover:bg-gradient-to-br
                    group-hover:from-[#20272c]
                    group-hover:to-[#0b1014]
                    group-hover:shadow-[0_0_35px_rgba(255,106,0,0.22)]
                  "
                >

                  {/* Inner glow */}

                  <div
                    className="
                      absolute
                      inset-4
                      rounded-full
                      bg-[#FF6A00]/10
                      blur-xl
                      transition-all
                      duration-500
                      group-hover:bg-[#FF6A00]/20
                    "
                  />

                  <div
                    className="
    relative
    mx-auto
    mb-5
    mt-4
    flex
    h-32
    w-32
    items-center
    justify-center
    rounded-full
    border
    border-[#FF6A00]/60
    bg-gradient-to-br
    from-[#171d21]
    to-[#090d10]
    shadow-[0_0_25px_rgba(255,106,0,0.15)]
    transition-all
    duration-500
    group-hover:border-[#FF6A00]
    group-hover:shadow-[0_0_40px_rgba(255,106,0,0.30)]
  "
                  >
                    {/* Inner glow */}
                    <div
                      className="
      absolute
      inset-3
      rounded-full
      bg-[#FF6A00]/10
      blur-xl
      transition-all
      duration-500
      group-hover:bg-[#FF6A00]/20
    "
                    />

                    {/* Icon */}
                    <item.icon
                      className="
      relative
      z-10
      text-6xl
      text-[#FF6A00]
      drop-shadow-[0_0_10px_rgba(255,106,0,0.55)]
      transition-all
      duration-500
      group-hover:scale-110
      group-hover:drop-shadow-[0_0_18px_rgba(255,106,0,0.8)]
    "
                    />
                  </div>

                </div>

                {/* =================================================
                    TITLE
                ================================================== */}

                <h3
                  className="
                    text-center
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  {item.title}
                </h3>

                {/* Orange underline */}

                <div
                  className="
                    mx-auto
                    mt-2
                    h-[2px]
                    w-8
                    bg-[#FF6A00]
                    shadow-[0_0_8px_rgba(255,106,0,0.35)]
                    transition-all
                    duration-500
                    group-hover:w-14
                  "
                />

                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                <p
                  className="
                    mt-4
                    text-center
                    text-sm
                    leading-6
                    text-white/60
                    sm:text-[15px]
                    sm:leading-7
                  "
                >
                  {item.description}
                </p>

                {/* =================================================
                    CARD INNER ORANGE GLOW
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-20
                    left-1/2
                    h-40
                    w-40
                    -translate-x-1/2
                    rounded-full
                    bg-[#FF6A00]/10
                    blur-[50px]
                    opacity-60
                    transition-all
                    duration-500
                    group-hover:bg-[#FF6A00]/20
                    group-hover:opacity-100
                  "
                />

                {/* =================================================
                    BOTTOM ORANGE LINE
                ================================================== */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    h-[2px]
                    w-0
                    -translate-x-1/2
                    bg-[#FF6A00]
                    shadow-[0_0_10px_rgba(255,106,0,0.6)]
                    transition-all
                    duration-500
                    group-hover:w-1/2
                  "
                />

              </div>
            ))}
          </div>

          {/* =================================================
              BOTTOM PROCESS LINE
          ================================================== */}

          <div
            data-aos="fade-up"
            data-aos-delay="500"
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <span className="h-px w-10 bg-[#FF6A00]/40 sm:w-16" />

            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-white/35
                sm:text-[10px]
              "
            >
              Strategy
              <span className="mx-2 text-[#FF6A00]">
                •
              </span>
              Creativity
              <span className="mx-2 text-[#FF6A00]">
                •
              </span>
              Technology
            </span>

            <span className="h-px w-10 bg-[#FF6A00]/40 sm:w-16" />
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

export default Methodology;