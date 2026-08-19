import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaGoogle,
  FaLinkedinIn,
  FaWhatsapp,
  FaInstagram,
} from "react-icons/fa";

import PageContainer from "../CommonComponents/PageContainer";

function SocialMedia() {
  const socialLinks = [
    {
      icon: <FaFacebookF />,
      name: "Facebook",
      url: "https://www.facebook.com/share/1A1X9dVCTm/",
    },
    {
      icon: <FaTwitter />,
      name: "Twitter",
      url: "https://x.com/QTechxTpt?t=fmfCt7ZX-5RoQIbHJ-4s_A&s=09",
    },
    {
      icon: <FaGoogle />,
      name: "Email",
      url: "mailto:info@qtechx.com",
    },
    {
      icon: <FaLinkedinIn />,
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/q-techx-solutions-724346366/",
    },
    {
      icon: <FaWhatsapp />,
      name: "WhatsApp",
      url: "https://wa.me/919123589879?text=Hello%20Q-Techx%20Solutions%2C%20I%20am%20interested%20in%20your%20services.%20Please%20share%20more%20details.",
    },
    {
      icon: <FaInstagram />,
      name: "Instagram",
      url: "https://www.instagram.com/qtech.x?igsh=MXNsODg2YjA5N21wbA==",
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
          ORANGE GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          bottom-0
          h-64
          w-64
          rounded-full
          bg-[#FF6A00]/10
          blur-[120px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-0
          h-72
          w-72
          rounded-full
          bg-[#FF6A00]/10
          blur-[130px]
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
          bg-white/30
        "
      />

      {/* =====================================================
          DECORATIVE DOTS
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          right-8
          top-8
          hidden
          grid-cols-4
          gap-2
          opacity-70
          md:grid
        "
      >
        {Array.from({ length: 20 }).map((_, index) => (
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
          CONTENT
      ====================================================== */}

      <PageContainer className="relative z-10">

        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-7
            py-7
            sm:py-8
            md:flex-row
            md:gap-10
            lg:py-9
          "
        >

          {/* =================================================
              LOGO + COMPANY
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            {/* Logo */}

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
                alt="Q-Techx Solutions"
                className="
                  h-10
                  w-10
                  object-contain
                "
              />
            </div>

            {/* Company name */}

            <div className="flex flex-col">

              <span
                className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                Q-Techx
              </span>

              <span
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-[#FF6A00]
                "
              >
                Solutions
              </span>

              <span
                className="
                  mt-1
                  text-[9px]
                  text-white/35
                "
              >
                Technology • Innovation • Growth
              </span>

            </div>

          </div>


          {/* =================================================
              CENTER TEXT
          ================================================== */}

          <div
            className="
              hidden
              text-center
              md:block
            "
          >

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#FF6A00]
              "
            >
              CONNECT WITH US
            </p>

            <p
              className="
                mt-1
                text-xs
                text-white/40
              "
            >
              Follow Q-Techx Solutions
            </p>

          </div>


          {/* =================================================
              SOCIAL ICONS
          ================================================== */}

          <div
            className="
              flex
              flex-wrap
              justify-center
              gap-2
              sm:gap-2.5
            "
          >

            {socialLinks.map(
              (item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  title={item.name}
                  className="
                    group
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#FF6A00]/25
                    bg-[#11171c]
                    text-white/70
                    shadow-[0_8px_20px_rgba(0,0,0,0.6)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#FF6A00]
                    hover:bg-[#FF6A00]
                    hover:text-white
                    hover:shadow-[0_10px_25px_rgba(255,106,0,0.25)]
                    sm:h-11
                    sm:w-11
                  "
                >

                  {item.icon}

                  {/* Orange glow */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      rounded-xl
                      bg-[#FF6A00]/0
                      blur-md
                      transition-all
                      duration-300
                      group-hover:bg-[#FF6A00]/20
                    "
                  />

                </a>
              )
            )}

          </div>

        </div>

      </PageContainer>


      {/* =====================================================
          BOTTOM LINE
      ====================================================== */}

      <div
        className="
          h-px
          w-full
          bg-white/30
        "
      />

    </section>
  );
}

export default SocialMedia;