
import { useEffect, useState } from "react";
import { Clock, IndianRupee } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Head from "../Components/Head";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";
import SocialMedia from "../Home/SocialMedia";
import { fetchJobs } from "../Redux/jobsSlice";
import { useDispatch, useSelector } from "react-redux";
import emailjs from "@emailjs/browser";

const CareerDetail = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const dispatch = useDispatch();
  const { items: jobs, loading, error } = useSelector((state) => state.jobs);
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    location: "",
    position: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email";

    if (!form.mobile.trim()) newErrors.mobile = "Mobile is required";
    else if (!/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Invalid number";

    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.position.trim()) newErrors.position = "Position is required";

    if (!form.message.trim()) newErrors.message = "Message is required";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(); // your existing validate function
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const templateParams = {
          to_name: "HR Team",
          applicant_name: form.name,
          applicant_email: form.email,
          applicant_mobile: form.mobile,
          applicant_location: form.location,
          applicant_position: form.position,
          applicant_message: form.message,
          // resume_link: resumeLink,
        };

        await emailjs.send(
          "service_sh3mfta",
          "template_a4t1wuo",
          templateParams,
          "KHyC14cxAzIwpo4vI"
        );

        setPopup(true);
        setForm({
          name: "",
          email: "",
          mobile: "",
          location: "",
          position: "",
          message: "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to send application. Please try again.");
      }
    }
  };

  return (
    <>
      <Head
        title="Career"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="text-lg font-bold text-white mx-1" />
            <Link className="text-lg font-semibold text-white" to="/career">
              Career
            </Link>
          </>
        }
      />

      <div className="w-full bg-gray-50">
        {/* Section 1 */}
        <section className="py-5 text-center px-6">
          <h2
            data-aos="fade-down"
            data-aos-duration="1200"
            className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          >
            Apply for a Job
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-gray-600 text-sm md:text-base max-w-4xl mx-auto leading-relaxed"
          >
            Creating a friendly, independent and remote culture is essential to
            our work and we are always looking for the best professionals. You
            may need to complete an application form. Be sure you are applicable
            for Essential Eligibility & Skills needed by the company when
            submitting your profile.
          </p>
        </section>

        <section className="w-full min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div
            data-aos="flip-left"
            data-aos-duration="1200"
            className="bg-primary/10 shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row max-w-6xl w-full"
          >
            {/* Left Side - Image */}
            <div className="md:w-1/2 w-full">
              <img
                src="/images/careerdetail.jpg"
                alt="Career Apply"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Form */}
            <div className="md:w-1/2 w-full p-4 md:p-8">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
              >
                {/* Name */}
                <div className="relative">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Name"
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.name ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    *
                  </span>
                  {errors.name && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Your Email"
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.email ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    *
                  </span>
                  {errors.email && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile */}
                <div className="relative">
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    type="text"
                    placeholder="Mobile Number"
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.mobile ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    *
                  </span>
                  {errors.mobile && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.mobile}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="relative">
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    type="text"
                    placeholder="Location"
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.location ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    *
                  </span>
                  {errors.location && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Position */}
                {/* <div className="relative md:col-span-2">
                  <input
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    type="text"
                    placeholder="Position you are applying for"
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.position ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    *
                  </span>
                  {errors.position && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.position}
                    </p>
                  )}
                </div> */}
                {/* Position (Dropdown) */}
                <div className="relative md:col-span-2">
                  <select
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.position ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  >
                    <option value="">Select a position</option>
                    {jobs.map((job, i) => (
                      <option key={i} value={job.title}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  {/* <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                    *
                  </span> */}
                  {errors.position && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.position}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="relative md:col-span-2">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Message"
                    className={`w-full p-3 rounded-xl bg-white border-b pr-6 ${
                      errors.message ? "border-red-500" : "border-primary"
                    } focus:outline-none focus:ring-1 focus:ring-orange-400`}
                  ></textarea>
                  <span className="absolute right-3 top-3 text-red-500">*</span>
                  {errors.message && (
                    <p className="absolute left-2 -bottom-4 text-xs text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow hover:bg-primary/90 transition"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>

            {/* Success Popup */}
            {popup && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                  <h3 className="text-lg font-semibold text-green-600 mb-4">
                    Application sent successfully!
                  </h3>
                  <button
                    onClick={() => setPopup(false)}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="py-7 md:py-16 px-2 md:px-10 bg-gradient-to-b from-blue-50 to-white">
          <h2
            data-aos="fade-up"
            className="text-2xl md:text-4xl font-bold text-center mb-12 text-gray-800"
          >
            Opening Positions
          </h2>

          {loading && (
            <p className="text-center text-gray-600">Loading jobs...</p>
          )}
          {error && (
            <p className="text-center text-red-500">
              Failed to load jobs: {error}
            </p>
          )}

          {jobs.length === 0 && !loading && !error ? (
            <div
              className="w-full shadow rounded-lg p-5 text-center bg-contain bg-center bg-no-repeat relative mx-auto"
              style={{ backgroundImage: "url('/images/comingsoon.jpg')" }}
            >
              <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
              <div className="relative z-10 flex flex-col items-center gap-2 md:gap-4">
                <p className="text-xl small-caps md:text-4xl font-semibold text-white mb-2 text-center">
                  Opening not available currently.
                  <br className="hidden md:block" /> Please check back shortly.
                </p>

                {/* Loader dots */}
                <div className="pl text-[10px] md:text-[16px]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="pl__dot"></div>
                  ))}
                  <div className="pl__text text-black">Loading…</div>
                </div>

                <p className="text-white text-xs md:text-base mt-2">
                  Click below to be notified when openings are posted.
                </p>
                <button
                  className="bg-primary cursor-pointer hover:bg-primary/90 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg transition"
                  onClick={() => setNotifyModal(true)}
                >
                  Notify Me
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5 md:px-6">
              {jobs.map((job, i) => (
                <div
                  data-aos="zoom-in-up"
                  data-aos-delay={i * 150}
                  key={i}
                  className="bg-white shadow rounded-lg p-4 md:p-8 hover:shadow-lg transition"
                >
                  <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">
                    {job.title}
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base mb-3">
                    {job.desc}
                  </p>
                  <div className="flex items-center mt-6 gap-4 text-sm md:text-base text-gray-700">
                    <span className="flex items-center gap-1 text-gray-900">
                      <Clock size={16} className="text-primary" /> {job.type}
                    </span>
                    <span className="flex items-center gap-1 text-gray-900">
                      <IndianRupee size={16} className="text-primary" />{" "}
                      {job.salary}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notify Modal (always mounted) */}
          {notifyModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                {!notifySubmitted ? (
                  <>
                    <h3 className="text-lg font-semibold text-primary mb-4">
                      Get Notified!
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Enter your email and we will notify you when new jobs are
                      available.
                    </p>
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full p-3 rounded-xl border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex justify-center gap-4">
                      <button
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
                        onClick={() => {
                          if (
                            !notifyEmail ||
                            !/\S+@\S+\.\S+/.test(notifyEmail)
                          ) {
                            alert("Please enter a valid email");
                            return;
                          }
                          setNotifySubmitted(true);
                        }}
                      >
                        Submit
                      </button>
                      <button
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                        onClick={() => {
                          setNotifyModal(false);
                          setNotifyEmail("");
                          setNotifySubmitted(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-green-600 mb-4">
                      You will be notified!
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Thank you! We will inform you when new jobs are available.
                    </p>
                    <button
                      onClick={() => {
                        setNotifyModal(false);
                        setNotifyEmail("");
                        setNotifySubmitted(false);
                      }}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition"
                    >
                      OK
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
      <SocialMedia />
    </>
  );
};

export default CareerDetail;