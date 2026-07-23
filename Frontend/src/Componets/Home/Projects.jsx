// Projects.jsx
import React, { useEffect, useState } from "react";

import Slider from "react-slick";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProjectCard from "../Components/ProjectCard";

const Projects = () => {
  const items = [
    {
      id: 1,
      title: "E-Commerce Platform",
      category: "Web App",
      image: "/images/project1.png",
      description: "A full-featured online store with payment gateway integration."
    },
    {
      id: 2,
      title: "Fitness Tracker",
      category: "Mobile App",
      image: "/images/project2.png",
      description: "A mobile application to track daily workouts and nutrition."
    },
    {
      id: 3,
      title: "Corporate Dashboard",
      category: "Web App",
      image: "/images/project3.png",
      description: "Internal analytics dashboard for enterprise management."
    },
    {
      id: 4,
      title: "Real Estate Portal",
      category: "Website",
      image: "/images/project4.png",
      description: "Platform for buying and selling properties."
    }
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(2);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Extract unique categories
  const categories = ["All", ...new Set(items.map((p) => p.category))];

  // Filtered projects
  const filteredProjects =
    activeCategory === "All"
      ? items
      : items.filter((p) => p.category === activeCategory);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: window.innerWidth >= 768,
    nextArrow: (
      <button className="absolute top-1/2 right-[-15px] -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-primary shadow-md hover:bg-primary/80">
        <FiArrowRight className="text-primary text-xl" />{" "}
        {/* arrow color white */}
      </button>
    ),
    prevArrow: (
      <button className="absolute top-1/2 left-[-15px] -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-primary shadow-md hover:bg-primary/80">
        <FiArrowLeft className="text-primary text-xl" />{" "}
        {/* arrow color white */}
      </button>
    ),
  };

  return (
    <section className="py-16 bg-primary/10">
      <div className="px-6 md:px-20 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Left Side */}
        <div className="md:col-span-1">
          <p className="text-base uppercase tracking-widest font-semibold text-primary mb-2">
            Our Products
          </p>
          <h2 className=" text-2xl md:text-3xl font-bold leading-snug mb-6">
            Latest Projects <br /> From Our Team
          </h2>

          {/* Category list */}
          <ul className="space-y-3">
            {categories.map((cat, i) => (
              <li key={i}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left ${
                    activeCategory === cat
                      ? "text-primary font-semibold"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  → {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 relative">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {activeCategory === "All" ? "All Projects" : activeCategory}
          </h3>

          <Slider {...settings}>
  {filteredProjects.map((project, i) => (
    <div key={project.id} className="p-2 h-full">
      <ProjectCard project={project} aosDelay={i * 150} />
    </div>
  ))}
</Slider>
        </div>
      </div>
    </section>
  );
};

export default Projects;