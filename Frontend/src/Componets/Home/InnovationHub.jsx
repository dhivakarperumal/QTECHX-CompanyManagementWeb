import React from "react";
import {
    FiCpu,
    FiZap,
    FiTarget,
    FiTrendingUp,
} from "react-icons/fi";
import SectionTitle from "../CommonComponents/SectionTitle";

const InnovationHub = () => {
    const items = [
        {
            icon: FiCpu,
            title: "Technology",
            description: "Modern tools & solutions",
        },
        {
            icon: FiZap,
            title: "Innovation",
            description: "Ideas that create impact",
        },
        {
            icon: FiTarget,
            title: "Strategy",
            description: "Focused digital direction",
        },
        {
            icon: FiTrendingUp,
            title: "Growth",
            description: "Built for long-term success",
        },
    ];

    return (
        <section className="relative w-full overflow-hidden bg-[#050505] py-10 sm:py-12">

            {/* Subtle background glow */}
            <div className="pointer-events-none absolute left-1/4 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[#FF6A00]/10 blur-[100px]" />

            <div className="pointer-events-none absolute right-1/4 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[#FF6A00]/5 blur-[90px]" />

            {/* Top line */}
            <div className="absolute left-0 right-0 top-0 h-px bg-white/15" />

            <div className="relative z-10 mx-auto max-w-6xl px-5">

                {/* ================= SECTION TITLE ================= */}

                <SectionTitle
                    subtitle="INNOVATION HUB"
                    title="TECHNOLOGY MEETS"
                    highlight="INNOVATION"
                    className="mb-7"
                />

                {/* ================= FOUR ITEMS ================= */}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">

                    {items.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="
    group
    relative
    overflow-hidden
    rounded-xl
    border
    border-[#FF6A00]/50
    bg-[#151d22]
    px-4
    py-4
    text-center
    backdrop-blur-sm
    shadow-[0_10px_25px_rgba(255,106,0,0.10)]
    transition-all
    duration-300
    hover:-translate-y-1
    hover:border-[#FF6A00]/70
    hover:shadow-[0_14px_30px_rgba(255,106,0,0.16)]
  "
                            >
                                {/* ================= ORANGE TOP ACCENT ================= */}

                                <div
                                    className="
      absolute
      left-1/2
      top-0
      h-[2px]
      w-16
      -translate-x-1/2
      bg-[#FF6A00]
    "
                                />

                                {/* ================= ICON ================= */}

                                <div
                                    className="
      mx-auto
      mb-2.5
      flex
      h-9
      w-9
      items-center
      justify-center
      rounded-lg
      border
      border-[#FF6A00]
      bg-[#FF6A00]
      text-white
      shadow-[0_0_14px_rgba(255,106,0,0.20)]
    "
                                >
                                    <Icon size={17} />
                                </div>

                                {/* ================= TITLE ================= */}

                                <h3
                                    className="
      text-sm
      font-bold
      uppercase
      tracking-wide
      text-[#FF6A00]
    "
                                >
                                    {item.title}
                                </h3>

                                {/* ================= DESCRIPTION ================= */}

                                <p
                                    className="
      mt-1
      text-[10px]
      leading-4
      text-white/55
    "
                                >
                                    {item.description}
                                </p>

                                {/* ================= BOTTOM GLOW ================= */}

                                <div
                                    className="
      pointer-events-none
      absolute
      -bottom-8
      left-1/2
      h-16
      w-16
      -translate-x-1/2
      rounded-full
      bg-[#FF6A00]/15
      blur-[25px]
    "
                                />
                            </div>
                        );
                    })}

                </div>

            </div>

            {/* Bottom line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

        </section>
    );
};

export default InnovationHub;