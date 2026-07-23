
import { useEffect } from "react";
import Button from "../Components/Button";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";


function EventBanner() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration
      once: true, // whether animation should happen only once
      offset: 100, // offset (in px) from the original trigger point
    });
  }, []);

  return (
    <div
      className="relative bg-[url(images/student.jpg)] bg-cover bg-center md:bg-top  w-full  h-[320px] md:h-[380px]  flex items-center justify-center"
      
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-white text-center px-2 md:px-4">
        <h1 
         data-aos="fade-up"
          data-aos-delay="400"
        className="text-3xl md:text-4xl font-bold mb-4">
          Student  <span className="text-primary">Event</span> Booking
        </h1>

        {/* Event Content */}
        <p
          data-aos="fade-up"
          data-aos-delay="600"
          className="mb-2  text-md md:text-lg  text-justify md:text-center"
        >
          Join us for an exciting series of workshops, seminars, and activities
          designed exclusively for students.
        </p> 
        
        {/* Button */}
          <Link
            to="/form"
            className="inline-block mt-5 bg-primary rounded-3xl  font-semibold px-4 py-2 transition-all duration-700 text-white hover:bg-white hover:text-primary "
            data-aos="zoom-in"
            data-aos-delay="800"
          >
           Book Now
          </Link>
      </div>
    </div>
  );
}

export default EventBanner;
