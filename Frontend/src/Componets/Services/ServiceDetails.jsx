import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import Button from "../Components/Button";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import SocialMedia from "../Home/SocialMedia";
import api from "../../api";

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
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/services/public/${id}`);
        if (!data.success) throw new Error(data.message || 'Failed to fetch service');
        
        let serviceData = data.data;
        
        // Parse singlepageimage if it's stored as JSON string
        if (serviceData.singlepageimage) {
          if (typeof serviceData.singlepageimage === 'string') {
            try {
              serviceData.singlepageimage = JSON.parse(serviceData.singlepageimage);
            } catch (e) {
              // If parsing fails, ensure it's an array
              serviceData.singlepageimage = [serviceData.singlepageimage];
            }
          }
          if (!Array.isArray(serviceData.singlepageimage)) {
            serviceData.singlepageimage = [serviceData.singlepageimage];
          }
        } else {
          serviceData.singlepageimage = [];
        }
        
        // Parse other array fields if they're stored as JSON strings
        const arrayFields = ['what_we_offer', 'key_features', 'technologies_we_use', 'service_process', 'industries', 'project_type'];
        arrayFields.forEach(field => {
          if (serviceData[field] && typeof serviceData[field] === 'string') {
            try {
              serviceData[field] = JSON.parse(serviceData[field]);
            } catch (e) {
              serviceData[field] = [];
            }
          }
        });
        
        setService(serviceData);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading service details...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Error: {error}</p>;
  if (!service) return <p className="text-center py-10">Service not found</p>;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
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
            {service.singlepageimage && Array.isArray(service.singlepageimage) && service.singlepageimage.length > 0 ? (
              <ServiceSlider images={service.singlepageimage} />
            ) : (
              <div className="w-full h-[240px] md:h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
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
