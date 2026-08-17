import React, { useState, useEffect } from "react";
import {
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaUsersCog,
  FaShoppingCart,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
} from "react-icons/fa";
import api from "../../api";
import { Link } from "react-router-dom";

const iconMap = {
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaSearch,
  FaMobileAlt,
  FaUsersCog,
  FaShoppingCart,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBullhorn,
};

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/services/public/all');
        if (!data.success) throw new Error(data.message || 'Failed to fetch services');
        const serviceList = Array.isArray(data.data) ? data.data : [];
        setServices(serviceList);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load services');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  return (
    <div className="overflow-x-hidden bg-primary/10 p-5">
      <h1 className="mb-6 text-center text-3xl font-bold">Our Services</h1>
      
      {loading && <p className="text-center">Loading services...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      
      {!loading && !error && services.length === 0 && (
        <p className="text-center">No services available</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon ? iconMap[service.icon] : null;

          return (
            <Link key={service.id} to={`/services/${service.id}`}>
              <div
                className="relative flex h-[380px] flex-col justify-evenly overflow-hidden rounded-xl bg-white p-6 text-black shadow transition hover:shadow-lg cursor-pointer"
              >
                <div className="absolute -bottom-24 right-1 h-35 w-35 rounded-full bg-[#ffb066] animate-bounce-bg" />
                <div className="absolute -top-12 right-1 h-25 w-25 rounded-full bg-[#ffb066] animate-bounce-bg" />
                <div className="absolute left-0 top-1/2 h-12 w-12 rounded-full bg-[#ffb066] animate-bounce-bg" />

                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                  <div className="flex-shrink-0">
                    {Icon ? (
                      <Icon className="h-17 w-17 text-gray-600" />
                    ) : service.singlepageimage && service.singlepageimage.length > 0 ? (
                      <img 
                        src={Array.isArray(service.singlepageimage) ? service.singlepageimage[0] : service.singlepageimage} 
                        alt={service.title} 
                        className="h-20 w-20 object-contain rounded-lg" 
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FaLaptopCode className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <h2 className="mb-2 w-full truncate text-base font-bold text-primary md:text-lg">
                    {service.title}
                  </h2>

                  <p className="text-justify text-sm leading-[22px] text-gray-700 line-clamp-6">
                    {service.description || service.short_description || ''}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Services;