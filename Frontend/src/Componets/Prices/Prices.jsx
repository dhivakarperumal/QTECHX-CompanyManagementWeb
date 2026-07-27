import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import Head from "../Components/Head";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import SocialMedia from "../Home/SocialMedia";

const Prices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/Price.json");
        if (!response.ok) {
          throw new Error("Failed to fetch prices");
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-lg font-semibold text-gray-900">
        Loading prices...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        Error: {error}
      </div>
    );
  }

  return (
    <>
    <Head
        title="Our Prices"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">Home</Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/prices">Our Prices</Link>
          </>
        }
      />
    <div className=" max-w-7xl mx-auto px-5 sm:px-6 md:px-15 py-12">
      <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-center mb-10 sm:mb-12 text-gray-900">
       Transparent & Affordable Pricing
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-8 gap-y-7 md:gap-y-12">
        {items.map((plan, index) => (
          <div
            key={index}
            className="
              relative group rounded-2xl overflow-hidden
              bg-white text-gray-900 border border-primary
              transition-all duration-500 ease-out
              hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]
            "
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <div className="relative p-5 sm:p-6 md:p-8 flex flex-col h-full">
              {/* Plan Title */}
              <h3 className="text-xl sm:text-2xl md:text-2xl font-bold text-primary">
                {plan.plan_title}
              </h3>

              {/* Price */}
              <p className="text-2xl sm:text-3xl md:text-3xl font-extrabold mt-3 sm:mt-4">
                {plan.price}
              </p>

              {/* Audience */}
              <p className="text-xs sm:text-sm md:text-sm text-gray-500 italic mt-1">
                {plan.audience}
              </p>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-sm text-gray-700 mt-2 sm:mt-3">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="mt-4 sm:mt-6 space-y-2 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm md:text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                className="
                  mt-4 sm:mt-6 py-2 sm:py-3 w-full rounded-lg font-semibold
                  bg-primary text-white
                  transition-colors duration-500
                  hover:bg-gradient-to-r hover:from-gray-900 hover:to-primary
                  hover:text-white
                  cursor-pointer
                "
              >
                Get Started
              </button>
            </div>

            {/* Animated glowing lines */}
            <span className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[pulse_3s_infinite]"></span>
            <span className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent animate-[pulse_3s_infinite] delay-500"></span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[pulse_3s_infinite] delay-1000"></span>
            <span className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-primary to-transparent animate-[pulse_3s_infinite] delay-1500"></span>
          </div>
        ))}
      </div>
    </div>
    <SocialMedia/>
    </>
  );
};

export default Prices;
