import React, { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import aboutImg from "/images/about4.webp";
import SocialMedia from "../Home/SocialMedia";
// import Team from "./Team";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

const Counter = ({ end, suffix, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className="text-center px-6">
      <h3 className="text-4xl font-bold text-primary">
        {count}
        {suffix}
      </h3>
      <p className="text-gray-700 mt-2">{label}</p>
    </div>
  );
};

const About = () => {
  const [activeTab, setActiveTab] = useState("goal");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  const content = {
    mission:
      "To revolutionize businesses through smart, scalable IT solutions that simplify complexity, enhance performance, and fuel measurable growth. We aim to be a catalyst for digital transformation through innovation and integrity.",
    vision:
      "To be recognized as the most trusted global IT partner — empowering businesses with intelligent technology, setting industry standards for quality, security, and innovation, and redefining what digital success looks like.",
    goal: "At Q-Techx Solutions, our goal is to empower businesses to succeed in the digital era. We strive to deliver innovative, high-quality, and tailored IT solutions that drive growth, enhance efficiency, and create lasting value for our clients. By combining technology, creativity, and strategic insight, we aim to be a trusted partner in every client’s journey toward digital transformation and long-term success.",
  };

  const timeline = [
    {
      year: "2021",
      title: "Foundation",
      description:
        "M8 MEDIA of M8 groups was established in 2009. M8 MEDIA was registered as an online B2B and B2C platform, exclusively catering to the demands of the education sector.",
    },
    {
      year: "2022 ",
      title: "Growth & Expansion",
      description: "We expanded our services to include mobile app development, digital marketing, and advanced software solutions, delivering high-quality projects for a growing client base.",
    },
    {
      year: "2023",
      title: "Innovation & Expertise",
      description: "We strengthened our team, adopted modern technologies, and completed over 150 successful projects, building a reputation for reliability and innovation.",
    },
    {
      year: "2024",
      title: "Global Reach",
      description:"Q-Techx Solutions extended its services globally, empowering clients with end-to-end IT solutions and strategic digital transformation support.",
    },
    {
      year: "2025",
      title: "Continuous Excellence",
      description:"Today, we continue to deliver over 300 projects, focusing on innovation, quality, and customer success while fostering a skilled and motivated workforce.",
    },
  ];

  return (
    <>
      {/* --- About Section --- */}

      <Head
        title="ABOUT US"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/about">
              About Us
            </Link>
          </>
        }
      />
      <section
        className="bg-gray-100  py-16 px-4 sm:px-6 md:px-10  overflow-hidden text-justify md:text-center"
        data-aos="fade-down"
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className=" text-2xl md:text-4xl font-bold text-center text-primary mb-6"
            data-aos="zoom-in"
          >
           Empowering Your Business Through Next-Gen Tech
          </h2>
          <p
            className=" text-sm md:text-lg text-gray-600 text-justify  leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="300"
          >
          Q-Techx Solutions delivers cutting-edge IT solutions globally, from web and mobile apps to digital marketing and design. With 4+ years of experience and 40+ projects completed, we combine innovation, quality, and on-time delivery to help businesses thrive. Our expert teams, modern technologies, and client-focused approach ensure results that drive growth and lasting success.
          </p>
        </div>
      </section>

      {/* --- About Company Section --- */}
      <section className="py-16 px-4 sm:px-6 md:px-10 overflow-x-hidden bg-primary/10">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2" data-aos="fade-right">
            <img
              src={aboutImg}
              alt="About company"
              className="rounded-lg w-full h-auto"
            />
          </div>

          <div className="flex-1" data-aos="fade-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              About Our Company
            </h2>
            <div className="bg-gray-100 rounded-full p-2 flex gap-1 mb-6 w-fit">
              <button
                onClick={() => setActiveTab("mission")}
                className={`px-4 py-2 rounded-full text-sm md:text-md font-medium transition ${
                  activeTab === "mission" ? "text-primary" : "text-gray-600"
                }`}
              >
                ♦ Our Mission
              </button>
              <button
                onClick={() => setActiveTab("vision")}
                className={`px-4 py-2 rounded-full text-sm md:text-md font-medium transition ${
                  activeTab === "vision" ? "text-primary" : "text-gray-600"
                }`}
              >
                ♦ Our Vision
              </button>
              <button
                onClick={() => setActiveTab("goal")}
                className={`px-4 py-2 rounded-full text-sm md:text-md font-medium transition ${
                  activeTab === "goal" ? "text-primary" : "text-gray-600"
                }`}
              >
                ♦ Our Goal
              </button>
            </div>
            <p className="text-sm text-gray-600 text-justify h-[170px] md:h-[100px] leading-[25px]">
              {content[activeTab]}
            </p>
          </div>
        </div>
      </section>
      {/* <Team /> */}

      {/* --- Timeline Section --- */}
      <section className="bg-primary/5 py-16 px-4   overflow-x-hidden sm:px-6 md:px-10">
        <div className="max-w-6xl mx-auto text-center mb-12" data-aos="fade-up">
          <h2 className=" text-3xl md:text-4xl font-bold text-gray-900">
            Our Journey Started
          </h2>
          <p className="text-gray-600 mt-2">
            More than Top companies trust and choose M8
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full border-l border-primary"></div>

          {timeline.map((item, index) => (
            <div
              key={index}
              data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              data-aos-delay={index * 150}
              className={`mb-12 flex flex-col md:flex-row items-center w-full ${
                index % 2 === 0 ? "md:justify-start" : "md:justify-end"
              }`}
            >
              {index % 2 === 0 && (
                <div className="hidden md:block md:w-1/2 md:pr-10 text-right mb-4 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-primary">
                    {item.year}
                  </h3>
                </div>
              )}
              <div className="  hidden  relative z-10 md:flex items-center justify-center w-6    text-primary border border-primary shadow md:absolute md:left-1/2 md:transform md:-translate-x-1/2"></div>

             <div className="md:w-1/2 md:pl-10 mr-0 md:mr-10">
              <h3 className=" block md:hidden text-xl text-center font-bold mb-2 text-primary">
                     - {item.year}
                    </h3>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="block md:hidden mt-3 text-center">
                    
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm text-justify leading-[25px] mt-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {index % 2 !== 0 && (
                <div className="hidden md:block md:w-1/2 md:pl-10 text-left mt-4 md:mt-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-primary">
                    {item.year}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="py-16 bg-white  overflow-x-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:divide-x divide-gray-200 text-center">
          <div data-aos="zoom-in">
            <Counter end={5} suffix="+" label="Years Of Experience" />
          </div>
          <div data-aos="zoom-in" data-aos-delay="200">
            <Counter end={151} suffix="+" label="Completed Internship" />
          </div>
          <div data-aos="zoom-in" data-aos-delay="400">
            <Counter end={50} suffix="+" label="Happy Clients" />
          </div>
          <div data-aos="zoom-in" data-aos-delay="600">
            <Counter end={21} suffix="+" label="Completed Project" />
          </div>
        </div>
      </section>

      <SocialMedia />
    </>
  );
};

export default About;
