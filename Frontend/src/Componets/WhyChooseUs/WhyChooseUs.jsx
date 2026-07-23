import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SocialMedia from "../Home/SocialMedia";
import Head from "../Components/Head";
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';

const WhyChooseUs = () => {
  const features = [
    {
      img: "/WhyChooseUs/CustomerExperience.jpg",
      title: "Customer Experience",
      desc: "At Q-Techx Solutions, we put customers first. Every interaction with our products and services is designed to leave a positive impression, ensuring seamless usability and long-term satisfaction.",
    },
    {
      img: "/WhyChooseUs/Unique Services.jpg",
      title: "Unique Services",
      desc: "We understand that every business is different. That’s why we craft tailored digital solutions that align with your goals, highlight your strengths, and help maximize revenue growth.",
    },
    {
      img: "/WhyChooseUs/Enterprise Modernization.jpg",
      title: "Enterprise Modernization",
      desc: "Our team helps organizations upgrade and modernize their technologies to stay ahead in the digital era. We leverage the latest tools and frameworks to ensure your business runs smarter, faster, and more efficiently.",
    },
    {
      img: "/WhyChooseUs/On-Time Project Delivery.jpg",
      title: "On-Time Project Delivery",
      desc: "We value your time. Our project managers streamline workflows, guide our expert teams, and ensure your project is delivered on schedule—without compromising on quality.",
    },
    {
      img: "/WhyChooseUs/Better HR Process.jpg",
      title: "Better HR Process",
      desc: "At Q-Techx Solutions, we believe strong teams build strong businesses. We follow a fast and efficient onboarding process, and our Customer Relationship Supervisors continuously track performance to maintain excellence.",
    },
    {
      img: "/WhyChooseUs/Specialized Teams.jpg",
      title: "Specialized Teams",
      desc: "Our skilled professionals bring years of IT outsourcing experience. By joining forces with us, you gain a team that is not only ready to work but also dedicated to continuous learning and innovation.",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 800, // animation duration
      once: false,   // ✅ false = replay animations on scroll/refresh
    });
    AOS.refresh();   // ✅ re-checks elements after refresh
  }, []);

  return (
    <>
    <Head
        title="Why Choose Us"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">Home</Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/whychooseus">Why Choose Us</Link>
          </>
        }
      />
      <section className="bg-gray-50 py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          {/* Title */}
          <h2
            className="text-2xl md:text-4xl font-bold text-gray-900"
            data-aos="fade-down"
          >
            Why Choose Us
          </h2>
          <p
            className="mt-4 text-gray-600 max-w-3xl text-sm text-justify  leading-[25px] mx-auto"
            data-aos="fade-right"
            data-aos-delay="200"
          >
           At Q-Techx Solutions, our solutions are cutting-edge and delivered on time. We leverage innovative processes and advanced technologies to achieve customer-focused results. With years of experience across diverse industries, we’ve seen it all—and know exactly how to make your project a success.
          </p>

          {/* Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100} // stagger animation
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Image Wrapper */}
                <div className="overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-60 object-cover cursor-pointer transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-6 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-[23px] text-justify text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SocialMedia />
    </>
  );
};

export default WhyChooseUs;
