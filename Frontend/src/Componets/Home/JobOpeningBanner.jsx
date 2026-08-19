import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiBriefcase, FiUsers, FiZap } from "react-icons/fi";
import PageContainer from "../CommonComponents/PageContainer";

const JobOpeningBanner = () => {
    return (
        <section className="relative w-full overflow-hidden border-y border-[#FF6A00]/20 bg-[#050505]">

            {/* ================= BACKGROUND IMAGE ================= */}
            <div
                className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
                style={{
                    backgroundImage:
                        "url('/images/jobopening.png')",
                }}
            />

            {/* Light dark overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Very light orange/black gradient */}
            <div
                className="
    absolute
    inset-0
    bg-gradient-to-r
    from-black/45
    via-black/15
    to-transparent
  "
            />
            {/* ================= CONTENT ================= */}
            <PageContainer>
                <div className="relative z-10 flex min-h-[260px] items-center py-10 sm:min-h-[280px]  md:min-h-[300px] ">

                    <div className="max-w-xl">

                        {/* Eyebrow */}
                        <div className="mb-3 flex items-center gap-2">
                            <span className="h-[2px] w-7 bg-[#FF6A00]" />

                            <span
                                className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-[#FF6A00]
                sm:text-xs
              "
                            >
                                CAREER OPPORTUNITIES
                            </span>
                        </div>

                        {/* Heading */}
                        <h2
                            className="
              text-2xl
              font-bold
              uppercase
              leading-[1.05]
              tracking-tight
              text-white
              sm:text-3xl
              md:text-4xl
              lg:text-[2.7rem]
            "
                        >
                            BUILD YOUR
                            <span className="block text-[#FF6A00]">
                                FUTURE WITH US
                            </span>
                        </h2>

                        {/* Description */}
                        <p
                            className="
              mt-3
              max-w-lg
              text-xs
              leading-5
              text-white/70
              sm:text-sm
              sm:leading-6
            "
                        >
                            Join our passionate team and work on innovative digital
                            solutions that shape the future of technology.
                        </p>

                        {/* ================= BUTTONS ================= */}

                        <div className="mt-5 flex flex-wrap items-center gap-3">

                            <Link
                                to="/career"
                                className="
                group
                inline-flex
                items-center
                gap-3
                rounded-lg
                bg-[#FF6A00]
                px-5
                py-2
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-white
                shadow-[0_8px_25px_rgba(255,106,0,0.25)]
                transition-all
                duration-300
                hover:bg-[#ff7618]
                hover:shadow-[0_10px_30px_rgba(255,106,0,0.4)]
                active:scale-95
                sm:px-5
                sm:py-2
              "
                            >
                                <span>View Openings</span>

                                <span
                                    className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/70
                  transition-all
                  duration-300
                  group-hover:translate-x-1
                  group-hover:bg-white
                  group-hover:text-[#FF6A00]
                "
                                >
                                    <FiArrowRight size={13} />
                                </span>
                            </Link>

                            <Link
                                to="/contact"
                                className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                border
                border-white/20
                bg-white/[0.04]
                px-5
                py-2
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-white/80
                backdrop-blur-sm
                transition-all
                duration-300
                hover:border-[#FF6A00]/60
                hover:bg-[#FF6A00]/10
                hover:text-white
                sm:px-6
                sm:py-3
              "
                            >
                                Contact Us
                            </Link>

                        </div>
                    </div>


                </div>
            </PageContainer>
            {/* ================= TOP ORANGE LINE ================= */}

            <div className="absolute left-0 right-0 top-0 h-px bg-white/30" />

        </section>
    );
};

export default JobOpeningBanner;