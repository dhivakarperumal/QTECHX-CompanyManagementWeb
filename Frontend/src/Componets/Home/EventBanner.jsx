import { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import PageContainer from "../CommonComponents/PageContainer";

const EventBanner = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <section
      className="
      relative
      w-full
      overflow-hidden
      border-y
      border-[#FF6A00]/70
      bg-[#030303]
      bg-cover
      bg-center
      md:bg-right
    "
      style={{
        backgroundImage: "url('/images/student event.png')",
      }}
    >
      {/* Light background blur */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]" />

      <PageContainer className="relative z-10">
        <div
          className="
          flex
          min-h-[300px]
          items-center
          py-8
          sm:min-h-[330px]
          sm:py-10
          md:min-h-[350px]
          lg:min-h-[380px]
        "
        >

          {/* ================= LEFT CONTENT ================= */}

          <div
            data-aos="fade-right"
            className="
            w-full
            max-w-[560px]
            text-center
            md:text-left
          "
          >

            {/* Small label */}
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="mb-3 flex justify-center md:justify-start"
            >
              <span
                className="
                inline-flex
                items-center
                gap-2
                text-xs
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#FF6A00]
                sm:text-sm
              "
              >
                <span className="h-[2px] w-6 bg-[#FF6A00]" />

                Q-TECHX EVENTS
              </span>
            </div>

            {/* Heading */}
            <h2
              data-aos="fade-up"
              data-aos-delay="300"
              className="
              text-3xl
              font-bold
              uppercase
              leading-[1.05]
              tracking-tight
              text-white
              sm:text-4xl
              md:text-4xl
              lg:text-[3.2rem]
            "
            >
              STUDENT
              <br />

              <span className="text-[#FF6A00]">
                EVENT
              </span>{" "}
              BOOKING
            </h2>

            {/* Description */}
            <p
              data-aos="fade-up"
              data-aos-delay="450"
              className="
              mx-auto
              mt-4
              max-w-[480px]
              text-sm
              leading-6
              text-white/80
              sm:text-base
              sm:leading-7
              md:mx-0
            "
            >
              Join us for an exciting series of workshops,
              seminars, and activities designed exclusively
              for students.
            </p>

            {/* ================= BOOK NOW BUTTON ================= */}

            <div
              data-aos="zoom-in"
              data-aos-delay="600"
              className="
              mt-5
              flex
              justify-center
              md:justify-start
            "
            >
              <Link
                to="/form"
                className="
                group
                inline-flex
                items-center
                gap-4
                rounded-lg
                bg-[#FF6A00]
                px-6
                py-3
                text-sm
                font-bold
                uppercase
                text-white
                transition-all
                duration-300
                hover:bg-[#ff7618]
                hover:shadow-[0_8px_25px_rgba(255,106,0,0.35)]
                active:scale-95
                sm:px-7
                sm:py-2
              "
              >
                <span>
                  Book Now
                </span>

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

        </div>
      </PageContainer>

    </section>
  );
};

export default EventBanner;