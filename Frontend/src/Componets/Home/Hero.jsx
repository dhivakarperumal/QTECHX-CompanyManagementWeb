import React, { useEffect } from "react";
// import heroImg from "/images/heroimage.png";
import heroImg from "/images/About_1.png"; 
import rocketImg from "/images/icon_3.png"; 

import Button from "../Components/Button";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const Hero = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration in ms
      once: true,     // run only once
    });
  }, []);
  return (
    <section className="relative mt-10 bg-gradient-to-r from-[#f9f9ff] to-[#eef2ff] py-16 px-6 md:px-20">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        
        <div data-aos="fade-down" className="md:w-1/2  text-left">
          <h1 className="text-3xl md:text-5xl font-semibold  leading-normal md:leading-[70px]">
            Smart Ideas <br />
           Powerful Software <br />
            <span className="text-primary ">Real Results.</span>
          </h1>
          <p className="text-gray-600 text-justify  mt-2 mb-5 max-w-lg">
           At Q-Techx Solutions, we specialize in crafting powerful software, scalable cloud systems, and user-focused digital platforms that fuel innovation and accelerate business growth.
          </p>
          <Link to="/career" className=""><Button>Explore Q-TechX</Button></Link>
        </div>

        {/* Right Image */}
        <div data-aos="fade-up" className="md:w-1/2 relative mt-10 md:mt-0 flex justify-center">
          <div className="relative ">
            <img
              src={heroImg}
              alt="Hero Person"
              className=" w-full h-full"
            />
            {/* Decorative rocket */}
            <img
              src={rocketImg}
              alt="Rocket"
              className="absolute top-7 right-2 w-30 md:w-50  animate-bounce [animation-duration:5s]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
