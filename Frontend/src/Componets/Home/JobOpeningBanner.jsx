import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiUsers,
  FiZap,
  FiCode,
} from "react-icons/fi";

import PageContainer from "../CommonComponents/PageContainer";

const JobOpeningBanner = () => {
  const highlights = [
    {
      icon: FiBriefcase,
      title: "Opportunities",
    },
    {
      icon: FiUsers,
      title: "Great Team",
    },
    {
      icon: FiZap,
      title: "Innovation",
    },
    {
      icon: FiCode,
      title: "Tech Growth",
    },
  ];

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        border-y
        border-white/10
        bg-[#030303]
      "
    >
      {/* =========================================================
          FULL BACKGROUND IMAGE
      ========================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/images/jobopening.png')",
        }}
      />

      {/* =========================================================
          DARK OVERLAY
      ========================================================= */}

      <div className="absolute inset-0 bg-black/30" />

      <div
        className="
    absolute
    inset-0
    bg-gradient-to-r
    from-black/20
    via-black/15
    to-black/5
  "
      />

      {/* Bottom fade */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-gradient-to-t
          from-black/70
          to-transparent
        "
      />

      {/* =========================================================
          CENTER ORANGE GLOW
      ========================================================= */}

      <div
        className="
    pointer-events-none
    absolute
    left-1/2
    top-1/2
    h-[150px]
    w-[150px]
    -translate-x-1/2
    -translate-y-1/2
    rounded-full
    bg-[#FF6A00]/5
    blur-[55px]
    sm:h-[190px]
    sm:w-[190px]
    sm:blur-[65px]
    lg:h-[230px]
    lg:w-[230px]
    lg:blur-[75px]
  "
      />

      {/* =========================================================
          TOP LINE
      ========================================================= */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-white/20
        "
      />

      <div
        className="
          absolute
          left-1/2
          top-0
          h-[2px]
          w-16
          -translate-x-1/2
          bg-[#FF6A00]
          shadow-[0_0_15px_rgba(255,106,0,0.7)]
          sm:w-20
        "
      />

      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <PageContainer>
        <div
          className="
            relative
            z-10
            flex
            min-h-[275px]
            items-center
            justify-center
            py-7
            sm:min-h-[300px]
            sm:py-8
            md:min-h-[325px]
            lg:min-h-[345px]
            lg:py-9
          "
        >

          {/* =====================================================
              RESPONSIVE THREE-COLUMN LAYOUT
          ===================================================== */}

          <div
            className="
              grid
              w-full
              grid-cols-1
              items-center
              gap-6
              lg:grid-cols-[170px_minmax(0,1fr)_170px]
              lg:gap-7
              xl:grid-cols-[190px_minmax(0,1fr)_190px]
              xl:gap-10
            "
          >

            {/* ===================================================
    LEFT CARDS
=================================================== */}

            <div
              className="
    order-2
    grid
    grid-cols-2
    gap-2
    lg:order-1
    lg:grid-cols-1
    lg:gap-2.5
    
  "
            >
              {highlights.slice(0, 2).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
          group
          flex
          items-center
          gap-2.5
          rounded-lg
          border
          border-[#FF6A00]/40
          bg-[#FF6A00]/10
          h-[42px]
px-2
py-1.5
sm:h-[46px]
md:h-[48px]
          shadow-[0_0_15px_rgba(255,106,0,0.05)]
          backdrop-blur-md
          transition-all
          duration-300
          hover:border-[#FF6A00]/70
          hover:bg-[#FF6A00]/15
          hover:shadow-[0_0_18px_rgba(255,106,0,0.12)]
        "
                  >
                    {/* Icon */}

                    <div
                      className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-[#FF6A00]
            bg-[#FF6A00]
            text-black
            transition-all
            duration-300
            group-hover:bg-black
            group-hover:text-[#FF6A00]
            sm:h-8
            sm:w-8
          "
                    >
                      <Icon size={13} />
                    </div>

                    {/* Card Text */}

                    <div className="min-w-0">
                      <span
                        className="
              block
              truncate
              text-[8px]
              font-bold
              uppercase
              leading-3
              tracking-[0.06em]
              text-white
              sm:text-[9px]
            "
                      >
                        {item.title}
                      </span>

                      <span
                        className="
              mt-0.5
              hidden
              text-[7px]
              uppercase
              tracking-wider
              text-[#FF6A00]/60
              sm:block
            "
                      >
                        Q-Techx Solutions
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===================================================
                CENTER CONTENT
            =================================================== */}

            <div
              className="
                order-1
                text-center
                lg:order-2
              "
            >

              {/* Label */}

              <div
                className="
                  mb-2.5
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <span className="h-px w-5 bg-[#FF6A00] sm:w-7" />

                <span
                  className="
                    text-[7px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-[#FF6A00]
                    sm:text-[8px]
                    md:text-[9px]
                  "
                >
                  CAREER OPPORTUNITIES
                </span>

                <span className="h-px w-5 bg-[#FF6A00] sm:w-7" />
              </div>

              {/* Heading */}

              <h2
                className="
                  mx-auto
                  max-w-[620px]
                  text-xl
                  font-bold
                  uppercase
                  leading-[0.98]
                  tracking-[-0.035em]
                  text-white
                  sm:text-2xl
                  md:text-3xl
                  lg:text-[2.1rem]
                  xl:text-[2.3rem]
                "
              >
                BUILD YOUR
                <br />

                <span className="text-[#FF6A00]">
                  NEXT CHAPTER.
                </span>
              </h2>

              {/* Description */}

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[470px]
                  px-2
                  text-[9px]
                  leading-4
                  text-white/65
                  sm:text-[10px]
                  sm:leading-5
                  md:text-[11px]
                "
              >
                Join Q-Techx Solutions and work with passionate people
                building modern technology, meaningful products, and
                innovative digital experiences.
              </p>

              {/* Buttons */}

              <div
                className="
    mt-4
    flex
    flex-wrap
    items-center
    justify-center
    gap-2
  "
              >
                {/* Explore Careers */}

                <Link
                  to="/career"
                  className="
      group
      inline-flex
      min-h-[30px]
      items-center
      justify-center
      gap-2
      rounded-full
      border
      border-[#FF6A00]
      bg-[#FF6A00]
      px-4
      py-1.5
      text-[8px]
      font-bold
      uppercase
      leading-none
      tracking-[0.07em]
      text-black
      shadow-[0_0_15px_rgba(255,106,0,0.15)]
      transition-all
      duration-300
      hover:bg-black
      hover:text-[#FF6A00]
      hover:shadow-[0_0_20px_rgba(255,106,0,0.25)]
      active:scale-95
      sm:min-h-[32px]
      sm:px-5
      sm:text-[9px]
    "
                >
                  <span>View Job Openings</span>

                  <span
                    className="
        flex
        h-4
        w-4
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-black/60
        bg-black
        text-[#FF6A00]
        transition-all
        duration-300
        group-hover:translate-x-1
        group-hover:border-[#FF6A00]
        group-hover:bg-[#FF6A00]
        group-hover:text-black
        sm:h-5
        sm:w-5
      "
                  >
                    <FiArrowRight size={9} />
                  </span>
                </Link>

                {/* Contact Us */}

                <Link
                  to="/contact"
                  className="
      inline-flex
      min-h-[30px]
      items-center
      justify-center
      rounded-full
      border
      border-[#FF6A00]/60
      bg-black/85
      px-4
      py-1.5
      text-[8px]
      font-semibold
      uppercase
      leading-none
      tracking-[0.07em]
      text-[#FF6A00]
      transition-all
      duration-300
      hover:border-[#FF6A00]
      hover:bg-[#FF6A00]
      hover:text-black
      active:scale-95
      sm:min-h-[32px]
      sm:px-5
      sm:text-[9px]
    "
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* ===================================================
    RIGHT CARDS
=================================================== */}

            <div
              className="
    order-3
    grid
    grid-cols-2
    gap-2
    lg:grid-cols-1
    lg:gap-2.5
  "
            >
              {highlights.slice(2, 4).map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
          group
          flex
          items-center
          gap-2.5
          rounded-lg
          border
          border-[#FF6A00]/40
          bg-[#FF6A00]/10
          h-[42px]
px-2
py-1.5
sm:h-[46px]
md:h-[48px]
          shadow-[0_0_15px_rgba(255,106,0,0.05)]
          backdrop-blur-md
          transition-all
          duration-300
          hover:border-[#FF6A00]/70
          hover:bg-[#FF6A00]/15
          hover:shadow-[0_0_18px_rgba(255,106,0,0.12)]
        "
                  >
                    {/* Icon */}

                    <div
                      className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-[#FF6A00]
            bg-[#FF6A00]
            text-black
            transition-all
            duration-300
            group-hover:bg-black
            group-hover:text-[#FF6A00]
            sm:h-8
            sm:w-8
          "
                    >
                      <Icon size={13} />
                    </div>

                    {/* Card Text */}

                    <div className="min-w-0">
                      <span
                        className="
              block
              truncate
              text-[8px]
              font-bold
              uppercase
              leading-3
              tracking-[0.06em]
              text-white
              sm:text-[9px]
            "
                      >
                        {item.title}
                      </span>

                      <span
                        className="
              mt-0.5
              hidden
              text-[7px]
              uppercase
              tracking-wider
              text-[#FF6A00]/60
              sm:block
            "
                      >
                        Q-Techx Solutions
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </PageContainer>

      {/* =========================================================
          BOTTOM LINE ONLY
      ========================================================= */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-px
          bg-[#FF6A00]/30
        "
      />
    </section>
  );
};

export default JobOpeningBanner;