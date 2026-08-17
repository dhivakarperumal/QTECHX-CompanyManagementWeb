import React, { useEffect, useState } from "react";
import {
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaUsersCog,
  FaShoppingCart,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
} from "react-icons/fa";

import api from "../../api";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import PageContainer from "../CommonComponents/PageContainer";

const iconMap = {
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaUsersCog,
  FaShoppingCart,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
};

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      offset: 80,
    });

    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get("/services/public/all");

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch services"
          );
        }

        const serviceList = Array.isArray(data.data)
          ? data.data
          : [];

        setServices(serviceList);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load services"
        );

        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#03070a] py-16 sm:py-20 lg:py-24">

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[140px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,106,0,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,106,0,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* ================= CONTENT ================= */}

      <PageContainer className="relative z-10">

        {/* Section heading */}
        <div
          data-aos="fade-up"
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#FF6A00] sm:text-sm">
            WHAT WE DO
          </p>

          <h2 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
            OUR{" "}
            <span className="text-[#FF6A00]">
              SERVICES
            </span>
          </h2>

        </div>

        {/* ================= STATES ================= */}

        {loading && (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#FF6A00]" />

              <p className="text-sm text-white/50">
                Loading services...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-red-400">
              Error: {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          services.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
              <p className="text-white/50">
                No services available
              </p>
            </div>
          )}

        {/* ================= SERVICE CARDS ================= */}

        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {services.map((service, index) => {
                const Icon = service.icon
                  ? iconMap[service.icon]
                  : null;

                return (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    data-aos="fade-up"
                    data-aos-delay={index * 70}
                    className="group"
                  >
                    <article
                      className="
                        relative
                        flex
                        min-h-[320px]
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-[#0b0f12]
                        p-6
                        transition-all
                        duration-500
                        hover:-translate-y-2
                        hover:border-[#FF6A00]/40
                        hover:bg-[#0e1215]
                        hover:shadow-[0_20px_50px_rgba(255,106,0,0.12)]
                      "
                    >

                      {/* Orange corner glow */}
                      <div
                        className="
                          pointer-events-none
                          absolute
                          -right-16
                          -top-16
                          h-40
                          w-40
                          rounded-full
                          bg-[#FF6A00]/10
                          blur-3xl
                          transition-all
                          duration-500
                          group-hover:bg-[#FF6A00]/20
                        "
                      />

                      {/* Orange top line */}
                      <div
                        className="
                          absolute
                          left-6
                          right-6
                          top-0
                          h-px
                          bg-gradient-to-r
                          from-transparent
                          via-[#FF6A00]/0
                          to-transparent
                          transition-all
                          duration-500
                          group-hover:via-[#FF6A00]
                        "
                      />

                      {/* Icon */}
                      <div className="relative z-10 mb-7">

                        <div
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-[#FF6A00]/20
                            bg-[#FF6A00]/10
                            transition-all
                            duration-500
                            group-hover:border-[#FF6A00]
                            group-hover:bg-[#FF6A00]
                            group-hover:shadow-[0_0_25px_rgba(255,106,0,0.25)]
                          "
                        >
                          {Icon ? (
                            <Icon
                              className="
                                text-xl
                                text-[#FF6A00]
                                transition-colors
                                duration-300
                                group-hover:text-black
                              "
                            />
                          ) : service.singlepageimage &&
                            service.singlepageimage.length > 0 ? (
                            <img
                              src={
                                Array.isArray(
                                  service.singlepageimage
                                )
                                  ? service.singlepageimage[0]
                                  : service.singlepageimage
                              }
                              alt={service.title}
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <FaLaptopCode className="text-xl text-[#FF6A00]" />
                          )}
                        </div>

                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-1 flex-col">

                        <h3
                          className="
                            mb-3
                            text-lg
                            font-bold
                            uppercase
                            leading-tight
                            text-white
                            transition-colors
                            duration-300
                            group-hover:text-[#FF6A00]
                          "
                        >
                          {service.title}
                        </h3>

                        <p
                          className="
                            line-clamp-5
                            text-sm
                            leading-6
                            text-white/50
                            transition-colors
                            duration-300
                            group-hover:text-white/65
                          "
                        >
                          {service.description ||
                            service.short_description ||
                            ""}
                        </p>

                        {/* Bottom link */}
                        <div className="mt-auto flex items-center justify-between pt-6">

                          <span className="text-xs font-bold uppercase tracking-wider text-white/30 transition-colors duration-300 group-hover:text-white/60">
                            Explore Service
                          </span>

                          <span
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-white/10
                              text-sm
                              text-[#FF6A00]
                              transition-all
                              duration-300
                              group-hover:translate-x-1
                              group-hover:border-[#FF6A00]
                              group-hover:bg-[#FF6A00]
                              group-hover:text-black
                            "
                          >
                            →
                          </span>

                        </div>

                      </div>

                    </article>
                  </Link>
                );
              })}

            </div>
          )}

      </PageContainer>

    </section>
  );
}

export default Services;