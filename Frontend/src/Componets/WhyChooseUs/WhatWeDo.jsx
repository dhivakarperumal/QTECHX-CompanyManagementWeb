import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SocialMedia from "../Home/SocialMedia";
import Head from "../Components/Head";
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';

const WhatWeDo = () => {
  const features = [
    {
      img: "/WhyChooseUs/Idea To Implementation.jpg",
      title: "Idea To Implementation",
      desc: "Turning an idea into reality can feel challenging—but at Q-Techx Solutions, we make it achievable. We clearly define your concept, conduct market research, create a detailed plan, assemble a skilled team, and ensure effective communication and collaboration every step of the way.",
    },
    {
      img: "/WhyChooseUs/Design.jpg",
      title: "Design & Deploy Solution",
      desc: "By understanding our clients’ goals, needs, and challenges, we design and implement solutions using the latest technologies and industry best practices. Our team ensures minimal disruption to your business operations and provides ongoing support to guarantee long-term success.",
    },
    {
      img: "/WhyChooseUs/Consistency.jpg",
      title: "Consistency and Follow-Up",
      desc: "Delivering high-quality solutions consistently is at the heart of what we do. No matter the project’s size, we maintain attention to detail, superior customer service, and a commitment to excellence. This approach strengthens client relationships and fosters sustainable growth.",
    },
    {
      img: "/WhyChooseUs/Excellence.jpg",
      title: "Excellence and Quality",
      desc: "Every solution from Q-Techx Solutions undergoes rigorous quality checks—from planning through implementation. We believe excellence and quality are essential in today’s fast-paced IT landscape and are dedicated to delivering outstanding results at competitive prices.",
    },
    {
      img: "/WhyChooseUs/Strategic.jpg",
      title: "Strategic Approach",
      desc: "We take a holistic approach to strategy development, working closely with clients to understand their long-term objectives. Our strategies are continuously evaluated and refined to ensure they remain effective in helping clients achieve their goals.",
    },
    {
      img: "/WhyChooseUs/Business.jpg",
      title: "Business-Centric Solutions",
      desc: "We provide customized IT solutions for businesses of all sizes and industries. By understanding today’s dynamic market challenges, Q-Techx Solutions develops solutions tailored to each client’s unique needs, empowering them to thrive in the digital era.",
    },
  ];

  useEffect(() => {
    AOS.init({
      duration: 800, // animation duration
      once: false,   // 👈 false = animation runs every time (not just once)
    });
    AOS.refresh();   // 👈 ensures animations reset on refresh
  }, []);

  return (
    <>
     <Head
        title="What We Do"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">Home</Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/whatwedo">What We Do</Link>
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
            What We Do
          </h2>
          <p
            className="mt-4 text-gray-600 text-sm md:text-md   leading-[25px] max-w-3xl text-justify  mx-auto"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            With over 11 years of experience, Q-Techx Solutions has successfully delivered 300+ projects across various industries. We empower businesses with data-driven insights and innovative solutions that add real value, helping our clients achieve their goals efficiently and effectively.
          </p>

          {/* Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100} // 👈 stagger animation
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

export default WhatWeDo;
