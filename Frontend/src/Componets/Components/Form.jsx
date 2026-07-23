
import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import SocialMedia from "../Home/SocialMedia";

const Form = () => {
  const [formData, setFormData] = useState({
    collegeName: "",
    collegeEmail: "",
    phone: "",
    event: "",
    message: "",
    selectedDate: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.collegeName)
      newErrors.collegeName = "College Name is required";
    if (!formData.collegeEmail) {
      newErrors.collegeEmail = "College Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.collegeEmail)) {
      newErrors.collegeEmail = "Enter a valid email";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone Number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    if (!formData.event) newErrors.event = "Please select an event";
    if (!formData.selectedDate) newErrors.selectedDate = "Please select a date";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error while typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    emailjs
      .send(
        "service_bs2ofiq",
        "template_3ij4d07",
        formData,
        "PGkFp8TEtPWxWmOMo"
      )
      .then(
        () => {
          setSubmitted(true);
          setFormData({
            collegeName: "",
            collegeEmail: "",
            phone: "",
            event: "",
            message: "",
            selectedDate: "",
          });
          setErrors({});

          setTimeout(() => {
            setSubmitted(false);
          }, 3000);
        },
        (error) => {
          console.error("FAILED...", error.text);
        }
      );
  };

  return (
    <>
    <Head
        title="Book Now"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/form">
              Book Now
            </Link>
          </>
        }
      />
    <section className="bg-primary/5 pt-3  pb-3">
      <div className="flex min-h-screen">
        {/* Left Image Section */}
        <div className="relative w-1/2 hidden md:flex items-center justify-center p-20">
          {/* Top image */}
          <img
            src="/images/eventform.jpg"
            alt="Top Image"
            className="absolute opacity-80 top-20 left-20 w-100 h-100 object-cover rounded-xl shadow-lg z-20"
          />
          {/* Bottom image */}
          <img
            src="/images/eventform1.jpg"
            alt="Bottom Image"
            className="absolute top-50 left-70 w-90 h-90 object-cover rounded-xl shadow-lg z-10"
          />
        </div>

        {/* Right Form Section */}
        <div className="flex w-full md:w-1/2 justify-center items-center p-4 md:p-6">
          <form
            className="flex flex-col gap-4 w-full max-w-md p-3 md:p-6 rounded-2xl bg-gray-300 border border-gray-200 text-gray-900 shadow-lg"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Title */}
            <p className="text-2xl font-semibold text-primary relative pl-8 flex items-center">
              Register
             
            </p>

            {/* College Name */}
            <label className="relative mb-2">
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder=" "
                className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                  errors.collegeName ? "border-red-500" : "border-gray-300"
                } text-gray-900 focus:outline-none focus:border-primary peer`}
              />
              <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
                College Name <span className="text-red-500">*</span>
              </span>
              {errors.collegeName && (
                <p className="text-red-500 text-xs mt-1 absolute">
                  {errors.collegeName}
                </p>
              )}
            </label>

            {/* College Email */}
            <label className="relative mb-2">
              <input
                type="email"
                name="collegeEmail"
                value={formData.collegeEmail}
                onChange={handleChange}
                placeholder=" "
                className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                  errors.collegeEmail ? "border-red-500" : "border-gray-300"
                } text-gray-900 focus:outline-none focus:border-primary peer`}
              />
              <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
                College Mail ID (Official){" "}
                <span className="text-red-500">*</span>
              </span>
              {errors.collegeEmail && (
                <p className="text-red-500 text-xs mt-1 absolute">
                  {errors.collegeEmail}
                </p>
              )}
            </label>

            {/* Phone Number */}
            <label className="relative mb-2">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" "
                className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } text-gray-900 focus:outline-none focus:border-primary peer`}
              />
              <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
                Phone Number (Official) <span className="text-red-500">*</span>
              </span>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 absolute">
                  {errors.phone}
                </p>
              )}
            </label>

            {/* Event Dropdown */}
            <label className="relative mb-2">
              <select
                name="event"
                value={formData.event}
                onChange={handleChange}
                className={`bg-white w-full px-3 py-2 rounded-lg border ${
                  errors.event ? "border-red-500" : "border-gray-300"
                } text-gray-900 focus:outline-none focus:border-primary`}
              >
                <option value="" disabled hidden>
                  Select Event
                </option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="internship">Internship</option>
              </select>
              {errors.event && (
                <p className="text-red-500 text-xs mt-1 absolute">
                  {errors.event}
                </p>
              )}
            </label>

            {/* Date Field */}
<label className="relative mb-2">
  <input
    type="date"
    name="selectedDate"
    value={formData.selectedDate || ""}
    onChange={handleChange}
    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
    className={`bg-white w-full px-3 pt-5 pb-2 rounded-lg border ${
      errors.selectedDate ? "border-red-500" : "border-gray-300"
    } text-gray-900 focus:outline-none focus:border-primary peer`}
  />
  <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
    Select Date <span className="text-red-500">*</span>
  </span>
  <p className="text-red-500 text-xs mt-1 min-h-[1rem]">{errors.selectedDate}</p>
</label>

            {/* Message Box */}
            <label className="relative mb-2">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder=" "
                rows={4}
                className="bg-white w-full px-3 pt-3 pb-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:border-primary peer"
              ></textarea>
              <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary">
                Message
              </span>
            </label>

        
            <div className="flex justify-center">
            <button
            type="submit"
            className="
              relative group
              mb-2
              px-4 py-2
              text-[15px] md:text-[17px] font-medium
              border border-primary
              rounded-full
              text-white
              overflow-hidden
              cursor-pointer
              transition-colors duration-800 ease-out
            "
          >
            {/* Text */}
            <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-800 group-hover:text-primary">
              Submit
            </span>

            {/* Full background hover effect */}
            <span
              className="
                absolute inset-0
                bg-primary
                scale-x-100 group-hover:-scale-x-100
                origin-left
                transition-transform duration-500 ease-out
                z-0
              "
            ></span>
          </button>
          </div>

            
            {submitted && (
              <p
                className={`text-green-600 text-sm mt-2 transition-opacity duration-500 ${
                  submitted ? "opacity-100" : "opacity-0"
                }`}
              >
                ✅ Form submitted successfully!
              </p>
            )}
          </form>
        </div>
      </div>
    </section>

    <SocialMedia/>
    </>
  );
};

export default Form;