import React, { useEffect, useState } from "react";
import Button from "../Components/Button";
import AOS from "aos";
import "aos/dist/aos.css";
import { useForm } from "react-hook-form";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import SocialMedia from "../Home/SocialMedia";
import { IoMdMail } from "react-icons/io";
import { MdLocationPin } from "react-icons/md";
import { LuPhoneCall } from "react-icons/lu";
import emailjs from "@emailjs/browser";

const ContactPage = () => {
  const [popup, setPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setLoading(true);

    emailjs
      .send(
        "service_bs2ofiq", // 👉 replace with your EmailJS service ID
        "template_2watukw", // 👉 replace with your EmailJS template ID
        data,
        "PGkFp8TEtPWxWmOMo" // 👉 replace with your EmailJS public key
      )
      .then(
        () => {
          setLoading(false);
          setPopup(true);
          reset();
        },
        (error) => {
          setLoading(false);
          console.error("FAILED...", error.text);
          alert("Something went wrong. Please try again later.");
        }
      );
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      <Head
        title="Contact Us"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/contact">
              Contact Us
            </Link>
          </>
        }
      />

      <div className="w-full bg-gray-50">
        {/* Contact Us Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2
            data-aos="flip-left"
            className="text-2xl md:text-4xl font-bold text-gray-900"
          >
           Get in Touch With Us
          </h2>
          <p
            data-aos="flip-left"
            data-aos-delay="200"
        className="text-gray-500 mt-3 text-sm text-justify md:text-center  md:text-base"
          >
           Have a question or need a custom quote? Our team is ready to help. Reach out now — we’ll respond within 24 hours with the answers and support you need.
          </p>

          {/* Contact Cards */}
          <div
            data-aos="flip-right"
            data-aos-delay="100"
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-gray-200 bg-white p-6"
          >
            {/* Email */}
            <div
              data-aos="flip-left"
              data-aos-delay="300"
              className="flex md:border-r border-gray-200 flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left"
            >
              <IoMdMail size={40} className="text-primary" />
              <p className="text-gray-900 text-sm md:text-base break-words">
                info@qtechx.com
              </p>
            </div>

            {/* Address */}
            <div
              data-aos="flip-left"
              data-aos-delay="500"
              className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left"
            >
              <MdLocationPin size={60} className="text-primary" />
              <p className="text-gray-800 text-sm md:text-base leading-relaxed">
                No.58 Vaitheeshwaran Nagar , Tirupattur - 635653
              </p>
            </div>

            {/* Phone */}
            <div
              data-aos="flip-right"
              data-aos-delay="700"
              className="flex md:border-l border-gray-200 flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left"
            >
              <LuPhoneCall size={40} className="text-primary ml-2" />
              <p className="text-gray-800 text-sm md:text-base">
                +91 9659133504
              </p>
            </div>
          </div>
        </div>

        {/* Get in Touch Form */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            data-aos="flip-right"
            data-aos-delay="200"
            className="bg-gray-300 shadow-lg rounded-3xl p-4 sm:p-8 lg:p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-6">
              Get In Touch
            </h2>

<form
  onSubmit={handleSubmit(onSubmit)}
  className="grid grid-cols-1 md:grid-cols-2 gap-6"
  noValidate
>
  {/* Name */}
  <div className="relative">
    <input
      type="text"
      {...register("name", { required: "Name is required" })}
      placeholder=" "
      className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
        errors.name ? "border-red-500" : "border-gray-300"
      } text-gray-900 focus:outline-none focus:border-primary peer`}
    />
    <span className="absolute left-3 top-1 text-gray-400 text-sm transition-all 
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
      Name <span className="text-red-500">*</span>
    </span>
    {errors.name && (
      <p className="absolute -bottom-5 left-1 text-red-500 text-xs">
        {errors.name.message}
      </p>
    )}
  </div>

  {/* Email */}
  <div className="relative">
    <input
      type="email"
      {...register("email", {
        required: "Email is required",
        pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
      })}
      placeholder=" "
      className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
        errors.email ? "border-red-500" : "border-gray-300"
      } text-gray-900 focus:outline-none focus:border-primary peer`}
    />
    <span className="absolute left-3 top-1 text-gray-400 text-sm transition-all 
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
      Email <span className="text-red-500">*</span>
    </span>
    {errors.email && (
      <p className="absolute -bottom-5 left-1 text-red-500 text-xs">
        {errors.email.message}
      </p>
    )}
  </div>

  {/* Mobile */}
  <div className="relative">
    <input
      type="tel"
      {...register("mobile", {
        required: "Mobile is required",
        pattern: { value: /^[0-9]{10}$/, message: "Enter 10 digit number" },
      })}
      placeholder=" "
      className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
        errors.mobile ? "border-red-500" : "border-gray-300"
      } text-gray-900 focus:outline-none focus:border-primary peer`}
    />
    <span className="absolute left-3 top-1 text-gray-400 text-sm transition-all 
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
      Mobile <span className="text-red-500">*</span>
    </span>
    {errors.mobile && (
      <p className="absolute -bottom-5 left-1 text-red-500 text-xs">
        {errors.mobile.message}
      </p>
    )}
  </div>

  {/* Subject */}
  <div className="relative">
    <input
      type="text"
      {...register("subject", { required: "Subject is required" })}
      placeholder=" "
      className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
        errors.subject ? "border-red-500" : "border-gray-300"
      } text-gray-900 focus:outline-none focus:border-primary peer`}
    />
    <span className="absolute left-3 top-1 text-gray-400 text-sm transition-all 
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
      Subject <span className="text-red-500">*</span>
    </span>
    {errors.subject && (
      <p className="absolute -bottom-5 left-1 text-red-500 text-xs">
        {errors.subject.message}
      </p>
    )}
  </div>

  {/* Message */}
  <div className="relative md:col-span-2">
    <textarea
      rows={4}
      {...register("message", { required: "Message is required" })}
      placeholder=" "
      className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
        errors.message ? "border-red-500" : "border-gray-300"
      } text-gray-900 focus:outline-none focus:border-primary peer`}
    ></textarea>
    <span className="absolute left-3 top-1 text-gray-400 text-sm transition-all 
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm 
      peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
      Message <span className="text-red-500">*</span>
    </span>
    {errors.message && (
      <p className="absolute -bottom-5 left-1 text-red-500 text-xs">
        {errors.message.message}
      </p>
    )}
  </div>

  <div className="md:col-span-2 flex justify-center">
    <Button type="submit">Send Your Request</Button>
  </div>
</form>


          </div>
        </div>

        {/* Popup */}
        {popup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
              <h3 className="text-lg font-semibold text-green-600 mb-3">
                ✅ Request Sent Successfully
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We have received your request. Our team will contact you soon.
              </p>
              <button
                onClick={() => setPopup(false)}
                className="px-6 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Google Map */}
        <div
          data-aos="zoom-in-up"
          className="w-full h-[300px] md:h-[400px] lg:h-[500px]"
        >
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3895.539575460426!2d78.57159557357998!3d12.48035352546114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bac5553a9ae4243%3A0xd877e8dc97cafac9!2sQ-Techx%20Solutions!5e0!3m2!1sen!2sin!4v1756791409418!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <SocialMedia />
    </>
  );
};

export default ContactPage;
