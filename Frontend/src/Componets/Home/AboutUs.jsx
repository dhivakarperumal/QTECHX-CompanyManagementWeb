import React, { useEffect } from "react";
import about from "/images/about us (2).png";
import { GiFamilyHouse, GiProgression } from "react-icons/gi";
import {
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import Button from "../Components/Button";
import { BsArrowRight } from "react-icons/bs";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

import AOS from "aos";
import "aos/dist/aos.css";

const CounterCard = ({
  end,
  suffix = "+",
  label,
  description,
  icon: Icon,
  delay = 0,
}) => {
  const [count, setCount] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    let current = 0;

    // Slower counting
    const duration = 2500;
    const interval = 40;
    const steps = duration / interval;
    const increment = end / steps;

    const timer = setInterval(() => {
      current += increment;

      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [started, end]);

  return (
    <div
      ref={ref}
      data-aos="fade-up"
      data-aos-delay={delay}
      className="
        flex
        h-[72px]
        w-[155px]
        items-center
        gap-3
        rounded-lg
        border
        border-white/15
        bg-[#080d11]/90
        px-3
        transition-all
        duration-300
        hover:border-[#FF6A00]/60
        hover:bg-[#0d1318]
        sm:h-[78px]
        sm:w-[170px]
      "
    >
      {/* Icon */}
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-md
          bg-[#FF6A00]/10
        "
      >
        <Icon
          size={25}
          className="text-[#FF6A00]"
        />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-lg font-bold leading-none sm:text-xl">
          {count}
          <span className="text-[#FF6A00]">
            {suffix}
          </span>
        </h3>

        <p className="mt-1 text-[10px] font-semibold text-[#FF6A00] sm:text-xs">
          {label}
        </p>

        <p className="text-[8px] text-white/45 sm:text-[9px]">
          {description}
        </p>
      </div>
    </div>
  );
};

const AboutUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 80,
    });
  }, []);

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

      {/* ================= BACKGROUND GLOW ================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-10
          h-72
          w-72
          rounded-full
          bg-[#FF6A00]/10
          blur-[130px]
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
          blur-[140px]
        "
      />


      {/* ================= GRID BACKGROUND ================= */}

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


      {/* ================= TOP ORANGE LINE ================= */}

      <div
        className="
          pointer-events-none
          absolute
          left-0
          right-0
          top-0
          h-px
          bg-[#FF6A00]/40
        "
      />


      {/* ================= ORANGE DOTS ================= */}

      <div
        className="
          pointer-events-none
          absolute
          right-8
          top-8
          hidden
          md:grid
          grid-cols-4
          gap-[7px]
          opacity-80
        "
      >
        {Array.from({ length: 28 }).map((_, index) => (
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
            gap-6
            py-5
            sm:py-6
            md:grid-cols-[1.4fr_0.6fr_1.15fr]
            lg:gap-8
            lg:py-7
          "
        >


          {/* =====================================================
              LEFT CONTENT
          ====================================================== */}

          <div
            data-aos="fade-right"
            className="
              relative
              z-20
              max-w-[600px]
              text-center
              md:text-left
            "
          >

            {/* Heading */}
            <SectionTitle
              subtitle="WHO WE ARE"
              title="ABOUT"
              highlight="US"
              align="left"
              size="lg"
              className="text-center md:text-left mb-0"
              underlineClassName="mx-auto md:mr-auto md:ml-0"
            />


            {/* First Paragraph */}

            <p
              className="
                mx-auto
                mt-5
                max-w-[570px]
                text-sm
                text-justify
                font-normal
                leading-6
                text-white/80
                sm:text-base
                sm:leading-7
                md:mx-0
                lg:text-[15px]
                lg:leading-7
              "
            >
              At Q-Techx Solutions, we don’t just build software — we create
              intelligent digital experiences that transform the way businesses
              operate. Whether you're a startup or an enterprise, we deliver
              tailor-made IT solutions that accelerate growth, optimize
              performance, and future-proof your business.
            </p>


            {/* Second Paragraph */}

            <p
              className="
                mx-auto
                mt-3
                max-w-[570px]
                text-sm
                font-normal
                leading-6
                text-justify
                text-white/80
                sm:text-base
                sm:leading-7
                md:mx-0
                lg:text-[15px]
                lg:leading-7
              "
            >
              Backed by a team of innovative thinkers and skilled developers,
              we ensure 24/7 support, rapid delivery, and uncompromising
              quality across every project.
            </p>


            {/* Read More Button */}

            <div
              className="
                mt-6
                flex
                justify-center
                md:justify-start
              "
              data-aos="fade-up"
              data-aos-delay="300"
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
                  Read More

                  <BsArrowRight size={15} />
                </span>
              </Button>
            </div>

          </div>


          {/* =====================================================
              MIDDLE STATS
          ====================================================== */}

          {/* ================= STATS ================= */}

          <div
            className="
    order-3
    flex
    flex-col
    items-center
    justify-center
    gap-4
    md:order-2
  "
          >
            <CounterCard
              end={5}
              suffix="+"
              label="Years"
              description="Industry Experience"
              icon={GiFamilyHouse}
              delay={200}
            />

            <CounterCard
              end={21}
              suffix="+"
              label="Projects"
              description="Completed"
              icon={GiProgression}
              delay={300}
            />

            <CounterCard
              end={50}
              suffix="+"
              label="Clients"
              description="Happy Clients"
              icon={FiUsers}
              delay={400}
            />

            <CounterCard
              end={24}
              suffix="/7"
              label="Support"
              description="Technical Assistance"
              icon={FiClock}
              delay={500}
            />
          </div>

          {/* =====================================================
              RIGHT IMAGE
          ====================================================== */}

          <div
            data-aos="fade-left"
            className="
              order-1
              flex
              justify-center
              md:order-3
              md:justify-end
            "
          >

            <div
              className="
                relative
                w-full
                max-w-[400px]
                sm:max-w-[450px]
                lg:max-w-[480px]
              "
            >

              {/* Main Image */}

              <img
                src={about}
                alt="Q-Techx Solutions Office"
                className="
                  relative
                  z-10
                  h-[250px]
                  w-full
                  rounded-2xl
                  border
                  border-[#FF6A00]/50
                  object-cover
                  object-center
                  shadow-[0_0_30px_rgba(255,106,0,0.12)]
                  transition-transform
                  duration-700
                  hover:scale-[1.02]
                  sm:h-[300px]
                  md:h-[320px]
                  lg:h-[340px]
                "
              />


              {/* Orange Circle */}

              <div
                className="
                  absolute
                  -bottom-6
                  -right-5
                  z-20
                  h-[75px]
                  w-[75px]
                  rounded-full
                  bg-[#FF6A00]
                  opacity-90
                  sm:h-[85px]
                  sm:w-[85px]
                  lg:h-[95px]
                  lg:w-[95px]
                "
              />


              {/* Orange Glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-12
                  -right-10
                  z-0
                  h-32
                  w-32
                  rounded-full
                  bg-[#FF6A00]/20
                  blur-[40px]
                "
              />

            </div>

          </div>

        </div>

      </PageContainer>


      {/* ================= BOTTOM ORANGE LINE ================= */}

      <div
        className="
          h-px
          w-full
          bg-[#FF6A00]/60
          shadow-[0_0_8px_rgba(255,106,0,0.2)]
        "
      />

    </section>
  );
};

export default AboutUs;