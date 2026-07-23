import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Button from "../Components/Button";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import SocialMedia from "../Home/SocialMedia";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ServiceSlider from "./ServiceSlider";


const ServiceDetails = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/Service.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading service details...</p>;
  if (error) return <p>Error: {error}</p>;

  const service = items.find((s) => s.id === parseInt(id));

  if (!service) return <p>Service not found</p>;

  const settings = {
    dots: false, // show navigation dots
    infinite: true, // infinite loop
    speed: 500, // slide transition speed in ms
    slidesToShow: 1, // how many slides to show
    slidesToScroll: 1, // how many slides to scroll
    arrows: true, // show arrows
    autoplay: true, // auto play
    autoplaySpeed: 3000, // delay between auto slides
  };

  return (
    <>
      <Head 
        title={
          <>
          <p className="text-xl truncate md:overflow-visible md:text-4xl md:w-auto w-80">
         {service.title}
         </p>
          </>
          }
        subtitle={
          <>
            <Link className=" text-md md:text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className=" text-md md:text-lg font-bold text-white mx-1" />
            <Link
              className=" text-md md:text-lg truncate md:overflow-visible w-70 md:w-auto font-semibold text-white"
              to={`/services/${service.id}`}
            >
              {service.title}
            </Link>
          </>
        }
      />
      <div className="px-6 py-10 md:px-20 bg-gradient-to-b from-blue-50 to-white">
        {/* Top section: Image + content side by side */}
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Animated Slider */}
          <div data-aos="zoom-in-up">
            {service.singlepageimage && service.singlepageimage.length > 0 ? (
              <ServiceSlider images={service.singlepageimage} />
            ) : (
              <p>No images available</p>
            )}
          </div>

          {/* Right: Short content */}
          <div data-aos="zoom-in-left">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 md:mb-4 text-primary ">
              Our Process
            </h2>
            {(() => {
              const text = service.detailed_description;
              const mid = Math.floor(text.length / 2);

              let splitIndex = text.indexOf(".", mid);
              if (splitIndex === -1) splitIndex = text.length;

              const firstHalf = text.substring(0, splitIndex + 1).trim();
              const secondHalf = text.substring(splitIndex + 1).trim();

              return (
                <>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify mb-4">
                    {firstHalf}
                  </p>
                  {secondHalf && (
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify">
                      {secondHalf}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-5 md:mt-12">
          {/* Left: Detailed Content */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-xl md:text-2xl font-semibold mb-2 text-primary ">
              {service.tagline}
            </h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed text-justify mb-6">
              {service.short_description}
            </p>

            {service.what_we_offer && (
              <div className="mb-6">
                <h3 className="text-xl md:texttext-2xl font-semibold mb-2 text-primary">
                  What We Offer
                </h3>
                <ul className="list-disc list-inside space-y-1 marker:text-primary text-gray-900 text-sm md:text-base">
                  {service.what_we_offer.map((offer, index) => (
                    <li key={index}>{offer}</li>
                  ))}
                </ul>
              </div>
            )}

            {service.technologies_we_use && (
              <div className="mb-0 md:mb-6">
                <h3 className="text-xl md:texttext-2xl font-semibold mb-4 text-primary ">
                  Technologies We Use
                </h3>
                <div className="flex flex-wrap gap-4">
                  {service.technologies_we_use.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs md:text-sm bg-gray-200 hover:bg-gray-300 cursor-default text-gray-900 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact Form */}
          <div
            data-aos="zoom-in-up"
            data-aos-delay="400"
            className="bg-primary/10 shadow-lg rounded-xl p-3 md:p-6"
          >
            <h3 className="text-xl md:texttext-2xl font-semibold mb-4 text-primary ">
              Send Us a Request
            </h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 border-b border-primary bg-white rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 border-b border-primary bg-white rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <input
                type="tel"
                placeholder="Your Mobile Number"
                className="w-full p-3 border-b border-primary bg-white rounded-lg focus:ring-1 focus:ring-primary outline-none"
              />
              <textarea
                placeholder="Your Message"
                rows="4"
                className="w-full p-3 border-b border-primary bg-white rounded-lg focus:ring-1 focus:ring-primary outline-none"
              ></textarea>
              <Button className="mx-auto block mb-2">Send Request</Button>
            </form>
          </div>
        </div>
      </div>
      <SocialMedia />
    </>
  );
};

export default ServiceDetails;
