import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Methodology = () => {
    useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const items = [
    {
      image: "/images/branding.png",
      title: "Branding",
      description:
        "At Q-Techx Solutions, we build brands that stand out. From logos to complete strategies, we craft identities that connect with your audience and inspire lasting trust.",
    },
    {
      image: "/images/marketing.png",
      title: "Marketing",
      description:
        "We blend creativity with data to grow your business. From SEO to social media, our campaigns drive visibility, engagement, and real results.",
    },
    {
      image: "/images/development.png",
      title: "Development",
      description:
        "We create scalable, secure, and user-friendly websites, apps, and software. Our solutions help you innovate, streamline, and grow in the digital world.",
    },
  ];

  return (
    <section className="py-16 bg-primary/10">
      <div className="px-6 md:px-20">
        {/* Main Heading */}
        <h2 data-aos="zoom-in-up" className="text-2xl text-gray-900 md:text-4xl font-bold text-center mb-12">
          Our Methodology
        </h2>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-10 text-center">
          {items.map((item, index) => (
            <div
              key={index}
              data-aos="zoom-in-up"
              data-aos-delay={index * 200}
              className="flex flex-col items-center p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="w-40 md:w-50 h-40 md:h-50 flex items-center justify-center mb-6">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">{item.title}</h3>

              {/* Description */}
              <p className="text-gray-600 text-sm text-justify leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Methodology;
