

import React, { useEffect } from "react";
import { BsArrowRight } from "react-icons/bs";
import aboutImg from "/images/Contactimg.svg"; // replace with your image path
import Button from "../Components/Button";
import AOS from "aos";
import "aos/dist/aos.css";
import Logo from "/images/logo.png";
import { motion } from "framer-motion"; 

const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-16 px-6 md:px-12 lg:px-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* Left Content */}
        <div data-aos="flip-up" className="space-y-6">
          <p
            data-aos="flip-up"
            data-aos-delay="200"
            className="text-primary font-semibold uppercase tracking-widest underline underline-offset-4"
          >
            Why Choose Us
          </p>
          <h2
            data-aos="flip-up"
            data-aos-delay="400"
            className="text-2xl md:text-4xl font-bold text-gray-900 leading-snug"
          >
            We’re Q-TechX Solutions
          </h2>
          <p
            data-aos="flip-up"
            data-aos-delay="600"
            className="text-gray-600 text-justify  leading-relaxed"
          >
           At Q-Techx Solutions, we take your business beyond limits. As a full-service IT partner, we provide end-to-end solutions that drive innovation, improve efficiency, and accelerate growth. Our team delivers reliable technology, creative strategies, and expert support to keep your business ahead in today’s competitive digital world.
          </p>

          {/* Button */}
          <div
            data-aos="flip-up"
            data-aos-delay="800"
            className="flex items-center"
          >
            <Button>
              Explore More <BsArrowRight />
            </Button>
          </div>
        </div>

        {/* Right Image Section */}
        <div
          data-aos="zoom-out-up"
          className="relative flex  w-full justify-center md:justify-end items-center"
        >


          <motion.img
            src={Logo}
            alt="Q-TechX Logo"
            className="absolute w-28 md:w-40 lg:w-44 top-5 md:top-11 left-5 md:left-12 opacity-80"
            animate={{ y: [0, -15, 0] }}   // moves up and down
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Main Illustration */}
          <img
            src={aboutImg}
            alt="About Us"
            className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-contain z-10"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
