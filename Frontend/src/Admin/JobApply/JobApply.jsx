import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Upload, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api";

const JobApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("form"); // form, review, success
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: "",
    email: "",
    phone: "",
    alternate_phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    current_location: "",

    // Professional Info
    current_job_title: "",
    current_company: "",
    total_experience: "",
    relevant_experience: "",
    employment_status: "Employed",
    current_salary: "",
    expected_salary: "",
    notice_period: "",
    joining_date: "",
    willing_to_relocate: "No",
    preferred_work_mode: "",

    // Education
    education: [{ qualification: "", degree: "", specialization: "", college: "", year: "", cgpa: "" }],

    // Skills
    skills: [],
    certifications: "",

    // Links
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",

    // Files
    resume: null,
    cover_letter: null,
    portfolio_file: null,
    certificates: null,

    // Screening answers
    screening_answers: {},

    // Additional Info
    additional_information: "",
    why_join: "",
    why_suitable: "",
    project_experience: "",
    hear_about: "",

    // Declaration
    declaration_accuracy: false,
    declaration_privacy: false,
    declaration_terms: false,
    declaration_contact: false,
  });

  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    education: true,
    skills: true,
    links: true,
    files: true,
    screening: true,
    additional: true,
    declaration: true,
  });

  // Fetch job data on mount
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        if (!jobId) {
          toast.error("Invalid job ID");
          navigate("/career");
          return;
        }

        const { data } = await api.get(`/job-applications/${jobId}/form-data`);
        setJobData(data.data);

        // Initialize screening answers if job has screening questions
        if (data.data?.screening_questions && data.data.screening_questions.length > 0) {
          const answers = {};
          data.data.screening_questions.forEach((q) => {
            answers[q.id] = "";
          });
          setFormData((prev) => ({ ...prev, screening_answers: answers }));
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
        navigate("/career");
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, navigate]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Handle education entries
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index][field] = value;
    setFormData((prev) => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { qualification: "", degree: "", specialization: "", college: "", year: "", cgpa: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    if (formData.education.length > 1) {
      setFormData((prev) => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index),
      }));
    } else {
      toast.error("At least one education entry is required");
    }
  };

  // Handle skill tags
  const handleSkillAdd = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !formData.skills.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, value],
        }));
        e.target.value = "";
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Handle screening answers
  const handleScreeningChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      screening_answers: {
        ...prev.screening_answers,
        [questionId]: value,
      },
    }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(formData.phone.replace(/[\s\-\+]/g, ""))) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.city) newErrors.city = "City is required";
    if (!formData.total_experience) newErrors.total_experience = "Total experience is required";
    if (!formData.relevant_experience) newErrors.relevant_experience = "Relevant experience is required";
    if (!formData.notice_period) newErrors.notice_period = "Notice period is required";
    if (!formData.education[0].qualification) {
      newErrors.education_0_qualification = "Highest qualification is required";
    }
    if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";

    // File validation
    if (jobData?.resume_required === "Yes" && !formData.resume) {
      newErrors.resume = "Resume is required for this job";
    }

    // Declaration validation
    if (!formData.declaration_accuracy) {
      newErrors.declaration_accuracy = "You must confirm accuracy of information";
    }
    if (!formData.declaration_privacy) {
      newErrors.declaration_privacy = "You must agree to privacy policy";
    }
    if (!formData.declaration_terms) {
      newErrors.declaration_terms = "You must agree to terms and conditions";
    }
    if (!formData.declaration_contact) {
      newErrors.declaration_contact = "You must authorize contact";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next/review
  const handleReview = () => {
    if (validateForm()) {
      setCurrentStep("review");
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix all required fields");
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formDataObj = new FormData();

      // Add all form fields
      formDataObj.append("full_name", formData.full_name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("alternate_phone", formData.alternate_phone);
      formDataObj.append("date_of_birth", formData.date_of_birth);
      formDataObj.append("gender", formData.gender);
      formDataObj.append("address", formData.address);
      formDataObj.append("city", formData.city);
      formDataObj.append("state", formData.state);
      formDataObj.append("pincode", formData.pincode);
      formDataObj.append("current_location", formData.current_location);

      formDataObj.append("current_job_title", formData.current_job_title);
      formDataObj.append("current_company", formData.current_company);
      formDataObj.append("total_experience", formData.total_experience);
      formDataObj.append("relevant_experience", formData.relevant_experience);
      formDataObj.append("employment_status", formData.employment_status);
      formDataObj.append("current_salary", formData.current_salary);
      formDataObj.append("expected_salary", formData.expected_salary);
      formDataObj.append("notice_period", formData.notice_period);
      formDataObj.append("joining_date", formData.joining_date);
      formDataObj.append("willing_to_relocate", formData.willing_to_relocate);
      formDataObj.append("preferred_work_mode", formData.preferred_work_mode);

      formDataObj.append("education", JSON.stringify(formData.education));
      formDataObj.append("skills", JSON.stringify(formData.skills));
      formDataObj.append("certifications", formData.certifications);

      formDataObj.append("linkedin_url", formData.linkedin_url);
      formDataObj.append("github_url", formData.github_url);
      formDataObj.append("portfolio_url", formData.portfolio_url);

      formDataObj.append("screening_answers", JSON.stringify(formData.screening_answers));
      formDataObj.append("additional_information", formData.additional_information);

      // Add files
      if (formData.resume) {
        formDataObj.append("resume", formData.resume);
      }
      if (formData.cover_letter) {
        formDataObj.append("cover_letter", formData.cover_letter);
      }
      if (formData.portfolio_file) {
        formDataObj.append("portfolio_file", formData.portfolio_file);
      }
      if (formData.certificates) {
        formDataObj.append("certificates", formData.certificates);
      }

      const { data } = await api.post(`/job-applications/${jobId}/submit`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessData({
        id: data.data.id,
        job_title: jobData?.job_title,
        company_name: jobData?.company_name,
        applied_at: new Date().toLocaleDateString(),
      });

      setCurrentStep("success");
      window.scrollTo(0, 0);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Success Page
  if (currentStep === "success") {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="inline-block rounded-full bg-green-100 p-6 mb-4">
                <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Application Submitted! 🎉</h1>
              <p className="text-gray-600 mb-6">Thank you for your interest in joining our team.</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position Applied:</span>
                  <span className="font-semibold text-gray-800">{successData?.job_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-semibold text-gray-800">{successData?.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Application ID:</span>
                  <span className="font-mono text-gray-800">{successData?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-800">{successData?.applied_at}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Applied
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              We have received your application and will review it shortly. You can track the status of your application
              from your profile.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/career")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Browse More Jobs
              </button>
              <button
                onClick={() => navigate("/my-applications")}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                View My Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Page
  if (currentStep === "review") {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Review Your Application</h1>

          {/* Job Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600">Position</p>
                <p className="font-semibold text-gray-800 text-lg">{jobData?.job_title}</p>
              </div>
              <div>
                <p className="text-gray-600">Company</p>
                <p className="font-semibold text-gray-800 text-lg">{jobData?.company_name}</p>
              </div>
              <div>
                <p className="text-gray-600">Location</p>
                <p className="font-semibold text-gray-800">{`${jobData?.city}, ${jobData?.state || ""}`}</p>
              </div>
              <div>
                <p className="text-gray-600">Employment Type</p>
                <p className="font-semibold text-gray-800">{jobData?.employment_type}</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                <p className="font-semibold text-gray-800">{formData.full_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-semibold text-gray-800">{formData.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-semibold text-gray-800">{formData.phone}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">City</p>
                <p className="font-semibold text-gray-800">{formData.city}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Current Company</p>
                <p className="font-semibold text-gray-800">{formData.current_company || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Experience</p>
                <p className="font-semibold text-gray-800">{formData.total_experience} years</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Expected Salary</p>
                <p className="font-semibold text-gray-800">{formData.expected_salary || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Notice Period</p>
                <p className="font-semibold text-gray-800">{formData.notice_period}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Files */}
          {(formData.resume || formData.cover_letter) && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Uploaded Files</h2>
              <div className="space-y-2">
                {formData.resume && (
                  <p className="text-gray-800">
                    📄 <span className="font-semibold">Resume:</span> {formData.resume.name}
                  </p>
                )}
                {formData.cover_letter && (
                  <p className="text-gray-800">
                    📄 <span className="font-semibold">Cover Letter:</span> {formData.cover_letter.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 justify-between mb-8">
            <button
              onClick={() => setCurrentStep("form")}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              ← Back to Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Apply for Position</h1>

          {/* Job Summary Card */}
          <div className="bg-gradient-to-r from-primary/10 to-orange-50 rounded-lg p-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Position</p>
                <p className="font-bold text-gray-800 text-lg">{jobData?.job_title}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Company</p>
                <p className="font-bold text-gray-800 text-lg">{jobData?.company_name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-bold text-gray-800 text-lg">{jobData?.city || "Remote"}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleReview(); }} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("personal")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>👤 Personal Information</span>
              {expandedSections.personal ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.personal && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.full_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Alternate Phone</label>
                    <input
                      type="tel"
                      name="alternate_phone"
                      value={formData.alternate_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Current Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="current_location"
                      value={formData.current_location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.current_location ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="City/Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Street Address"
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Professional Information Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("professional")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>💼 Professional Information</span>
              {expandedSections.professional ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.professional && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Current Job Title</label>
                    <input
                      type="text"
                      name="current_job_title"
                      value={formData.current_job_title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Senior Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Current Company</label>
                    <input
                      type="text"
                      name="current_company"
                      value={formData.current_company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="XYZ Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Total Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="total_experience"
                      value={formData.total_experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.total_experience ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Experience</option>
                      <option value="0">Fresher</option>
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                      <option value="10">10+ Years</option>
                    </select>
                    {errors.total_experience && (
                      <p className="text-red-500 text-sm mt-1">{errors.total_experience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Relevant Experience <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="relevant_experience"
                      value={formData.relevant_experience}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.relevant_experience ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Experience</option>
                      <option value="0">Less than 6 months</option>
                      <option value="1">6 months - 1 year</option>
                      <option value="2">1 - 2 Years</option>
                      <option value="3">2 - 3 Years</option>
                      <option value="5">3 - 5 Years</option>
                      <option value="10">5+ Years</option>
                    </select>
                    {errors.relevant_experience && (
                      <p className="text-red-500 text-sm mt-1">{errors.relevant_experience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Employment Status</label>
                    <select
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Freelancer">Freelancer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Current Salary (CTC)</label>
                    <input
                      type="number"
                      name="current_salary"
                      value={formData.current_salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="500000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Expected Salary (CTC)</label>
                    <input
                      type="number"
                      name="expected_salary"
                      value={formData.expected_salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="600000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Notice Period <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="notice_period"
                      value={formData.notice_period}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.notice_period ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Notice Period</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months">3 Months</option>
                    </select>
                    {errors.notice_period && (
                      <p className="text-red-500 text-sm mt-1">{errors.notice_period}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Available Joining Date</label>
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Willing to Relocate</label>
                    <select
                      name="willing_to_relocate"
                      value={formData.willing_to_relocate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Preferred Work Mode</label>
                    <select
                      name="preferred_work_mode"
                      value={formData.preferred_work_mode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Work Mode</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("education")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>🎓 Education</span>
              {expandedSections.education ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.education && (
              <div className="p-6">
                <div className="space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-4 border border-gray-300 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">Education {index + 1}</h3>
                        {formData.education.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Highest Qualification <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={edu.qualification}
                            onChange={(e) => handleEducationChange(index, "qualification", e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                              errors[`education_${index}_qualification`] ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Qualification</option>
                            <option value="12th Pass">12th Pass</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Master">Master</option>
                            <option value="PhD">PhD</option>
                          </select>
                          {errors[`education_${index}_qualification`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_qualification`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Degree / Course</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="B.Tech, MBA, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Specialization</label>
                          <input
                            type="text"
                            value={edu.specialization}
                            onChange={(e) => handleEducationChange(index, "specialization", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Computer Science"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">College / University</label>
                          <input
                            type="text"
                            value={edu.college}
                            onChange={(e) => handleEducationChange(index, "college", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="University Name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Graduation Year</label>
                          <input
                            type="number"
                            value={edu.year}
                            onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="2022"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Percentage / CGPA</label>
                          <input
                            type="text"
                            value={edu.cgpa}
                            onChange={(e) => handleEducationChange(index, "cgpa", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="85% / 8.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addEducation}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  + Add Another Education
                </button>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("skills")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>⚡ Skills</span>
              {expandedSections.skills ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.skills && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    onKeyPress={handleSkillAdd}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type skill and press Enter"
                  />
                  {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                  <p className="text-gray-500 text-sm mt-2">Press Enter to add skills</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Certifications</label>
                  <textarea
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="AWS, Microsoft Azure, etc. (comma separated)"
                    rows="3"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Professional Links */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("links")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>🔗 Professional Links</span>
              {expandedSections.links ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.links && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resume & Documents */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("files")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>📄 Resume & Documents</span>
              {expandedSections.files ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.files && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Resume / CV {jobData?.resume_required === "Yes" && <span className="text-red-500">*</span>}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      name="resume"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-input"
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor="resume-input" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-600 font-semibold">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">PDF, DOC, DOCX (Max 10 MB)</p>
                    </label>
                  </div>
                  {formData.resume && (
                    <p className="mt-2 text-gray-700">✓ Uploaded: {formData.resume.name}</p>
                  )}
                  {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Cover Letter</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      name="cover_letter"
                      onChange={handleFileChange}
                      className="hidden"
                      id="cover-letter-input"
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor="cover-letter-input" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-600 font-semibold">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">PDF, DOC, DOCX (Max 10 MB)</p>
                    </label>
                  </div>
                  {formData.cover_letter && (
                    <p className="mt-2 text-gray-700">✓ Uploaded: {formData.cover_letter.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Portfolio / Projects</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      name="portfolio_file"
                      onChange={handleFileChange}
                      className="hidden"
                      id="portfolio-input"
                    />
                    <label htmlFor="portfolio-input" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-600 font-semibold">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">Any file type (Max 10 MB)</p>
                    </label>
                  </div>
                  {formData.portfolio_file && (
                    <p className="mt-2 text-gray-700">✓ Uploaded: {formData.portfolio_file.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Certificates / Awards</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition cursor-pointer">
                    <input
                      type="file"
                      name="certificates"
                      onChange={handleFileChange}
                      className="hidden"
                      id="certificates-input"
                    />
                    <label htmlFor="certificates-input" className="cursor-pointer">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-600 font-semibold">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">PDF, Images (Max 10 MB)</p>
                    </label>
                  </div>
                  {formData.certificates && (
                    <p className="mt-2 text-gray-700">✓ Uploaded: {formData.certificates.name}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Screening Questions */}
          {jobData?.screening_questions && jobData.screening_questions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection("screening")}
                className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
              >
                <span>❓ Screening Questions</span>
                {expandedSections.screening ? <ChevronUp /> : <ChevronDown />}
              </button>

              {expandedSections.screening && (
                <div className="p-6 space-y-6">
                  {jobData.screening_questions.map((question, i) => (
                    <div key={question.id || i}>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        {question.question_text}
                        {question.required && <span className="text-red-500">*</span>}
                      </label>

                      {question.question_type === "text" && (
                        <input
                          type="text"
                          value={formData.screening_answers[question.id] || ""}
                          onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Your answer"
                        />
                      )}

                      {question.question_type === "textarea" && (
                        <textarea
                          value={formData.screening_answers[question.id] || ""}
                          onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Your answer"
                          rows="4"
                        />
                      )}

                      {question.question_type === "yes_no" && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`screening_${question.id}`}
                              value="Yes"
                              checked={formData.screening_answers[question.id] === "Yes"}
                              onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`screening_${question.id}`}
                              value="No"
                              checked={formData.screening_answers[question.id] === "No"}
                              onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      )}

                      {question.question_type === "dropdown" && (
                        <select
                          value={formData.screening_answers[question.id] || ""}
                          onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select an option</option>
                          {question.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {question.question_type === "multiple_choice" && (
                        <div className="space-y-2">
                          {question.options?.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                value={opt}
                                checked={(formData.screening_answers[question.id] || "").split(",").includes(opt)}
                                onChange={(e) => {
                                  const current = (formData.screening_answers[question.id] || "").split(",").filter(Boolean);
                                  if (e.target.checked) {
                                    handleScreeningChange(question.id, [...current, opt].join(","));
                                  } else {
                                    handleScreeningChange(question.id, current.filter((x) => x !== opt).join(","));
                                  }
                                }}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("additional")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>💬 Additional Information</span>
              {expandedSections.additional ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.additional && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Why do you want to join this company?
                  </label>
                  <textarea
                    value={formData.additional_information}
                    onChange={(e) => setFormData({ ...formData, additional_information: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tell us about your interest in this company"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Why are you suitable for this position?
                  </label>
                  <textarea
                    value={formData.why_suitable}
                    onChange={(e) => setFormData({ ...formData, why_suitable: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Highlight your key strengths for this role"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Relevant Project Experience</label>
                  <textarea
                    value={formData.project_experience}
                    onChange={(e) => setFormData({ ...formData, project_experience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe relevant projects you've worked on"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">How did you hear about this job?</label>
                  <select
                    value={formData.hear_about}
                    onChange={(e) => setFormData({ ...formData, hear_about: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select an option</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Company Website">Company Website</option>
                    <option value="Friend Referral">Friend Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Job Portal">Job Portal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Declaration & Consent */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection("declaration")}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between font-semibold text-gray-800 transition"
            >
              <span>⚖️ Declaration & Consent</span>
              {expandedSections.declaration ? <ChevronUp /> : <ChevronDown />}
            </button>

            {expandedSections.declaration && (
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="declaration_accuracy"
                    checked={formData.declaration_accuracy}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-gray-700">
                    I confirm that the information provided in this application is accurate and truthful.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.declaration_accuracy && (
                  <p className="text-red-500 text-sm ml-6">{errors.declaration_accuracy}</p>
                )}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="declaration_privacy"
                    checked={formData.declaration_privacy}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-gray-700">
                    I agree to the company's Privacy Policy. <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.declaration_privacy && (
                  <p className="text-red-500 text-sm ml-6">{errors.declaration_privacy}</p>
                )}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="declaration_terms"
                    checked={formData.declaration_terms}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-gray-700">
                    I agree to the Terms and Conditions. <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.declaration_terms && (
                  <p className="text-red-500 text-sm ml-6">{errors.declaration_terms}</p>
                )}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="declaration_contact"
                    checked={formData.declaration_contact}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label className="text-gray-700">
                    I authorize the company to contact me regarding this application. <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.declaration_contact && (
                  <p className="text-red-500 text-sm ml-6">{errors.declaration_contact}</p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate("/career")}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Review Application →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApply;
