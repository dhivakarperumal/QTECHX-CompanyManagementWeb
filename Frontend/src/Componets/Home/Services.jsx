// src/components/ServiceList.jsx
import React, { useEffect, useState } from "react";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
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
  FaBullhorn 
} from "react-icons/fa";

function Services() {

  const iconMap = {
  FaCode: FaCode,
  FaLaptopCode: FaLaptopCode,
  FaPaintBrush: FaPaintBrush,
  FaSearch: FaSearch,
  FaMobileAlt: FaMobileAlt,
  FaUsersCog: FaUsersCog,
  FaShoppingCart: FaShoppingCart,
  FaUserGraduate: FaUserGraduate,
  FaChalkboardTeacher: FaChalkboardTeacher,
  FaBullhorn: FaBullhorn,
};
 

  const items = [
    {
      id: 1,
      title: "Web Development",
      short_description: "We build modern and responsive websites tailored to your needs.",
      image: "FaLaptopCode"
    },
    {
      id: 2,
      title: "Mobile App Development",
      short_description: "Native and cross-platform mobile applications for iOS and Android.",
      image: "FaMobileAlt"
    },
    {
      id: 3,
      title: "UI/UX Design",
      short_description: "Beautiful and intuitive user interfaces that engage your audience.",
      image: "FaPaintBrush"
    },
    {
      id: 4,
      title: "Digital Marketing",
      short_description: "Result-driven marketing strategies to grow your business online.",
      image: "FaBullhorn"
    }
  ];

  const [slidesToShow, setSlidesToShow] = useState(3);

  // ✅ Update slidesToShow dynamically (like Speciality.jsx)
  useEffect(() => {
    const updateSlides = () => {
      if (window.innerWidth <= 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth <= 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    updateSlides(); // run on first load
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  // ✅ slick settings (dynamic slidesToShow)
  const settings = {
    infinite: true,
    speed: 800,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
     arrows: false,
    pauseOnHover: true,
  };

  return (
    <div className="p-5 bg-primary/10  overflow-x-hidden">
      <h1 className="text-center text-3xl font-bold mb-4">Our Services</h1>
      <Slider {...settings}>
        {items.map((service) => (
          
       <div key={service.id} className="p-3">
  <div className="relative group w-full  h-[380px] md:h-[360px] rounded-xl overflow-hidden bg-white text-black p-6 flex flex-col justify-evenly shadow hover:shadow-lg transition">
  

  {/* Big Circle */}
      <motion.div
        className="absolute w-35 h-35 rounded-full bg-[#ffb066] right-1 -bottom-24"
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Small Circle */}
      {/* <motion.div
        className="absolute w-8 h-8 rounded-full bg-primary/80 right-12 bottom-12"
        animate={{
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      /> */}

      {/* Medium Circle */}
      <motion.div
        className="absolute w-25 h-25 rounded-full bg-[#ffb066] right-1 -top-12"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Left Circle */}
      <motion.div
        className="absolute w-12 h-12 rounded-full bg-[#ffb066] left-0 top-1/2"
        animate={{
          x: [0, 25, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

    
    {/* Foreground content */}
<div className="relative z-10 flex flex-col items-center text-center gap-4">
  {/* Icon */}
  <div className="flex-shrink-0">
    {iconMap[service.image] ? (
      React.createElement(iconMap[service.image], {
        className: "w-17 h-17 text-gray-600",
      })
    ) : (
      <img
        src={service.icon}
        alt={service.title}
        className="w-20 h-20 object-contain"
      />
    )}
  </div>

  {/* Title */}
  <h2 className="text-base text-primary md:text-lg font-bold truncate w-72 mb-2">
    {service.title}
  </h2>

  {/* Description */}
  <p className="text-sm text-gray-700 text-justify leading-[22px] line-clamp-6">
    {service.short_description}
  </p>
</div>

  </div>
</div>


        ))}
      </Slider>
    </div>
  );
}

export default Services;