import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SocialMedia from "../Home/SocialMedia";
import Head from "../Components/Head";
import { IoIosArrowForward } from 'react-icons/io';
import { Link } from 'react-router-dom';

const categories = [
  { title: "Cryptocurrency Exchange", image: "/WhyChooseUs/Cryptocurrency Exchange.png" },
  { title: "Financial Technologies", image: "/WhyChooseUs/Financial Technologies.png" },
  { title: "Retail & E-commerce", image: "/WhyChooseUs/ecommerce.png" },
  { title: "Healthcare / Telemedicine", image: "/WhyChooseUs/health.png" },
  { title: "On-demand services", image: "/WhyChooseUs/demand services.png" },
  { title: "Entertainment", image: "/WhyChooseUs/entertainment.png" },
  { title: "Education", image: "/WhyChooseUs/education.png" },
  { title: "Logistics", image: "/WhyChooseUs/logistic.png" },
  { title: "Food Industries", image: "/WhyChooseUs/food.png" },
  { title: "Public Sectors", image: "/WhyChooseUs/sector.png" },
  { title: "Travel and Transport", image: "/WhyChooseUs/transport.webp" },
  { title: "Media & Publishing", image: "/WhyChooseUs/Media.png" },
];

const WhoWeWorkWith = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
    AOS.refresh();
  }, []);

  return (
    <>
     <Head
        title="Who We Work With"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">Home</Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/whoweworkwith">Who We Work With</Link>
          </>
        }
      />
    <section className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Top Section */}
        <h2
          className=" text-2xl md:text-4xl font-extrabold text-gray-900 mb-6"
          data-aos="fade-down"
        >
          Who We Work With
        </h2>

        <p
          className=" text-sm md:text-md text-gray-600 max-w-3xl text-justify  mx-auto leading-[25px] mb-12"
          data-aos="fade-down"
          data-aos-delay="200"
        >
          At Q-Techx Solutions, we partner with businesses that are committed to growth and innovation. Our clients often invest in new capabilities, integrate acquisitions, and modernize their IT systems—and we provide end-to-end solutions to help them achieve these goals efficiently and effectively.
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {categories.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md  p-6 flex flex-col items-center text-center transition-all duration-500 hover:shadow-xl "
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 object-contain"
              />
              <h3 className="text-base font-semibold mt-3 text-gray-900">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
    <SocialMedia/>
    </>
  );
};

export default WhoWeWorkWith;
