import React from "react";
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
  FaBullhorn,
} from "react-icons/fa";

const services = [
  {
    id: 1,
    title: "Web Development",
    short_description: "We build modern and responsive websites tailored to your needs.",
    image: "FaLaptopCode",
  },
  {
    id: 2,
    title: "Mobile App Development",
    short_description: "Native and cross-platform mobile applications for iOS and Android.",
    image: "FaMobileAlt",
  },
  {
    id: 3,
    title: "UI/UX Design",
    short_description: "Beautiful and intuitive user interfaces that engage your audience.",
    image: "FaPaintBrush",
  },
  {
    id: 4,
    title: "Digital Marketing",
    short_description: "Result-driven marketing strategies to grow your business online.",
    image: "FaBullhorn",
  },
];

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
  return (
    <div className="overflow-x-hidden bg-primary/10 p-5">
      <h1 className="mb-6 text-center text-3xl font-bold">Our Services</h1>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = iconMap[service.image];

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4 }}
              className="relative flex h-[380px] flex-col justify-evenly overflow-hidden rounded-xl bg-white p-6 text-black shadow transition hover:shadow-lg"
            >
              <motion.div
                className="absolute -bottom-24 right-1 h-35 w-35 rounded-full bg-[#ffb066]"
                animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -top-12 right-1 h-25 w-25 rounded-full bg-[#ffb066]"
                animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-0 top-1/2 h-12 w-12 rounded-full bg-[#ffb066]"
                animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
                transition={{ duration: 7, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />

              <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                <div className="flex-shrink-0">
                  {Icon ? (
                    <Icon className="h-17 w-17 text-gray-600" />
                  ) : (
                    <img src={service.icon} alt={service.title} className="h-20 w-20 object-contain" />
                  )}
                </div>

                <h2 className="mb-2 w-full truncate text-base font-bold text-primary md:text-lg">
                  {service.title}
                </h2>

                <p className="text-justify text-sm leading-[22px] text-gray-700 line-clamp-6">
                  {service.short_description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default Services;