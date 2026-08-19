import React, { useState, useEffect } from "react";
import { FiStar } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";

import SliderLib from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import api from "../../api";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

const Slider = SliderLib.default ? SliderLib.default : SliderLib;

const Testimonial = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================================================
     FETCH REVIEWS
  ========================================================== */

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(
          "/reviews/public/approved"
        );

        if (
          data.success &&
          Array.isArray(data.data)
        ) {
          const transformedReviews = data.data.map(
            (review) => ({
              name:
                review.customer_name ||
                "Anonymous",

              role:
                review.product_name ||
                "Client",

              image:
                "https://randomuser.me/api/portraits/men/1.jpg",

              quote:
                review.review || "",

              title:
                review.review_title || "",

              rating:
                review.rating || 5,
            })
          );

          setReviews(transformedReviews);
        } else {
          setError("No reviews found");
        }

        setLoading(false);
      } catch (err) {
        setError(
          err.message ||
            "Failed to fetch reviews"
        );

        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  /* =========================================================
     SLIDER SETTINGS
  ========================================================== */

  const testimonialSettings = {
    dots: false,
    arrows: false,

    infinite: reviews.length > 5,

    speed: 700,

    slidesToShow: 5,
    slidesToScroll: 1,

    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,

    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
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
          BACKGROUND ORANGE GLOW
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
          left-8
          top-10
          hidden
          grid-cols-4
          gap-2
          opacity-70
          md:grid
        "
      >
        {Array.from({ length: 24 }).map(
          (_, index) => (
            <span
              key={index}
              className="
                h-[3px]
                w-[3px]
                rounded-full
                bg-[#FF6A00]
              "
            />
          )
        )}
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div
          className="
            relative
            z-10
            flex
            min-h-[400px]
            items-center
            justify-center
          "
        >
          <div className="text-center">

            <div
              className="
                mx-auto
                mb-4
                h-9
                w-9
                animate-spin
                rounded-full
                border-2
                border-white/10
                border-t-[#FF6A00]
              "
            />

            <p className="text-sm text-white/50">
              Loading reviews...
            </p>

          </div>
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && !loading && (
        <div
          className="
            relative
            z-10
            flex
            min-h-[400px]
            items-center
            justify-center
            px-6
          "
        >
          <p
            className="
              text-center
              text-sm
              font-semibold
              text-red-400
            "
          >
            Error: {error}
          </p>
        </div>
      )}

      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!loading &&
        !error &&
        reviews.length === 0 && (
          <div
            className="
              relative
              z-10
              flex
              min-h-[400px]
              items-center
              justify-center
            "
          >
            <p
              className="
                text-center
                text-sm
                font-semibold
                text-white/40
              "
            >
              No reviews available yet.
            </p>
          </div>
        )}

      {/* =====================================================
          TESTIMONIAL CONTENT
      ====================================================== */}

      {!loading &&
        !error &&
        reviews.length > 0 && (
          <PageContainer className="relative z-10">

            <div
              className="
                py-9
                sm:py-11
                lg:py-12
              "
            >

              {/* =================================================
                  SECTION HEADING
              ================================================== */}

              <SectionTitle
                subtitle="TESTIMONIALS"
                title="TRUST FROM"
                highlight="CLIENTS"
                description="Hear what our clients have to say about their experience working with Q-Techx Solutions."
                className="mb-7 sm:mb-9"
              />

              {/* =================================================
                  BACKGROUND QUOTE
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  -translate-x-1/2
                  -translate-y-1/2
                  text-[#FF6A00]/[0.035]
                "
              >
                <FaQuoteLeft size={260} />
              </div>

              {/* =================================================
                  TESTIMONIAL SLIDER
              ================================================== */}

              <div
                className="
                  relative
                  z-10
                  -mx-1
                "
              >

                <Slider {...testimonialSettings}>

                  {reviews.map(
                    (review, index) => (
                      <div
                        key={index}
                        className="
                          px-1.5
                          pb-4
                        "
                      >

                        {/* =====================================
                            CARD
                        ====================================== */}

                        <div
                          className="
                            group
                            relative
                            mx-auto
                            min-h-[245px]
                            w-full
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[#FF6A00]/35
                            bg-[#151c21]
                            p-4
                            shadow-[0_12px_30px_rgba(0,0,0,0.75)]
                            transition-all
                            duration-500

                            hover:-translate-y-1
                            hover:border-[#FF6A00]
                            hover:bg-[#192127]
                            hover:shadow-[0_18px_40px_rgba(0,0,0,0.85),0_0_28px_rgba(255,106,0,0.18)]

                            sm:p-5
                          "
                        >

                          {/* =================================
                              TOP ORANGE LINE
                          ================================== */}

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

                          {/* =================================
                              QUOTE ICON
                          ================================== */}

                          <div
                            className="
                              mb-3
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-[#FF6A00]/30
                              bg-[#FF6A00]/10
                              text-[#FF6A00]
                            "
                          >
                            <FaQuoteLeft size={13} />
                          </div>

                          {/* =================================
                              RATING
                          ================================== */}

                          <div
                            className="
                              mb-2
                              flex
                              gap-1
                            "
                          >
                            {Array.from({
                              length: 5,
                            }).map(
                              (_, starIndex) => (
                                <FiStar
                                  key={
                                    starIndex
                                  }
                                  size={11}
                                  className={
                                    starIndex <
                                    review.rating
                                      ? "fill-[#FF6A00] text-[#FF6A00]"
                                      : "text-white/15"
                                  }
                                />
                              )
                            )}
                          </div>

                          {/* =================================
                              TITLE
                          ================================== */}

                          {review.title && (
                            <h3
                              className="
                                mb-2
                                truncate
                                text-xs
                                font-bold
                                text-white
                              "
                            >
                              {review.title}
                            </h3>
                          )}

                          {/* =================================
                              REVIEW
                          ================================== */}

                          <p
                            className="
                              mb-4
                              line-clamp-3
                              min-h-[58px]
                              text-[11px]
                              leading-5
                              text-white/60
                            "
                          >
                            "{review.quote}"
                          </p>

                          {/* =================================
                              DIVIDER
                          ================================== */}

                          <div
                            className="
                              mb-4
                              h-px
                              bg-white/10
                            "
                          />

                          {/* =================================
                              CLIENT
                          ================================== */}

                          <div
                            className="
                              flex
                              items-center
                              gap-2.5
                            "
                          >

                            <img
                              src={review.image}
                              alt={review.name}
                              className="
                                h-8
                                w-8
                                shrink-0
                                rounded-full
                                border-2
                                border-[#FF6A00]/50
                                object-cover
                              "
                            />

                            <div className="min-w-0">

                              <h4
                                className="
                                  truncate
                                  text-[11px]
                                  font-bold
                                  text-white
                                "
                              >
                                {review.name}
                              </h4>

                              <p
                                className="
                                  truncate
                                  text-[8px]
                                  uppercase
                                  tracking-wide
                                  text-[#FF6A00]
                                "
                              >
                                {review.role}
                              </p>

                            </div>

                          </div>

                          {/* =================================
                              BOTTOM GLOW
                          ================================== */}

                          <div
                            className="
                              pointer-events-none
                              absolute
                              -bottom-10
                              right-0
                              h-24
                              w-24
                              rounded-full
                              bg-[#FF6A00]/5
                              blur-[35px]
                              transition-all
                              duration-500
                              group-hover:bg-[#FF6A00]/15
                            "
                          />

                        </div>

                      </div>
                    )
                  )}

                </Slider>

              </div>

            </div>

          </PageContainer>
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

export default Testimonial;