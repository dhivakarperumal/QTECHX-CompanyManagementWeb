// import React, { useState, useEffect } from "react";
// import { FaPlay } from "react-icons/fa";
// import career from "/images/chouse.jpg";
// import Button from "../Components/Button";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import logo  from '/images/logo.png'

// const Careers = () => {
//     const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     AOS.init({
//       duration: 1000,
//       once: true,
//     });
//   }, []);

//   // Close modal + exit fullscreen
//   const closePopup = () => {
//     setIsOpen(false);
//     if (document.fullscreenElement) {
//       document.exitFullscreen();
//     }
//   };

  


//   return (
//     <section className="bg-gray-50 text-black py-16 px-6 md:px-15">
//       <div className="grid md:grid-cols-2 gap-10 items-center">
//         {/* Left Image with Play Button */}
//         <div className="relative" data-aos="flip-up">
//           <img
//             src={career}
//             alt="Career"
//             className="rounded-2xl shadow-lg w-full object-cover"
//           />
//           {/* Play button overlay */}
//           {/* <button className="absolute inset-0 flex items-center justify-center">
//             <div className="bg-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg">
//               <FaPlay className="text-primary ml-1" />
//             </div>
//           </button> */}

        
   
//       {/* Play button */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className="absolute inset-0 flex items-center justify-center"
//       >
//         <div className="bg-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg">
//           <FaPlay className="text-primary ml-1" />
//         </div>
//       </button>

//       {/* Popup */}
//      {/* Popup */}
// {isOpen && (
//   <div
//     className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
//     onClick={closePopup} // Close when clicking background
//   >
//     {/* Close button */}
//     <button
//       onClick={closePopup}
//       className="absolute top-4 right-6 text-white text-4xl z-50"
//     >
//       &times;
//     </button>

//     {/* Fullscreen video */}
//     <div
//       className="relative w-full h-full flex items-center justify-center"
//       onClick={(e) => e.stopPropagation()} // Prevent close when clicking video
//     >
//       <iframe
//         width="100%"
//         height="100%"
//         src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
//         title="Video player"
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//         allowFullScreen
//         className="w-full h-full"
//       ></iframe>
//     </div>
//   </div>
// )}

//         </div>

//         {/* Right Content */}
//      <div className="relative text-center md:text-left">
//   {/* Logo as background (watermark style) */}
//   <img
//   src={logo}
//   alt="Company Logo"
//   className="absolute top-1/2 left-1/2 w-60 md:w-90 opacity-10 -translate-x-1/2 -translate-y-1/2"
//   data-aos="flip-down"
//   data-aos-delay="50"
// />

//   {/* Content on top of logo */}
//   <div className="relative z-10">
//     {/* Heading */}
//     <h2
//       data-aos="flip-down"
//       data-aos-delay="100"
//       className=" text-xl md:text-3xl font-bold leading-snug mb-6"
//     >
//       {/* Together, we can create miracles! */}

//       Empowering <span className="text-primary"> Innovation </span>with Leading
//       Technologies.
//     </h2>

//     {/* Paragraphs */}
//     <p
//       data-aos="flip-down"
//       data-aos-delay="300"
//       className="text-gray-600 text-justify leading-[30px] mb-4"
//     >
//       Q-Techx Solutions, we stay ahead of the curve—combining deep industry expertise with the latest technologies to deliver secure, scalable, and innovative digital solutions across cloud, cybersecurity, software, and IT consulting.
//     </p>

//     {/* Button */}
//     <div data-aos="flip-down" data-aos-delay="900">
//       <Button>Start Your Career</Button>
//     </div>

//   </div>
// </div>

//       </div>
//     </section>
//   );
// };

// export default Careers;


import React, { useState, useEffect, useRef } from "react";
import { FaPlay } from "react-icons/fa";
import career from "/images/chouse.jpg";
import Button from "../Components/Button";
import AOS from "aos";
import "aos/dist/aos.css";
import logo from "/images/logo.png";

const Careers = () => {
  const [isOpen, setIsOpen] = useState(false);
  const videoContainerRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  // Open fullscreen when modal opens
  useEffect(() => {
    if (isOpen && videoContainerRef.current) {
      const el = videoContainerRef.current;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen(); // Safari
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen(); // IE/Edge
      }
    }
  }, [isOpen]);

  // Close popup + exit fullscreen
  const closePopup = () => {
    setIsOpen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <section className="bg-gray-50 text-black py-16 px-6 md:px-15">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left Image with Play Button */}
        <div className="relative" data-aos="flip-up">
          <img
            src={career}
            alt="Career"
            className="rounded-2xl shadow-lg w-full object-cover"
          />

          {/* Play button */}
          <button
            onClick={() => setIsOpen(true)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg">
              <FaPlay className="text-primary ml-1" />
            </div>
          </button>

          {/* Popup */}
          {isOpen && (
            <div
              ref={videoContainerRef}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black"
              onClick={closePopup} // click background closes
            >
              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-4 right-6 text-white text-4xl z-50"
              >
                &times;
              </button>

              {/* Video container (stops click bubbling) */}
              <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="relative text-center md:text-left">
          {/* Logo as background */}
          <img
            src={logo}
            alt="Company Logo"
            className="absolute top-1/2 left-1/2 w-60 md:w-90 opacity-10 -translate-x-1/2 -translate-y-1/2"
            data-aos="flip-down"
            data-aos-delay="50"
          />

          <div className="relative z-10">
            <h2
              data-aos="flip-down"
              data-aos-delay="100"
              className="text-xl md:text-3xl font-bold leading-snug mb-6"
            >
              Empowering <span className="text-primary"> Innovation </span>with
              Leading Technologies.
            </h2>

            <p
              data-aos="flip-down"
              data-aos-delay="300"
              className="text-gray-600 text-justify leading-[30px] mb-4"
            >
              Q-Techx Solutions, we stay ahead of the curve—combining deep
              industry expertise with the latest technologies to deliver secure,
              scalable, and innovative digital solutions across cloud,
              cybersecurity, software, and IT consulting.
            </p>

            <div data-aos="flip-down" data-aos-delay="900">
              <Button>Start Your Career</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
