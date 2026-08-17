// src/components/ProjectCard.jsx
import React, { useState } from "react";

const ProjectCard = ({ project, aosDelay = 0 }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      data-aos="flip-left"
      data-aos-delay={aosDelay}
      className="bg-white shadow-lg rounded overflow-hidden hover:shadow-2xl transition duration-300"
    >
      <a href={project.link} target="_blank" rel="noopener noreferrer">
        <div className="w-full h-50 p-2 shadow-md bg-gray-200 flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
      </a>

      {/* Content wrapper with padding */}
      <div className="p-4 md:p-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {project.title}
        </h3>
        <p className="uppercase text-primary font-medium text-sm mb-3">
          {project.category}
        </p>
        <p className="text-gray-600 text-sm text-justify leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Dynamic Features */}
        <div className="flex flex-col md:flex-row flex-wrap gap-2">
          {project.features?.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-md shadow-sm"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
