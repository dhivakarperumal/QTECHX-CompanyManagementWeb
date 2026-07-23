import React, { useEffect,useState } from "react";

import AOS from "aos";
import "aos/dist/aos.css";
import Head from "../Components/Head";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import SocialMedia from "../Home/SocialMedia";
import ProjectCard from "../Components/ProjectCard";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/Project.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
      
    AOS.init({ duration: 1200, easing: "ease-in-out", once: true });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "E-Commerce", "Education", "Website", "Web Application"];


  const filteredProjects =
  selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category === selectedCategory);


  if (loading) {
    return <p className="text-center text-gray-500">Loading projects...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <>
     <Head
        title="Our Projects"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">Home</Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/projects">Our Projects</Link>
          </>
        }
      />
    <div className="bg-primary/10 py-12 px-6 md:px-12 lg:px-13">
      <h2
        data-aos="zoom-in"
        className="text-3xl md:text-4xl font-bold text-center mb-6"
      >
        Our Recent Projects
      </h2>
      <p
        data-aos="zoom-in"
        data-aos-delay="200"
        className=" text-justify md:text-center text-gray-600 max-w-2xl mx-auto mb-12"
      >
       Discover how we've empowered startups and enterprises with innovative,
scalable, and secure digital solutions.
      </p>



<div
  data-aos="zoom-in"
  data-aos-delay="200"
  className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 md:mb-10"
>
  {categories.map((cat) => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className={`relative group overflow-hidden
                  px-3 py-1 cursor-pointer text-xs sm:text-sm md:px-5 md:py-2 md:text-base 
                  rounded-full font-medium transition-all
                  ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-gray-700 hover:text-white"
                  }`}
    >
      {/* Text */}
      <span className="relative z-10">{cat}</span>

      {/* Circle fill effect (hover only for non-selected) */}
      <span
        className={`absolute w-[20em] h-[20em] -left-25 top-1/2 -translate-y-1/2 rounded-full 
                    transition-[box-shadow] duration-700 ease-out z-0
                    ${
                      selectedCategory === cat
                        ? "shadow-[inset_0_0_0_10em_#F8740E]" // always filled if selected
                        : "group-hover:shadow-[inset_0_0_0_10em_#F8740E]" // hover fill
                    }`}
      ></span>
    </button>
  ))}
</div>



      <div className="grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
  {filteredProjects.map((project, i) => (
    <ProjectCard key={project.id} project={project} aosDelay={i * 150} />
  ))}
</div>
    </div>
    {/* <SocialMedia/> */}
    </>
  );
};

export default ProjectPage;