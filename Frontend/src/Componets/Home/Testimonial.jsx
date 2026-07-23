import React, { useEffect } from "react";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Testimonial = () => {
  const reviews = [
    {
      name: "John Doe",
      role: "CEO, Tech Corp",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
      quote: "The service provided was exceptional. We saw a significant increase in our productivity and overall business growth."
    },
    {
      name: "Jane Smith",
      role: "Marketing Director",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
      quote: "Absolutely brilliant work. They delivered on time and exceeded all our expectations with their innovative solutions."
    },
    {
      name: "Robert Johnson",
      role: "Founder, Startup Inc",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
      quote: "Their team was highly professional and dedicated. I highly recommend them for any digital transformation needs."
    }
  ];

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <section className="relative py-20 bg-gray-50 overflow-hidden">
      <div
        className="absolute hidden md:block inset-0 bg-no-repeat bg-center bg-contain pointer-events-none animate-bounce-bg"
        style={{ backgroundImage: "url('/images/testimonialbackground.png')" }}
      ></div>

      <img
        src="/images/testimonialquote.png"
        alt="quote background"
        className="absolute opacity-100 w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
      />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center z-20 px-4 sm:px-6">
        <h5 className="text-primary uppercase tracking-widest text-sm sm:text-base">Testimonials</h5>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10">The Trust From Clients</h2>

        <Slider {...settings}>
          {reviews.map((review, idx) => (
            <div key={idx} className="px-4 sm:px-6">
              <p className="text-base  text-justify  md:text-center sm:text-lg mb-6 relative z-10 leading-relaxed">
                {review.quote}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-purple-500"
                />
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold">{review.name}</h4>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Testimonial;