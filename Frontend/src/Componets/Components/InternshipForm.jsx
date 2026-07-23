
import React, { useState } from "react";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import SocialMedia from "../Home/SocialMedia";
import Banner from '/images/Internship.jpg';
import { ImPointRight } from "react-icons/im";
import emailjs from '@emailjs/browser';

const InternshipForm = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    phone: "",
    collegeName: "",
    topic: "",
    duration: "",
    startDate: "",
    endDate: "",
    mode: "",
    noOfStudents: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.studentName.trim()) newErrors.studentName = "Student Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!formData.collegeName.trim()) newErrors.collegeName = "College Name is required";
    if (!formData.topic) newErrors.topic = "Please select a topic";
    if (!formData.duration.trim()) newErrors.duration = "Duration is required";
    // if (!formData.startDate) newErrors.startDate = "Start Date is required";
    // if (!formData.endDate) newErrors.endDate = "End Date is required";
    // ✅ Start Date Validation
  if (!formData.startDate) {
    newErrors.startDate = "Start Date is required";
  } else {
    const today = new Date().setHours(0, 0, 0, 0);
    if (new Date(formData.startDate) < today) {
      newErrors.startDate = "Start date cannot be in the past";
    }
  }

  // ✅ End Date Validation
  if (!formData.endDate) {
    newErrors.endDate = "End Date is required";
  } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
    newErrors.endDate = "End date cannot be before start date";
  }
    if (!formData.mode) newErrors.mode = "Please select mode (Online/Offline)";
    if (!formData.noOfStudents || formData.noOfStudents < 1) newErrors.noOfStudents = "No. of Students is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "noOfStudents") {
      setFormData({ ...formData, noOfStudents: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

const handleSubmit = (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  // Send email via EmailJS
  emailjs.send(
    "service_x83dt5m", // Replace with your EmailJS Service ID
    "template_nwi7sz9", // Replace with your EmailJS Template ID
    {
      student_name: formData.studentName,
      email: formData.email,
      phone: formData.phone,
      college_name: formData.collegeName,
      topic: formData.topic,
      duration: formData.duration,
      start_date: formData.startDate,
      end_date: formData.endDate,
      mode: formData.mode,
      no_of_students: formData.noOfStudents,
    },
    "AljJ9kLnaEMdIKloP" // Replace with your EmailJS Public Key
  )
  .then((result) => {
      console.log(result.text);
      setSubmitted(true);
      setFormData({
        studentName: "",
        email: "",
        phone: "",
        collegeName: "",
        topic: "",
        duration: "",
        startDate: "",
        endDate: "",
        mode: "",
        noOfStudents: "",
      });
      setErrors({});
      setTimeout(() => setSubmitted(false), 3000);
  }, (error) => {
      console.log(error.text);
      alert("Oops! Something went wrong, please try again.");
  });
};

  const inputClass = "bg-white w-full px-3 pt-5 pb-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:border-primary peer";
  const errorClass = "text-red-500 text-xs mt-1 min-h-[1rem]";

  return (
    <>
      <Head
        title="Internship Form"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">Home</Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/internship-form">Internship Form</Link>
          </>
        }
      />

       {/* Added Benefits Section */}
 
  
  

      <section className="bg-primary/5 min-h-screen flex items-center justify-center py-10 px-4 md:px-12">
      
        <div className="flex flex-col md:flex-row justify-center items-start md:items-center max-w-6xl w-full">

          {/* Left Image with Responsive Text Overlay */}
<div className="w-full md:w-1/2 h-[340px] md:h-[630px] relative overflow-hidden">
  {/* Background Image */}
  <img
    src={Banner}
    alt="Internship"
    className="w-full h-full object-cover shadow-lg"
  />

  {/* Black Overlay */}
  <div className="absolute inset-0 bg-black/60"></div>

  {/* Text Content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
      Why Choose Our Internship?
    </h2>

    <ul className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-100 text-left max-w-sm sm:max-w-md">
      <li className="flex items-start gap-2">
        <ImPointRight className="mt-1 text-primary text-lg sm:text-xl" />
        <span>
          <span className="font-semibold">Practical Learning</span> – Work on
          live projects, not just theory.
        </span>
      </li>

      <li className="flex items-start gap-2">
        <ImPointRight className="mt-1 text-primary text-lg sm:text-xl" />
        <span>
          <span className="font-semibold">Expert Mentorship</span> – Learn
          directly from experienced developers, designers, and digital
          marketers.
        </span>
      </li>

      <li className="flex items-start gap-2">
        <ImPointRight className="mt-1 text-primary text-lg sm:text-xl" />
        <span>
          <span className="font-semibold">Industry Exposure</span> – Gain
          insights into the latest tools, technologies, and workflows.
        </span>
      </li>

      <li className="flex items-start gap-2">
        <ImPointRight className="mt-1 text-primary text-lg sm:text-xl" />
        <span>
          <span className="font-semibold">Career Growth</span> – Build the
          skills, confidence, and portfolio you need to thrive in the IT world.
        </span>
      </li>
    </ul>
  </div>
</div>



          {/* Right Form */}
  <form
            className="w-full md:w-1/2 p-6 bg-gray-300 border border-gray-200 text-gray-900 shadow-lg "
            onSubmit={handleSubmit}
            noValidate
          >
            <p className="text-2xl font-semibold text-primary mb-4">
              Internship Form
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Student Name */}
              <label className="relative w-full">
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder=" "
                  className={`${inputClass} ${
                    errors.studentName ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:text-primary">
                  Student Name <span className="text-red-500">*</span>
                </span>
                <p className={errorClass}>{errors.studentName}</p>
              </label>

              {/* Email */}
              <label className="relative w-full">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className={`${inputClass} ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:text-primary">
                  Email <span className="text-red-500">*</span>
                </span>
                <p className={errorClass}>{errors.email}</p>
              </label>

              {/* Phone */}
              <label className="relative w-full">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                  className={`${inputClass} ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:text-primary">
                  Phone Number <span className="text-red-500">*</span>
                </span>
                <p className={errorClass}>{errors.phone}</p>
              </label>

              {/* College Name */}
              <label className="relative w-full">
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder=" "
                  className={`${inputClass} ${
                    errors.collegeName ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:text-primary">
                  College Name <span className="text-red-500">*</span>
                </span>
                <p className={errorClass}>{errors.collegeName}</p>
              </label>

              {/* Topic */}
              <label className="relative w-full">
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                  className={`${inputClass} peer ${
                    errors.topic ? "border-red-500" : ""
                  }`}
                >
                  <option value="" disabled hidden></option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Cloud Computing">Cloud Computing</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>

                <span
                  className="
                  absolute left-3 text-gray-400 text-sm
                  top-3.5
                  peer-focus:top-1 peer-valid:top-1
                  peer-focus:text-xs peer-valid:text-xs
                peer-focus:text-primary
                  transition-all duration-200
                "
                >
                  Select Internship Topic{" "}
                  <span className="text-red-500">*</span>
                </span>

                <p className={errorClass}>{errors.topic}</p>
              </label>

              {/* Duration */}
              <label className="relative w-full">
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder=" "
                  className={`${inputClass} ${
                    errors.duration ? "border-red-500" : ""
                  }`}
                />
                <span className="absolute left-3 top-1 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:text-primary">
                  Duration (e.g., 3 months){" "}
                  <span className="text-red-500">*</span>
                </span>
                <p className={errorClass}>{errors.duration}</p>
              </label>

              {/* Start Date */}
              {/* <label className="relative w-full">
                <span className="block text-gray-700 text-sm mb-1 ml-1">
                  Start Date <span className="text-red-500 ">*</span>
                </span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`${inputClass} ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                />
                <p className={errorClass}>{errors.startDate}</p>
              </label> */}

              {/* End Date */}
              {/* <label className="relative w-full">
                <span className="block text-gray-700 text-sm mb-1 ml-1">
                  End Date <span className="text-red-500 ">*</span>
                </span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`${inputClass} ${
                    errors.endDate ? "border-red-500" : ""
                  }`}
                />
                <p className={errorClass}>{errors.endDate}</p>
              </label> */}
              {/* Start Date */}
              <label className="relative w-full">
                <span className="block text-gray-700 text-sm mb-1 ml-1">
                  Start Date <span className="text-red-500 ">*</span>
                </span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${inputClass} ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                />
                <p className={errorClass}>{errors.startDate}</p>
              </label>

              {/* End Date */}
              <label className="relative w-full">
                <span className="block text-gray-700 text-sm mb-1 ml-1">
                  End Date <span className="text-red-500 ">*</span>
                </span>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split("T")[0]} 
                  className={`${inputClass} ${
                    errors.endDate ? "border-red-500" : ""
                  }`}
                />
                <p className={errorClass}>{errors.endDate}</p>
              </label>

              {/* No. of Students + Mode */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4 col-span-1 sm:col-span-2">
                <label className="relative flex-1 w-full">
                  <input
                    type="number"
                    name="noOfStudents"
                    value={formData.noOfStudents}
                    onChange={handleChange}
                    className={`${inputClass} ${
                      errors.noOfStudents ? "border-red-500" : ""
                    }`}
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:text-primary">
                    Number of Students <span className="text-red-500">*</span>
                  </span>
                  <p className={errorClass}>{errors.noOfStudents}</p>
                </label>

                <label className="relative flex-1 w-full">
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    required
                    className={`${inputClass} peer ${
                      errors.mode ? "border-red-500" : ""
                    } text-center`}
                  >
                    <option value="" disabled hidden></option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>

                  <span
                    className="
      pointer-events-none
      absolute left-3 text-gray-400 text-sm
      top-3.5
      peer-focus:top-1 peer-valid:top-1
      peer-focus:text-xs peer-valid:text-xs
      peer-focus:text-primary
      transition-all duration-200
    "
                  >
                    Select Mode <span className="text-red-500">*</span>
                  </span>

                  <p className={errorClass}>{errors.mode}</p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-center">
            <button
              type="submit"
              className="relative group mt-4  px-4 py-2 text-[15px] md:text-[17px] font-medium border border-primary rounded-full text-white overflow-hidden transition-colors duration-500 ease-out"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 group-hover:text-white">
                Submit
              </span>
              <span className="absolute inset-0 bg-primary scale-x-100 group-hover:-scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></span>
            </button>
            </div>

            {submitted && (
              <p className="text-green-600 text-sm mt-2">
                ✅ Internship Form submitted successfully!
              </p>
            )}
          </form>
          </div>
      </section>
      <SocialMedia />
     </>
   );
};

export default InternshipForm;




