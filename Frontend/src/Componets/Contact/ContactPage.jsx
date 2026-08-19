import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useForm } from "react-hook-form";
import Head from "../Components/Head";
import { IoIosArrowForward, IoMdMail } from "react-icons/io";
import { MdLocationPin } from "react-icons/md";
import { LuPhoneCall } from "react-icons/lu";
import { FiSend, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
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
        "service_bs2ofiq", // 👉 EmailJS service ID
        "template_2watukw", // 👉 EmailJS template ID
        data,
        "PGkFp8TEtPWxWmOMo" // 👉 EmailJS public key
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
      {/* ── HERO BANNER (PRESERVED) ── */}
      <Head
        title="Contact Us"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/contact">
              Contact Us
            </Link>
          </>
        }
      />

      {/* ── MAIN CONTENT (BLACK & ORANGE THEME) ── */}
      <div className="relative w-full overflow-hidden bg-[#03070a] text-white">
        {/* Top Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-40 h-72 w-72 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

        {/* Cyberpunk Grid Texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,106,0,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,106,0,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "70px 70px",
          }}
        />

        {/* Decorative Orange Dots */}
        <div className="pointer-events-none absolute right-8 top-12 hidden grid-cols-4 gap-2 opacity-70 md:grid">
          {Array.from({ length: 24 }).map((_, index) => (
            <span
              key={index}
              className="h-[3px] w-[3px] rounded-full bg-[#FF6A00]"
            />
          ))}
        </div>

        <PageContainer className="relative z-10 py-12 sm:py-16 md:py-20">
          {/* Section Header */}
          <div className="mx-auto max-w-3xl text-center">
            <p
              data-aos="fade-down"
              className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs md:text-sm"
            >
              CONNECT WITH US
            </p>

            <h2
              data-aos="zoom-in"
              className="hero-font text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.2rem]"
            >
              GET IN TOUCH <span className="text-[#FF6A00]">WITH US</span>
            </h2>

            <div
              data-aos="fade-up"
              className="mx-auto mt-3 h-[2px] w-14 bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.5)]"
            />

            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="mx-auto mt-4 text-justify text-xs leading-[25px] text-white/70 sm:text-sm sm:text-center md:text-base"
            >
              Have a question or need a custom quote? Our team is ready to help. Reach out now —
              we’ll respond within 24 hours with the answers and support you need.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
          >
            {/* Email */}
            <div
              className="
                group
                relative
                flex
                flex-col
                items-center
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                from-[#171d22]
                via-[#11171c]
                to-[#0d1216]
                p-7
                text-center
                shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(255,106,0,0.06)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#FF6A00]/50
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.18)]
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-500 group-hover:scale-x-100" />
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#FF6A00]/50 group-hover:bg-[#FF6A00]/10">
                <IoMdMail size={32} />
              </div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Email Address
              </p>
              <p className="break-all text-sm font-semibold text-white group-hover:text-[#FF6A00] transition-colors md:text-base">
                info@qtechx.com
              </p>
            </div>

            {/* Address */}
            <div
              className="
                group
                relative
                flex
                flex-col
                items-center
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                from-[#171d22]
                via-[#11171c]
                to-[#0d1216]
                p-7
                text-center
                shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(255,106,0,0.06)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#FF6A00]/50
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.18)]
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-500 group-hover:scale-x-100" />
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#FF6A00]/50 group-hover:bg-[#FF6A00]/10">
                <MdLocationPin size={36} />
              </div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Office Location
              </p>
              <p className="text-xs font-semibold leading-relaxed text-white group-hover:text-[#FF6A00] transition-colors sm:text-sm md:text-base">
                No.58 Vaitheeshwaran Nagar, Tirupattur - 635653
              </p>
            </div>

            {/* Phone */}
            <div
              className="
                group
                relative
                flex
                flex-col
                items-center
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                from-[#171d22]
                via-[#11171c]
                to-[#0d1216]
                p-7
                text-center
                shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(255,106,0,0.06)]
                transition-all
                duration-500
                hover:-translate-y-2
                hover:border-[#FF6A00]/50
                hover:shadow-[0_18px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.18)]
                sm:col-span-2
                md:col-span-1
              "
            >
              <div className="absolute left-0 right-0 top-0 h-[2px] origin-left scale-x-0 bg-[#FF6A00] transition-transform duration-500 group-hover:scale-x-100" />
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#FF6A00]/50 group-hover:bg-[#FF6A00]/10">
                <LuPhoneCall size={30} />
              </div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                Phone Number
              </p>
              <p className="text-sm font-semibold text-white group-hover:text-[#FF6A00] transition-colors md:text-base">
                +91 9659133504
              </p>
            </div>
          </div>

          {/* Get in Touch Form */}
          <div className="mt-14 sm:mt-16">
            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-gradient-to-br
                from-[#171d22]
                via-[#11171c]
                to-[#0d1216]
                p-6
                shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,106,0,0.12)]
                sm:p-10
                lg:p-12
              "
            >
              {/* Laser Line */}
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent" />

              <div className="mx-auto mb-8 max-w-xl text-center">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00] sm:text-xs">
                  DIRECT INQUIRY
                </p>
                <h3 className="hero-font text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
                  SEND US A <span className="text-[#FF6A00]">MESSAGE</span>
                </h3>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
                noValidate
              >
                {/* Name */}
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Your Name <span className="text-[#FF6A00]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter your full name"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${errors.name ? "border-red-500" : "border-white/15"}
                      bg-[#080d11]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      placeholder-white/30
                      outline-none
                      transition-all
                      duration-300
                      focus:border-[#FF6A00]
                      focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]
                    `}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Email Address <span className="text-[#FF6A00]">*</span>
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                    })}
                    placeholder="name@example.com"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${errors.email ? "border-red-500" : "border-white/15"}
                      bg-[#080d11]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      placeholder-white/30
                      outline-none
                      transition-all
                      duration-300
                      focus:border-[#FF6A00]
                      focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]
                    `}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Mobile Number <span className="text-[#FF6A00]">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register("mobile", {
                      required: "Mobile is required",
                      pattern: { value: /^[0-9]{10}$/, message: "Enter 10 digit number" },
                    })}
                    placeholder="Enter 10-digit mobile number"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${errors.mobile ? "border-red-500" : "border-white/15"}
                      bg-[#080d11]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      placeholder-white/30
                      outline-none
                      transition-all
                      duration-300
                      focus:border-[#FF6A00]
                      focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]
                    `}
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Subject <span className="text-[#FF6A00]">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("subject", { required: "Subject is required" })}
                    placeholder="How can we help you?"
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${errors.subject ? "border-red-500" : "border-white/15"}
                      bg-[#080d11]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      placeholder-white/30
                      outline-none
                      transition-all
                      duration-300
                      focus:border-[#FF6A00]
                      focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]
                    `}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="relative md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Your Message <span className="text-[#FF6A00]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    {...register("message", { required: "Message is required" })}
                    placeholder="Tell us more about your project or inquiry..."
                    className={`
                      w-full
                      rounded-xl
                      border
                      ${errors.message ? "border-red-500" : "border-white/15"}
                      bg-[#080d11]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      placeholder-white/30
                      outline-none
                      transition-all
                      duration-300
                      focus:border-[#FF6A00]
                      focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]
                    `}
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-2 md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      inline-flex
                      items-center
                      gap-3
                      rounded-full
                      bg-[#FF6A00]
                      px-8
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white
                      shadow-[0_0_25px_rgba(255,106,0,0.35)]
                      transition-all
                      duration-300
                      hover:bg-[#ff781a]
                      hover:shadow-[0_0_35px_rgba(255,106,0,0.5)]
                      disabled:opacity-60
                      sm:text-sm
                    "
                  >
                    <span>{loading ? "Sending..." : "Send Your Request"}</span>
                    <FiSend
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Success Popup Modal */}
          {popup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#1b2228] to-[#0f1418] p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,106,0,0.25)] sm:p-8">
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />
                
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <FiCheckCircle size={32} />
                </div>

                <h3 className="hero-font mb-2 text-xl font-bold uppercase text-white">
                  REQUEST SENT SUCCESSFULLY
                </h3>
                <p className="mb-6 text-xs leading-relaxed text-white/70 sm:text-sm">
                  We have received your message. Our specialist team will review your inquiry and get in touch with you shortly.
                </p>

                <button
                  onClick={() => setPopup(false)}
                  className="w-full rounded-full bg-[#FF6A00] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,106,0,0.35)] transition-all duration-300 hover:bg-[#ff781a]"
                >
                  OK, GOT IT
                </button>
              </div>
            </div>
          )}

          {/* Google Map Section */}
          <div
            data-aos="zoom-in-up"
            className="mt-14 overflow-hidden rounded-2xl border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] sm:mt-16"
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF6A00] to-transparent" />
            <div className="h-[320px] w-full md:h-[420px] lg:h-[480px]">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3895.539575460426!2d78.57159557357998!3d12.48035352546114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bac5553a9ae4243%3A0xd877e8dc97cafac9!2sQ-Techx%20Solutions!5e0!3m2!1sen!2sin!4v1756791409418!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(90%)" }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </PageContainer>

        {/* Bottom Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </div>

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
    </>
  );
};

export default ContactPage;
