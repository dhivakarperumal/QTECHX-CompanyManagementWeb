import React, { useState, useEffect, useRef } from "react";
import { FaPlay } from "react-icons/fa";
import { FiArrowRight, FiX } from "react-icons/fi";

import career from "/images/chouse.jpg";
import Button from "../Components/Button";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";
import {useNavigate} from "react-router-dom";

import AOS from "aos";
import "aos/dist/aos.css";

import logo from "/images/logo.png";

const Careers = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 80,
    });
  }, []);

  /* =========================================================
     OPEN FULLSCREEN
  ========================================================== */

  useEffect(() => {
    if (isOpen && videoContainerRef.current) {
      const el = videoContainerRef.current;

      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    }
  }, [isOpen]);

  /* =========================================================
     CLOSE POPUP
  ========================================================== */

  const closePopup = () => {
    setIsOpen(false);

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

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
          TOP LINE
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
          top-10
          hidden
          grid-cols-4
          gap-2
          opacity-70
          md:grid
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
          PAGE CONTAINER
      ====================================================== */}

      <PageContainer className="relative z-10">

        <div
          className="
            grid
            min-h-[500px]
            grid-cols-1
            items-center
            gap-8
            py-9
            sm:py-11
            md:min-h-[540px]
            md:gap-10
            lg:grid-cols-[1.05fr_0.95fr]
            lg:gap-12
            lg:py-12
          "
        >

          {/* =================================================
              LEFT VIDEO
          ================================================== */}

          <div
            data-aos="fade-right"
            className="
              relative
              order-2
              lg:order-1
            "
          >

            {/* Orange glow behind image */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-8
                -left-8
                h-40
                w-40
                rounded-full
                bg-[#FF6A00]/15
                blur-[70px]
              "
            />

            {/* Video image card */}

            <div
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#FF6A00]/30
                bg-[#11171c]
                shadow-[0_15px_45px_rgba(0,0,0,0.75),0_0_25px_rgba(255,106,0,0.08)]
                transition-all
                duration-500
                hover:border-[#FF6A00]/60
                hover:shadow-[0_20px_55px_rgba(0,0,0,0.85),0_0_35px_rgba(255,106,0,0.15)]
              "
            >

              <img
                src={career}
                alt="Q-Techx Solutions Careers"
                className="
                  h-[280px]
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-105
                  sm:h-[340px]
                  md:h-[380px]
                  lg:h-[430px]
                "
              />

              {/* Dark overlay */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#03070a]/80
                  via-[#03070a]/20
                  to-transparent
                "
              />

              {/* Orange corner */}

              <div
                className="
                  absolute
                  left-0
                  top-0
                  h-20
                  w-20
                  border-l-2
                  border-t-2
                  border-[#FF6A00]
                  opacity-80
                "
              />

              <div
                className="
                  absolute
                  bottom-0
                  right-0
                  h-20
                  w-20
                  border-b-2
                  border-r-2
                  border-[#FF6A00]
                  opacity-80
                "
              />

            </div>

          </div>


          {/* =================================================
              RIGHT CONTENT
          ================================================== */}

          <div
            className="
              relative
              order-1
              text-center
              lg:order-2
              lg:text-left
            "
          >

            {/* Background logo */}

            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                w-52
                -translate-x-1/2
                -translate-y-1/2
                opacity-[0.035]
                md:w-72
                lg:left-1/2
                lg:w-80
              "
            />

            <div className="relative z-10">

              {/* Heading */}
              <SectionTitle
                subtitle="JOIN OUR TEAM"
                align="left"
                aos="fade-left"
                className="text-center lg:text-left mb-0"
                underlineClassName="mx-auto lg:mr-auto lg:ml-0 mt-4"
              >
                EMPOWERING{" "}
                <span className="text-[#FF6A00]">
                  INNOVATION
                </span>
                <br />
                WITH LEADING
                <br />
                TECHNOLOGIES.
              </SectionTitle>


              {/* Description */}

              <p
                data-aos="fade-left"
                data-aos-delay="350"
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-7
                  text-white/60
                  sm:text-base
                  sm:leading-8
                  lg:text-[16px]
                "
              >
                At Q-Techx Solutions, we stay ahead of the
                curve—combining deep industry expertise with
                the latest technologies to deliver secure,
                scalable, and innovative digital solutions
                across cloud, cybersecurity, software, and
                IT consulting.
              </p>

              {/* Button */}

              <div
                onClick={()=>navigate("/career")}
                data-aos="fade-left"
                data-aos-delay="650"
                className="mt-7 flex justify-center lg:justify-start"
              >
                <Button>
                  <span className="flex items-center gap-2">
                    Start Your Career
                    <FiArrowRight />
                  </span>
                </Button>
              </div>

            </div>
          </div>

        </div>

      </PageContainer>


      {/* =====================================================
          VIDEO POPUP
      ====================================================== */}

      {isOpen && (
        <div
          ref={videoContainerRef}
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black
          "
          onClick={closePopup}
        >

          {/* Close button */}

          <button
            onClick={closePopup}
            aria-label="Close video"
            className="
              absolute
              right-5
              top-5
              z-[110]
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-[#FF6A00]/50
              bg-[#0b1014]
              text-white
              transition-all
              duration-300
              hover:border-[#FF6A00]
              hover:bg-[#FF6A00]
            "
          >
            <FiX size={22} />
          </button>


          {/* Video */}

          <div
            className="
              relative
              flex
              h-full
              w-full
              items-center
              justify-center
            "
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Q-Techx Solutions Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

        </div>
      )}


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
};

export default Careers;