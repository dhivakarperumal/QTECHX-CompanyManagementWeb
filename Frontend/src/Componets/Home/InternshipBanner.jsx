import React, { useEffect } from "react";
import { FaUserGraduate } from "react-icons/fa";
import { PiGraduationCapFill } from "react-icons/pi";
import heroImg from "/images/Internship.png";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

const InternshipBanner = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  return (
    <section className="bg-primary/10 py-10 px-6 md:px-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left Image + Stats */}
      
      <div
  className="relative w-full md:w-1/2 flex justify-center items-center"
  data-aos="fade-right"
  data-aos-duration="1200"
  data-aos-delay="400"
>
  {/* Responsive Image */}
  <img
    src={heroImg}
    alt="Student"
    className="w-full max-w-[500px] h-auto object-contain relative"
  />

  {/* Top Stat Card */}
  <div
    className="absolute top-2 left-2 md:left-0 bg-white shadow-lg rounded-xl p-2 flex items-center gap-3"
    data-aos="zoom-in"
    data-aos-duration="1000"
    data-aos-delay="600"
  >
    <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full 
                    w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 
                    text-lg md:text-xl lg:text-2xl">
      <FaUserGraduate />
    </div>
    <div>
      <p className="text-xs md:text-sm text-gray-600">Total Students</p>
      <p className="text-base md:text-lg lg:text-xl font-bold">40k+</p>
    </div>
  </div>

  {/* Bottom Stat Card */}
  <div
    className="absolute bottom-2 left-2 md:left-10 bg-white shadow-lg rounded-xl p-2 flex items-center gap-3"
    data-aos="zoom-in"
    data-aos-duration="1000"
    data-aos-delay="800"
  >
    <div className="flex items-center justify-center bg-primary/20 text-primary rounded-full 
                    w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 
                    text-lg md:text-xl lg:text-2xl">
      <PiGraduationCapFill />
    </div>
    <div>
      <p className="text-xs md:text-sm text-gray-600">Total Courses</p>
      <p className="text-base md:text-md lg:text-xl font-bold">10+</p>
    </div>
  </div>
</div>



        {/* Right Content */}
        <div className="w-full md:w-1/2">
          <h2
            className="text-lg md:text-2xl font-bold text-primary leading-snug"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="400"
          >
            Join Q-Techx Solutions Internship Program today and turn your
            passion into profession
          </h2>

          <p
            className="mt-4 text-gray-700 text-justify leading-relaxed"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="600"
          >
            At Q-Techx Solutions, we believe internships are more than just
            training—they’re your first step into a successful career. Our
            internship program is designed to provide students and fresh
            graduates with real-world experience, hands-on learning, and
            guidance from industry experts.
          </p>

          <p
            className="mt-6 text-xl font-semibold text-primary/80"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="800"
          >
            Apply Now <br /> and Start Your Journey with Us!
          </p>

          <Link
            to="/internshipform"
            className="mt-6 inline-block px-6 py-3 bg-primary text-white font-medium rounded-full cursor-pointer transition hover:bg-primary/90"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-delay="1000"
          >
            Apply Now
          </Link>
        </div>
      </div>

      {/* Decorative Curve Line */}
      <div
        className="absolute bottom-0 right-0 w-72 h-72 border-t-4 border-primary/80 rounded-full translate-y-16 translate-x-12"
        data-aos="fade-down"
        data-aos-duration="1200"
        data-aos-delay="1200"
      ></div>
    </section>
  );
};

export default InternshipBanner;

