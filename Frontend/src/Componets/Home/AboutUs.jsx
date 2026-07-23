import React, { useEffect } from "react";
import about from "/images/aboutvideo.jpg"; 
import { GiFamilyHouse, GiProgression } from "react-icons/gi";
import Button from "../Components/Button";
import { BsArrowRight } from "react-icons/bs";

// ✅ Import AOS
import AOS from "aos";
import "aos/dist/aos.css";

const AboutUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white px-6 py-12 md:py-24">
      {/* Mobile Heading */}
      <h2 
        className="block md:hidden text-3xl text-center font-bold text-gray-900 mb-8"
        data-aos="fade-up"
      >
        About Us
      </h2>

      <div className="w-full max-w-7xl mx-auto px-2 lg:px-16 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <div className="order-2 md:order-1">
          <h2 
            className="hidden md:block text-4xl font-bold text-gray-900 mb-6"
            data-aos="flip-right"
          >
            About Us
          </h2>
          <p 
            className="text-gray-600 leading-relaxed mb-6 text-justify"
            data-aos="flip-right" 
            data-aos-delay="200"
          >
           At Q-Techx Solutions, we don’t just build software — we create intelligent digital experiences that transform the way businesses operate. Whether you're a startup or an enterprise, we deliver tailor-made IT solutions that accelerate growth, optimize performance, and future-proof your business. Backed by a team of innovative thinkers and skilled developers, we ensure 24/7 support, rapid delivery, and uncompromising quality across every project.
          </p>

          {/* Stats */}
          <div 
            className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-8"
            data-aos="flip-left"
            data-aos-delay="400"
          >
            <div className="flex items-center gap-3">
              <GiFamilyHouse size={40} className="text-primary/80"/>
              <div>
                <h3 className="text-xl font-bold">5+ Years</h3>
                <p className="text-sm text-gray-500">Industry Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GiProgression size={40} className="text-primary/80" />
              <div>
                <h3 className="text-xl font-bold">21+ Projects</h3>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>

          <div data-aos="flip-left" data-aos-delay="600" className="flex  items-center">
            <Button>Read More  <BsArrowRight/></Button>
          </div>
        </div>

        {/* Right Image */}
        <div 
          className="relative order-1 md:order-2 w-full flex justify-center md:justify-end"
          data-aos="flip-left"
        >
          {/* Decorative Circle only on md+ */}
          <div
            className="
              hidden md:block
              absolute
              w-24 h-24
              -right-10 bottom-6
              bg-primary/60
              rounded-full
              z-0
              animate-floating
            "
          ></div>

          {/* Main Image */}
          <img
            src={about}
            alt="About Us"
            className="relative rounded-2xl shadow-lg w-full max-w-md md:max-w-full object-cover z-10"
          />
        </div>

      </div>
    </section>
  );
};

export default AboutUs;
