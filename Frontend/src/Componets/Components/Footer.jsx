import React from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import Buttons from "./Buttons";
import PageContainer from "../CommonComponents/PageContainer";

const Footer = () => {
  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Products", path: "/products" },
    { name: "Career", path: "/career" },
    { name: "Contact", path: "/contact" },
  ];

  const featureLinks = [
    { name: "Why Choose Us", path: "/why-choose-us" },
    { name: "Who We Work", path: "/who-we-work" },
    { name: "What We Do", path: "/what-we-do" },
    { name: "Our Achievements", path: "/achievements" },
    { name: "Terms Of Services", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ];

  return (
    <footer
      className="
        relative
        w-full
        overflow-hidden
        bg-[#020507]
        text-white
      "
    >

      {/* =====================================================
          ORANGE GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          bottom-0
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
          top-0
          h-80
          w-80
          rounded-full
          bg-[#FF6A00]/10
          blur-[140px]
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
          bg-[#FF6A00]/70
          shadow-[0_0_10px_rgba(255,106,0,0.3)]
        "
      />

      {/* =====================================================
          MAIN FOOTER CONTENT
      ====================================================== */}

      <PageContainer className="relative z-10">
        <div
          className="
      grid
      grid-cols-1
      gap-10
      py-12
      sm:grid-cols-2
      lg:grid-cols-4
      lg:gap-12
    "
        >

          {/* ===================================================
            COMPANY INFO
        ==================================================== */}

          <div className="flex flex-col items-start">

            {/* Logo */}

            <div className="mb-5 flex items-center gap-2">

              <div
                className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-xl
                border
                border-[#FF6A00]/30
                bg-[#11171c]
                shadow-[0_8px_25px_rgba(0,0,0,0.6)]
              "
              >
                <img
                  src="/images/logo.png"
                  alt="Q-TechX Solutions"
                  className="
                  h-10
                  w-10
                  object-contain
                "
                />
              </div>

              <div className="flex flex-col leading-tight">

                <span
                  className="
                  text-lg
                  font-bold
                  text-white
                "
                >
                  Q-Techx
                </span>

                <span
                  className="
                  text-xs
                  text-[#FF6A00]
                "
                >
                  Solutions
                </span>

              </div>

            </div>

            {/* Small description */}

            <p
              className="
              mb-5
              max-w-xs
              text-base
              leading-6
              text-white/80
            "
            >
              Building powerful digital solutions that
              help businesses innovate, grow, and stay
              ahead in the digital world.
            </p>

            {/* Contact */}

            <div
              className="
              space-y-3
              text-sm
              leading-relaxed
              text-white/80
            "
            >

              {/* Address */}

              <p className="flex items-start gap-3">

                <FaMapMarkerAlt
                  className="
                  mt-1
                  shrink-0
                  text-[#FF6A00]
                "
                />

                <span>
                  Tirupattur, Tamil Nadu,
                  India, 635 653.
                </span>

              </p>

              {/* Phone */}

              <p className="flex items-center gap-3">

                <FaPhoneAlt
                  className="
                  shrink-0
                  text-[#FF6A00]
                "
                />

                <span>
                  +91 91235 89879
                </span>

              </p>

              {/* Email */}

              <p className="flex items-center gap-3">

                <FaEnvelope
                  className="
                  shrink-0
                  text-[#FF6A00]
                "
                />

                <span>
                  info@qtechx.com
                </span>

              </p>

            </div>

          </div>


          {/* ===================================================
            QUICK LINKS
        ==================================================== */}

          <div>

            <h2
              className="
              mb-5
              text-base
              font-bold
              uppercase
              tracking-[0.12em]
              text-white
            "
            >
              Quick Links
            </h2>

            {/* Orange underline */}

            <div
              className="
              mb-5
              h-[2px]
              w-10
              bg-[#FF6A00]
            "
            />

            <ul className="space-y-3">

              {quickLinks.map((link, idx) => (

                <li key={idx}>

                  <Link
                    to={link.path}
                    className="
                    group
                    flex
                    items-center
                    gap-2
                    text-base
                    text-white/80
                    transition-all
                    duration-300
                    hover:translate-x-1
                    hover:text-[#FF6A00]
                  "
                  >

                    <MdOutlineArrowForwardIos
                      className="
                      text-[10px]
                      text-[#FF6A00]
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                    />

                    {link.name}

                  </Link>

                </li>

              ))}

            </ul>

          </div>


          {/* ===================================================
            FEATURES
        ==================================================== */}

          <div>

            <h2
              className="
              mb-5
              text-base
              font-bold
              uppercase
              tracking-[0.12em]
              text-white
            "
            >
              Our Features
            </h2>

            <div
              className="
              mb-5
              h-[2px]
              w-10
              bg-[#FF6A00]
            "
            />

            <ul className="space-y-3">

              {featureLinks.map(
                (item, idx) => (

                  <li key={idx}>

                    <Link
                      to={item.path}
                      className="
                      group
                      flex
                      items-center
                      gap-2
                      text-base
                      text-white/80
                      transition-all
                      duration-300
                      hover:translate-x-1
                      hover:text-[#FF6A00]
                    "
                    >

                      <MdOutlineArrowForwardIos
                        className="
                        text-[10px]
                        text-[#FF6A00]
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                      />

                      {item.name}

                    </Link>

                  </li>

                )
              )}

            </ul>

          </div>


          {/* ===================================================
            NEWSLETTER
        ==================================================== */}

          <div>

            <h2
              className="
              mb-5
              text-base
              font-bold
              uppercase
              tracking-[0.12em]
              text-white
            "
            >
              Get Newsletter
            </h2>

            <div
              className="
              mb-5
              h-[2px]
              w-10
              bg-[#FF6A00]
            "
            />

            <p
              className="
              mb-5
              text-base
              leading-6
              text-white/80
            "
            >
              Subscribe to get promotional updates &
              latest business news.
            </p>

            {/* Email input */}

            <div
              className="
              mb-4
              flex
              items-center
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-[#11171c]
              shadow-[0_8px_25px_rgba(0,0,0,0.5)]
              focus-within:border-[#FF6A00]/60
            "
            >

              <input
                type="email"
                placeholder="example@gmail.com"
                className="
                min-w-0
                flex-1
                bg-transparent
                px-4
                py-3
                text-sm
                text-white
                outline-none
                placeholder:text-white/25
              "
              />

              <button
                className="
                flex
                h-11
                w-12
                shrink-0
                items-center
                justify-center
                bg-[#FF6A00]
                text-white
                transition-all
                duration-300
                hover:bg-[#ff7515]
              "
              >
                <FaEnvelope />
              </button>

            </div>

            {/* Subscribe button */}

            <Buttons>
              Subscribe Now
            </Buttons>

          </div>

        </div>
      </PageContainer>


        {/* =====================================================
          COPYRIGHT
      ====================================================== */}

        <div
          className="
          relative
          z-10
          border-t
          border-white/[0.07]
          bg-[#020507]/80
          px-6
          py-5
          text-center
          text-xs
          text-white/35
        "
        >

          © {new Date().getFullYear()}{" "}

          <span
            className="
            font-semibold
            text-[#FF6A00]
          "
          >
            Q-Techx Solutions
          </span>

          {" "}— All Rights Reserved.

        </div>


        {/* =====================================================
          BOTTOM ORANGE LINE
      ====================================================== */}

        <div
          className="
          relative
          z-10
          h-px
          w-full
          bg-[#FF6A00]/70
          shadow-[0_0_10px_rgba(255,106,0,0.3)]
        "
        />

    </footer>
  );
};

export default Footer;