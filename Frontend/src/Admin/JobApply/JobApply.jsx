import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  User,
  GraduationCap,
  FileText,
  Sparkles,
  MapPin,
  Clock,
  Send,
} from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";
import api from "../../api";
import Head from "../../Componets/Components/Head";
import PageContainer from "../../Componets/CommonComponents/PageContainer";

const FORM_STEPS = [
  { id: 1, title: "Personal", label: "Personal Info", icon: User },
  { id: 2, title: "Professional", label: "Professional", icon: Briefcase },
  { id: 3, title: "Education & Skills", label: "Education & Skills", icon: GraduationCap },
  { id: 4, title: "Docs & Questions", label: "Docs & Consent", icon: FileText },
  { id: 5, title: "Review", label: "Review & Submit", icon: Sparkles },
];

const JobApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("form"); // form, review, success
  const [activeFormStep, setActiveFormStep] = useState(1); // 1, 2, 3, 4
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
    education: [
      {
        qualification: "",
        degree: "",
        specialization: "",
        college: "",
        year: "",
        cgpa: "",
      },
    ],

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
        if (
          data.data?.screening_questions &&
          data.data.screening_questions.length > 0
        ) {
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
        {
          qualification: "",
          degree: "",
          specialization: "",
          college: "",
          year: "",
          cgpa: "",
        },
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

  // Form Validations
  const validateStep1 = () => {
    const stepErrors = {};
    if (!formData.full_name.trim()) stepErrors.full_name = "Full name is required";
    if (!formData.email.trim()) stepErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      stepErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) stepErrors.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(formData.phone.replace(/[\s\-\+]/g, ""))) {
      stepErrors.phone = "Invalid phone number";
    }
    if (!formData.city) stepErrors.city = "City is required";
    if (!formData.current_location) stepErrors.current_location = "Current location is required";

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    if (!formData.total_experience) stepErrors.total_experience = "Total experience is required";
    if (!formData.relevant_experience) stepErrors.relevant_experience = "Relevant experience is required";
    if (!formData.notice_period) stepErrors.notice_period = "Notice period is required";

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep3 = () => {
    const stepErrors = {};
    if (!formData.education[0]?.qualification) {
      stepErrors.education_0_qualification = "Highest qualification is required";
    }
    if (formData.skills.length === 0) stepErrors.skills = "At least one skill is required";

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

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
    if (!formData.current_location) newErrors.current_location = "Current location is required";
    if (!formData.total_experience) newErrors.total_experience = "Total experience is required";
    if (!formData.relevant_experience) newErrors.relevant_experience = "Relevant experience is required";
    if (!formData.notice_period) newErrors.notice_period = "Notice period is required";
    if (!formData.education[0]?.qualification) {
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

  // Handle Stepper navigation click
  const handleStepClick = (stepId) => {
    if (stepId === 5) {
      handleReview();
      return;
    }
    setCurrentStep("form");
    setActiveFormStep(stepId);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  // Step advance
  const handleNextStep = async () => {
    if (activeFormStep === 1) {
      if (!validateStep1()) {
        toast.error("Please fill in the required personal details");
        return;
      }

      // Check user table registration and duplicate application before moving to Step 2
      try {
        await api.post(`/job-applications/${jobId}/check-eligibility`, {
          email: formData.email,
          phone: formData.phone,
        });
      } catch (err) {
        if (err.response?.status === 409) {
          const msg = err.response?.data?.message || "Email or mobile number is already registered or has applied.";
          toast.error(msg);
          if (msg.toLowerCase().includes("email")) {
            setErrors((prev) => ({ ...prev, email: msg }));
          } else {
            setErrors((prev) => ({ ...prev, phone: msg }));
          }
          return;
        }
      }

      setActiveFormStep(2);
    } else if (activeFormStep === 2) {
      if (!validateStep2()) {
        toast.error("Please fill in the required professional details");
        return;
      }
      setActiveFormStep(3);
    } else if (activeFormStep === 3) {
      if (!validateStep3()) {
        toast.error("Please provide your qualification and at least one skill");
        return;
      }
      setActiveFormStep(4);
    } else if (activeFormStep === 4) {
      handleReview();
      return;
    }
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    if (activeFormStep > 1) {
      setActiveFormStep((prev) => prev - 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  // Handle next/review
  const handleReview = () => {
    if (validateForm()) {
      setCurrentStep("review");
      window.scrollTo({ top: 380, behavior: "smooth" });
    } else {
      toast.error("Please fill in all mandatory fields before review");
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

      formDataObj.append(
        "screening_answers",
        JSON.stringify(formData.screening_answers)
      );
      formDataObj.append(
        "additional_information",
        formData.additional_information
      );
      formDataObj.append("why_suitable", formData.why_suitable);
      formDataObj.append("project_experience", formData.project_experience);
      formDataObj.append("hear_about", formData.hear_about);

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

      const { data } = await api.post(
        `/job-applications/${jobId}/submit`,
        formDataObj,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const appliedJobs = JSON.parse(
        localStorage.getItem("applied_jobs") || "[]"
      );
      if (!appliedJobs.includes(String(jobId))) {
        localStorage.setItem(
          "applied_jobs",
          JSON.stringify([...appliedJobs, String(jobId)])
        );
      }

      setSuccessData({
        id: data.data.id,
        job_title: jobData?.job_title,
        company_name: jobData?.company_name,
        applied_at: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      });

      setCurrentStep("success");
      window.scrollTo(0, 0);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Error submitting application:", error);
      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message ||
            "This mobile number has already been used to apply for this position."
        );
        return;
      }
      toast.error(
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#03070a] text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent shadow-[0_0_20px_rgba(255,106,0,0.5)]" />
          <p className="hero-font text-xs uppercase tracking-wider text-[#FF6A00]">
            Loading Application Form...
          </p>
        </div>
      </div>
    );
  }

  // Active step index for stepper highlight
  const currentStepNumber = currentStep === "review" ? 5 : activeFormStep;

  return (
    <>
      {/* ── HERO BANNER ── */}
      <Head
        title={jobData ? `Apply for ${jobData.job_title}` : "Job Application"}
        subtitle={
          <>
            <Link className="text-base sm:text-lg font-semibold text-gray-300 hover:text-[#FF6A00] transition" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-base sm:text-lg font-bold text-gray-500" />
            <Link className="text-base sm:text-lg font-semibold text-gray-300 hover:text-[#FF6A00] transition" to="/career">
              Careers
            </Link>
            <IoIosArrowForward className="mx-1 text-base sm:text-lg font-bold text-gray-500" />
            <span className="text-base sm:text-lg font-semibold text-[#FF6A00]">
              Application
            </span>
          </>
        }
      />

      {/* ── MAIN CANVAS (BLACK & ORANGE CYBERPUNK THEME) ── */}
      <div className="relative w-full overflow-hidden bg-[#03070a] text-gray-200 min-h-screen">
        {/* Top Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/3 bottom-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[130px]" />

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

        {/* ── FLUID PAGE CONTAINER (FULL WIDTH MATCHING HOME PAGE) ── */}
        <PageContainer className="relative z-10 py-8 sm:py-12 lg:py-16">
          {/* =====================================================
              1. SUCCESS VIEW (CELEBRATORY CONFIRMATION)
          ====================================================== */}
          {currentStep === "success" ? (
            <div className="w-full">
              <div className="relative overflow-hidden rounded-3xl border border-[#1c252d] bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#0d1216] p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(255,106,0,0.15)] sm:p-12">
                <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />

                {/* Animated Green Badge */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] sm:h-20 sm:w-20">
                  <CheckCircle2 size={38} />
                </div>

                <h1 className="hero-font text-2xl font-bold uppercase tracking-tight text-gray-100 sm:text-3xl lg:text-4xl">
                  APPLICATION SUBMITTED! 🎉
                </h1>
                <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-gray-400 sm:text-sm">
                  Thank you for your interest in joining <span className="text-[#FF6A00] font-semibold">{successData?.company_name || "Q Techx Solutions"}</span>. We have received your application successfully.
                </p>

                {/* Application Details Summary */}
                <div className="mt-8 rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5 text-left sm:p-6 shadow-inner">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                    Application Receipt Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
                    <div className="border-b border-[#1c252d] pb-2 sm:border-b-0">
                      <span className="text-gray-500 block text-xs mb-1">Position Applied:</span>
                      <span className="font-semibold text-gray-200">{successData?.job_title}</span>
                    </div>
                    <div className="border-b border-[#1c252d] pb-2 sm:border-b-0">
                      <span className="text-gray-500 block text-xs mb-1">Company:</span>
                      <span className="font-semibold text-gray-200">{successData?.company_name}</span>
                    </div>
                    <div className="border-b border-[#1c252d] pb-2 sm:border-b-0">
                      <span className="text-gray-500 block text-xs mb-1">Application ID:</span>
                      <span className="font-mono font-bold text-[#FF6A00]">{successData?.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">Submission Date:</span>
                      <span className="text-gray-200">{successData?.applied_at}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs mb-1">Status:</span>
                      <span className="inline-block mt-0.5 rounded-full border border-blue-500/40 bg-blue-500/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        Under Review
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                  Our talent acquisition team will review your profile and contact you via email regarding next steps.
                </p>

                {/* Navigation Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate("/career")}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25323a] bg-[#11171c] px-7 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-[#FF6A00]/50 hover:text-[#FF6A00] transition"
                  >
                    Browse More Jobs
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6A00] px-7 py-3 text-xs font-bold uppercase tracking-wider text-black font-extrabold shadow-[0_0_20px_rgba(255,106,0,0.35)] hover:bg-[#ff781a] transition"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* =====================================================
               2. UNIFIED APPLICATION CARD (FULL WIDTH OF PAGECONTAINER)
            ====================================================== */
            <div className="w-full">
              <div className="overflow-hidden rounded-3xl border border-[#1c252d] bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#0d1216] shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,106,0,0.08)]">
                
                {/* ── CARD HEADER: JOB BRIEF ── */}
                <div className="border-b border-[#1c252d] bg-[#0c1216]/90 p-5 sm:p-7">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                          {jobData?.company_name || "Q Techx Solutions"}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs font-semibold text-gray-400">
                          Application Portal
                        </span>
                      </div>
                      <h1 className="hero-font text-xl font-bold uppercase tracking-tight text-gray-100 sm:text-2xl lg:text-3xl">
                        {jobData?.job_title || "Application"}
                      </h1>
                    </div>

                    <div className="flex flex-wrap gap-2.5 text-xs">
                      <div className="flex items-center gap-1.5 rounded-lg border border-[#1e272f] bg-[#070b0e] px-3 py-1.5">
                        <MapPin size={14} className="text-[#FF6A00]" />
                        <span className="text-gray-300">{jobData?.city || "Remote"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg border border-[#1e272f] bg-[#070b0e] px-3 py-1.5">
                        <Clock size={14} className="text-[#FF6A00]" />
                        <span className="text-gray-300">{jobData?.employment_type || "Full-time"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── COMPACT STEPPER BAR (INTEGRATED INSIDE THE SAME BOX) ── */}
                <div className="border-b border-[#1c252d] bg-[#070b0e] px-4 py-4 sm:px-8">
                  <div className="relative flex items-center justify-between">
                    {/* Background line */}
                    <div className="absolute left-4 right-4 top-1/2 h-[1.5px] -translate-y-1/2 bg-[#1c252d] sm:left-6 sm:right-6" />
                    
                    {/* Active progress line */}
                    <div
                      className="absolute left-4 top-1/2 h-[1.5px] -translate-y-1/2 bg-[#FF6A00] transition-all duration-400 shadow-[0_0_6px_rgba(255,106,0,0.8)] sm:left-6"
                      style={{
                        width: `calc(${((currentStepNumber - 1) / (FORM_STEPS.length - 1)) * 100}% - 16px)`,
                      }}
                    />

                    {FORM_STEPS.map((step) => {
                      const isCompleted = step.id < currentStepNumber;
                      const isActive = step.id === currentStepNumber;

                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => handleStepClick(step.id)}
                          className="group relative z-10 flex flex-col items-center focus:outline-none"
                          title={step.label}
                        >
                          {/* Compact Step Circle */}
                          <div
                            className={`
                              flex
                              h-7
                              w-7
                              items-center
                              justify-center
                              rounded-full
                              text-[11px]
                              font-bold
                              transition-all
                              duration-300
                              sm:h-8
                              sm:w-8
                              sm:text-xs
                              ${
                                isActive
                                  ? "border-2 border-[#FF6A00] bg-[#FF6A00] text-black font-extrabold shadow-[0_0_15px_rgba(255,106,0,0.8)] scale-110"
                                  : isCompleted
                                  ? "border border-[#FF6A00] bg-[#12191f] text-[#FF6A00] hover:scale-105"
                                  : "border border-[#1e272f] bg-[#070b0e] text-gray-500 hover:border-[#2a3742] hover:text-gray-300"
                              }
                            `}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={15} className="text-[#FF6A00]" />
                            ) : (
                              <span>{step.id}</span>
                            )}
                          </div>

                          {/* Compact Step Label (Desktop) */}
                          <span
                            className={`
                              mt-1.5
                              hidden
                              text-center
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              transition-colors
                              md:block
                              ${
                                isActive
                                  ? "text-[#FF6A00]"
                                  : isCompleted
                                  ? "text-gray-300"
                                  : "text-gray-500 group-hover:text-gray-400"
                              }
                            `}
                          >
                            {step.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── CARD BODY: FORM CONTENT OR REVIEW (INSIDE SAME BOX) ── */}
                <div className="p-5 sm:p-8 lg:p-10">
                  
                  {/* =====================================================
                      3. REVIEW STEP VIEW (STEP 5)
                  ====================================================== */}
                  {currentStep === "review" ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-[#1c252d] pb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                            STEP 5 OF 5
                          </p>
                          <h2 className="hero-font text-xl font-bold uppercase text-gray-100 sm:text-2xl">
                            REVIEW YOUR <span className="text-[#FF6A00]">APPLICATION</span>
                          </h2>
                        </div>
                        <button
                          onClick={() => { setCurrentStep("form"); setActiveFormStep(4); }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#25323a] bg-[#0c1216] px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:border-[#FF6A00] hover:text-[#FF6A00] transition"
                        >
                          <ArrowLeft size={13} />
                          <span>Edit Details</span>
                        </button>
                      </div>

                      {/* Personal Information Review */}
                      <div className="rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5 sm:p-6 shadow-sm">
                        <div className="mb-3.5 flex items-center justify-between border-b border-[#1c252d] pb-2.5">
                          <h3 className="flex items-center gap-2 font-bold text-gray-100 text-sm">
                            <User size={16} className="text-[#FF6A00]" />
                            <span>Personal Information</span>
                          </h3>
                          <button
                            onClick={() => { setCurrentStep("form"); setActiveFormStep(1); }}
                            className="text-xs font-semibold text-[#FF6A00] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5 text-xs">
                          <div>
                            <span className="text-gray-500 block mb-1">Full Name:</span>
                            <span className="font-semibold text-gray-200">{formData.full_name || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Email:</span>
                            <span className="font-semibold text-gray-200">{formData.email || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Phone:</span>
                            <span className="font-semibold text-gray-200">{formData.phone || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Alternate Phone:</span>
                            <span className="font-semibold text-gray-200">{formData.alternate_phone || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Current Location:</span>
                            <span className="font-semibold text-gray-200">{formData.current_location || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">City:</span>
                            <span className="font-semibold text-gray-200">{formData.city || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">State:</span>
                            <span className="font-semibold text-gray-200">{formData.state || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Pincode:</span>
                            <span className="font-semibold text-gray-200">{formData.pincode || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Professional Information Review */}
                      <div className="rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5 sm:p-6 shadow-sm">
                        <div className="mb-3.5 flex items-center justify-between border-b border-[#1c252d] pb-2.5">
                          <h3 className="flex items-center gap-2 font-bold text-gray-100 text-sm">
                            <Briefcase size={16} className="text-[#FF6A00]" />
                            <span>Professional Background</span>
                          </h3>
                          <button
                            onClick={() => { setCurrentStep("form"); setActiveFormStep(2); }}
                            className="text-xs font-semibold text-[#FF6A00] hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5 text-xs">
                          <div>
                            <span className="text-gray-500 block mb-1">Current Job Title:</span>
                            <span className="font-semibold text-gray-200">{formData.current_job_title || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Current Company:</span>
                            <span className="font-semibold text-gray-200">{formData.current_company || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Total Experience:</span>
                            <span className="font-semibold text-gray-200">{formData.total_experience} Years</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Relevant Experience:</span>
                            <span className="font-semibold text-gray-200">{formData.relevant_experience} Years</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Notice Period:</span>
                            <span className="font-semibold text-gray-200">{formData.notice_period || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Expected CTC:</span>
                            <span className="font-semibold text-gray-200">{formData.expected_salary ? `₹ ${formData.expected_salary}` : "Not Disclosed"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Employment Status:</span>
                            <span className="font-semibold text-gray-200">{formData.employment_status || "Employed"}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">Preferred Work Mode:</span>
                            <span className="font-semibold text-gray-200">{formData.preferred_work_mode || "Flexible"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Education & Skills Review */}
                      <div className="rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5 sm:p-6 shadow-sm">
                        <div className="mb-3.5 flex items-center justify-between border-b border-[#1c252d] pb-2.5">
                          <h3 className="flex items-center gap-2 font-bold text-gray-100 text-sm">
                            <GraduationCap size={16} className="text-[#FF6A00]" />
                            <span>Education & Skills</span>
                          </h3>
                          <button
                            onClick={() => { setCurrentStep("form"); setActiveFormStep(3); }}
                            className="text-xs font-semibold text-[#FF6A00] hover:underline"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-gray-500 block mb-2 text-xs">Skills & Tech Stack:</span>
                            <div className="flex flex-wrap gap-2">
                              {formData.skills.map((skill, i) => (
                                <span
                                  key={i}
                                  className="rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-xs font-semibold text-[#FF6A00]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-[#1c252d] pt-3">
                            <span className="text-gray-500 block mb-2 text-xs">Academic Qualifications:</span>
                            <div className="text-xs text-gray-300 space-y-1.5">
                              {formData.education.map((edu, idx) => (
                                <p key={idx}>
                                  • <strong className="text-gray-100">{edu.qualification}</strong> {edu.degree && `(${edu.degree})`} - {edu.college || "Institute not specified"} {edu.year && `[${edu.year}]`} {edu.cgpa && `— ${edu.cgpa}`}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Uploaded Documents Review */}
                      <div className="rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5 sm:p-6 shadow-sm">
                        <div className="mb-3.5 flex items-center justify-between border-b border-[#1c252d] pb-2.5">
                          <h3 className="flex items-center gap-2 font-bold text-gray-100 text-sm">
                            <FileText size={16} className="text-[#FF6A00]" />
                            <span>Documents & Attachments</span>
                          </h3>
                          <button
                            onClick={() => { setCurrentStep("form"); setActiveFormStep(4); }}
                            className="text-xs font-semibold text-[#FF6A00] hover:underline"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                          <div className="flex items-center gap-2">
                            <span className="text-[#FF6A00]">📄 Resume:</span>
                            <span className="font-semibold text-gray-200">{formData.resume ? formData.resume.name : "Not uploaded"}</span>
                          </div>
                          {formData.cover_letter && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#FF6A00]">📄 Cover Letter:</span>
                              <span className="font-semibold text-gray-200">{formData.cover_letter.name}</span>
                            </div>
                          )}
                          {formData.portfolio_file && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#FF6A00]">📁 Portfolio:</span>
                              <span className="font-semibold text-gray-200">{formData.portfolio_file.name}</span>
                            </div>
                          )}
                          {formData.certificates && (
                            <div className="flex items-center gap-2">
                              <span className="text-[#FF6A00]">📜 Certificate:</span>
                              <span className="font-semibold text-gray-200">{formData.certificates.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Review Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3.5 justify-between pt-6 border-t border-[#1c252d]">
                        <button
                          type="button"
                          onClick={() => { setCurrentStep("form"); setActiveFormStep(4); }}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#25323a] bg-[#0c1216] px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-[#FF6A00]/40 hover:text-[#FF6A00] transition"
                        >
                          <ArrowLeft size={14} />
                          <span>Back to Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6A00] px-8 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,106,0,0.4)] hover:bg-[#ff781a] hover:shadow-[0_0_30px_rgba(255,106,0,0.6)] transition disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirm & Submit Application</span>
                              <Send size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* =====================================================
                        4. ACTIVE STEP FORM (STEPS 1 - 4)
                    ====================================================== */
                    <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-8">
                      
                      {/* ── STEP 1: PERSONAL INFORMATION ── */}
                      {activeFormStep === 1 && (
                        <div className="space-y-6">
                          <div className="border-b border-[#1c252d] pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                              STEP 1 OF 4
                            </p>
                            <h2 className="hero-font text-xl font-bold uppercase text-gray-100 sm:text-2xl">
                              PERSONAL <span className="text-[#FF6A00]">INFORMATION</span>
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                              Please provide your contact and primary demographic details.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                            {/* Full Name */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Full Name <span className="text-[#FF6A00]">*</span>
                              </label>
                              <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className={`w-full rounded-xl border ${
                                  errors.full_name ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00] focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]`}
                                placeholder="e.g. Alexander Pierce"
                              />
                              {errors.full_name && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.full_name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Email Address <span className="text-[#FF6A00]">*</span>
                              </label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full rounded-xl border ${
                                  errors.email ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00] focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]`}
                                placeholder="name@example.com"
                              />
                              {errors.email && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Phone Number <span className="text-[#FF6A00]">*</span>
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`w-full rounded-xl border ${
                                  errors.phone ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00] focus:shadow-[0_0_15px_rgba(255,106,0,0.2)]`}
                                placeholder="10-digit number"
                              />
                              {errors.phone && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.phone}</p>}
                            </div>

                            {/* Alternate Phone */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Alternate Phone
                              </label>
                              <input
                                type="tel"
                                name="alternate_phone"
                                value={formData.alternate_phone}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="Optional secondary number"
                              />
                            </div>

                            {/* Date of Birth */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark" }}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                              />
                            </div>

                            {/* Gender */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Gender
                              </label>
                              <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                              >
                                <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select Gender</option>
                                <option value="Male" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Male</option>
                                <option value="Female" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Female</option>
                                <option value="Other" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Other</option>
                                <option value="Prefer not to say" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Prefer not to say</option>
                              </select>
                            </div>

                            {/* Current Location */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Current Location / Area <span className="text-[#FF6A00]">*</span>
                              </label>
                              <input
                                type="text"
                                name="current_location"
                                value={formData.current_location}
                                onChange={handleInputChange}
                                className={`w-full rounded-xl border ${
                                  errors.current_location ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]`}
                                placeholder="e.g. Bangalore, Whitefield"
                              />
                              {errors.current_location && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.current_location}</p>}
                            </div>

                            {/* City */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                City <span className="text-[#FF6A00]">*</span>
                              </label>
                              <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={`w-full rounded-xl border ${
                                  errors.city ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]`}
                                placeholder="e.g. Chennai"
                              />
                              {errors.city && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.city}</p>}
                            </div>

                            {/* State */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                State
                              </label>
                              <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. Tamil Nadu"
                              />
                            </div>

                            {/* Pincode */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Pincode
                              </label>
                              <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. 600001"
                              />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Residential Address
                              </label>
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="Street, Apartment / House No."
                                rows="2"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── STEP 2: PROFESSIONAL INFORMATION ── */}
                      {activeFormStep === 2 && (
                        <div className="space-y-6">
                          <div className="border-b border-[#1c252d] pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                              STEP 2 OF 4
                            </p>
                            <h2 className="hero-font text-xl font-bold uppercase text-gray-100 sm:text-2xl">
                              PROFESSIONAL <span className="text-[#FF6A00]">EXPERIENCE</span>
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                              Detail your employment history, compensation, and career readiness.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                            {/* Current Job Title */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Current / Most Recent Job Title
                              </label>
                              <input
                                type="text"
                                name="current_job_title"
                                value={formData.current_job_title}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. Frontend Developer"
                              />
                            </div>

                            {/* Current Company */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Current / Previous Company
                              </label>
                              <input
                                type="text"
                                name="current_company"
                                value={formData.current_company}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. Acme Corp"
                              />
                            </div>

                            {/* Total Experience */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Total Experience <span className="text-[#FF6A00]">*</span>
                              </label>
                              <select
                                name="total_experience"
                                value={formData.total_experience}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className={`w-full rounded-xl border ${
                                  errors.total_experience ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]`}
                              >
                                <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select Experience</option>
                                <option value="0" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Fresher / Entry Level</option>
                                <option value="1" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">1 Year</option>
                                <option value="2" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">2 Years</option>
                                <option value="3" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">3 Years</option>
                                <option value="5" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">4 - 5 Years</option>
                                <option value="10" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">6 - 10 Years</option>
                                <option value="15" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">10+ Years</option>
                              </select>
                              {errors.total_experience && (
                                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.total_experience}</p>
                              )}
                            </div>

                            {/* Relevant Experience */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Relevant Experience <span className="text-[#FF6A00]">*</span>
                              </label>
                              <select
                                name="relevant_experience"
                                value={formData.relevant_experience}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className={`w-full rounded-xl border ${
                                  errors.relevant_experience ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]`}
                              >
                                <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select Relevant Experience</option>
                                <option value="0" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Less than 6 months</option>
                                <option value="1" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">6 months - 1 Year</option>
                                <option value="2" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">1 - 2 Years</option>
                                <option value="3" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">2 - 3 Years</option>
                                <option value="5" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">3 - 5 Years</option>
                                <option value="10" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">5+ Years</option>
                              </select>
                              {errors.relevant_experience && (
                                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.relevant_experience}</p>
                              )}
                            </div>

                            {/* Employment Status */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Current Employment Status
                              </label>
                              <select
                                name="employment_status"
                                value={formData.employment_status}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                              >
                                <option value="Employed" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Employed</option>
                                <option value="Unemployed" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Unemployed / Immediate Joiner</option>
                                <option value="Self-Employed" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Self-Employed</option>
                                <option value="Freelancer" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Freelancer / Consultant</option>
                              </select>
                            </div>

                            {/* Notice Period */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Notice Period <span className="text-[#FF6A00]">*</span>
                              </label>
                              <select
                                name="notice_period"
                                value={formData.notice_period}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className={`w-full rounded-xl border ${
                                  errors.notice_period ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]`}
                              >
                                <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select Notice Period</option>
                                <option value="Immediate" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Immediate (0 Days)</option>
                                <option value="15 Days" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">15 Days</option>
                                <option value="1 Month" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">1 Month (30 Days)</option>
                                <option value="2 Months" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">2 Months (60 Days)</option>
                                <option value="3 Months" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">3 Months (90 Days)</option>
                              </select>
                              {errors.notice_period && (
                                <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.notice_period}</p>
                              )}
                            </div>

                            {/* Current Salary */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Current Annual CTC (INR)
                              </label>
                              <input
                                type="number"
                                name="current_salary"
                                value={formData.current_salary}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. 500000"
                              />
                            </div>

                            {/* Expected Salary */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Expected Annual CTC (INR)
                              </label>
                              <input
                                type="number"
                                name="expected_salary"
                                value={formData.expected_salary}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. 700000"
                              />
                            </div>

                            {/* Available Joining Date */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Earliest Joining Date
                              </label>
                              <input
                                type="date"
                                name="joining_date"
                                value={formData.joining_date}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark" }}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                              />
                            </div>

                            {/* Willing to Relocate */}
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Willing to Relocate?
                              </label>
                              <select
                                name="willing_to_relocate"
                                value={formData.willing_to_relocate}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                              >
                                <option value="No" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">No</option>
                                <option value="Yes" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Yes</option>
                              </select>
                            </div>

                            {/* Preferred Work Mode */}
                            <div className="md:col-span-2">
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Preferred Work Mode
                              </label>
                              <select
                                name="preferred_work_mode"
                                value={formData.preferred_work_mode}
                                onChange={handleInputChange}
                                style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                              >
                                <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select Preference</option>
                                <option value="Remote" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Remote (Work from Anywhere)</option>
                                <option value="On-site" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">On-site (Office)</option>
                                <option value="Hybrid" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Hybrid</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── STEP 3: EDUCATION, SKILLS & LINKS ── */}
                      {activeFormStep === 3 && (
                        <div className="space-y-8">
                          <div className="border-b border-[#1c252d] pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                              STEP 3 OF 4
                            </p>
                            <h2 className="hero-font text-xl font-bold uppercase text-gray-100 sm:text-2xl">
                              EDUCATION & <span className="text-[#FF6A00]">SKILLS</span>
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                              Add your educational degrees, key engineering skills, and online profiles.
                            </p>
                          </div>

                          <div className="space-y-8">
                            {/* Education Entries */}
                            <div className="space-y-5">
                              <label className="text-xs font-bold uppercase tracking-wider text-gray-200 block mb-2">
                                Academic Qualifications <span className="text-[#FF6A00]">*</span>
                              </label>

                              {formData.education.map((edu, index) => (
                                <div
                                  key={index}
                                  className="relative rounded-2xl border border-[#1c252d] bg-[#070b0e] p-6 sm:p-7 transition hover:border-[#283642]"
                                >
                                  <div className="mb-5 flex items-center justify-between">
                                    <span className="rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                                      Degree / Entry #{index + 1}
                                    </span>
                                    {formData.education.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:gap-y-7 sm:grid-cols-2 md:grid-cols-3">
                                    {/* Qualification */}
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        Qualification <span className="text-[#FF6A00]">*</span>
                                      </label>
                                      <select
                                        value={edu.qualification}
                                        onChange={(e) =>
                                          handleEducationChange(index, "qualification", e.target.value)
                                        }
                                        style={{ colorScheme: "dark", backgroundColor: "#0c1216", color: "#f3f4f6" }}
                                        className={`w-full rounded-xl border ${
                                          errors[`education_${index}_qualification`]
                                            ? "border-red-500"
                                            : "border-[#1e2830]"
                                        } bg-[#0c1216] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]`}
                                      >
                                        <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select Qualification</option>
                                        <option value="12th Pass" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">12th Pass / Higher Secondary</option>
                                        <option value="Diploma" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Diploma</option>
                                        <option value="Bachelor" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Bachelor's Degree</option>
                                        <option value="Master" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Master's Degree</option>
                                        <option value="PhD" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Doctorate / PhD</option>
                                      </select>
                                      {errors[`education_${index}_qualification`] && (
                                        <p className="mt-1.5 text-xs text-red-400 font-medium">
                                          {errors[`education_${index}_qualification`]}
                                        </p>
                                      )}
                                    </div>

                                    {/* Degree */}
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        Degree / Course Name
                                      </label>
                                      <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) =>
                                          handleEducationChange(index, "degree", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                        placeholder="e.g. B.Tech / B.E."
                                      />
                                    </div>

                                    {/* Specialization */}
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        Specialization / Stream
                                      </label>
                                      <input
                                        type="text"
                                        value={edu.specialization}
                                        onChange={(e) =>
                                          handleEducationChange(index, "specialization", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                        placeholder="e.g. Computer Science"
                                      />
                                    </div>

                                    {/* College / University */}
                                    <div className="sm:col-span-2">
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        College / University
                                      </label>
                                      <input
                                        type="text"
                                        value={edu.college}
                                        onChange={(e) =>
                                          handleEducationChange(index, "college", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                        placeholder="e.g. Anna University"
                                      />
                                    </div>

                                    {/* Year of Passing */}
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        Graduation Year
                                      </label>
                                      <input
                                        type="number"
                                        value={edu.year}
                                        onChange={(e) =>
                                          handleEducationChange(index, "year", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                        placeholder="e.g. 2023"
                                      />
                                    </div>

                                    {/* CGPA */}
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                        Percentage / CGPA
                                      </label>
                                      <input
                                        type="text"
                                        value={edu.cgpa}
                                        onChange={(e) =>
                                          handleEducationChange(index, "cgpa", e.target.value)
                                        }
                                        className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                        placeholder="e.g. 8.4 CGPA or 82%"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <button
                                type="button"
                                onClick={addEducation}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#25323a] bg-[#070b0e] px-5 py-2 text-xs font-semibold text-[#FF6A00] hover:border-[#FF6A00] hover:bg-[#FF6A00]/10 transition"
                              >
                                <span>+ Add Another Degree</span>
                              </button>
                            </div>

                            {/* Skills Section */}
                            <div className="border-t border-[#1c252d] pt-6">
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-200">
                                Skills & Tech Stack <span className="text-[#FF6A00]">*</span>
                              </label>
                              <p className="mb-3 text-xs text-gray-500">
                                Type a skill (e.g. React, Node.js, Python, Figma) and press <strong className="text-gray-200">Enter</strong> to tag.
                              </p>

                              <input
                                type="text"
                                onKeyPress={handleSkillAdd}
                                className={`w-full rounded-xl border ${
                                  errors.skills ? "border-red-500" : "border-[#1e2830]"
                                } bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]`}
                                placeholder="Type skill name & hit Enter..."
                              />
                              {errors.skills && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.skills}</p>}

                              <div className="mt-4 flex flex-wrap gap-2">
                                {formData.skills.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/40 bg-[#FF6A00]/15 px-3.5 py-1.5 text-xs font-semibold text-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.15)]"
                                  >
                                    <span>{skill}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeSkill(skill)}
                                      className="rounded-full hover:bg-white/20 p-0.5 transition"
                                    >
                                      <X size={12} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Certifications */}
                            <div className="border-t border-[#1c252d] pt-6">
                              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-200">
                                Certifications & Licenses
                              </label>
                              <textarea
                                name="certifications"
                                value={formData.certifications}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                placeholder="e.g. AWS Certified Solutions Architect, Meta Frontend Specialization"
                                rows="2"
                              />
                            </div>

                            {/* Professional Links */}
                            <div className="border-t border-[#1c252d] pt-6">
                              <label className="mb-4 block text-xs font-bold uppercase tracking-wider text-gray-200">
                                Professional & Portfolio Profiles
                              </label>

                              <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3">
                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    LinkedIn Profile URL
                                  </label>
                                  <input
                                    type="url"
                                    name="linkedin_url"
                                    value={formData.linkedin_url}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                    placeholder="https://linkedin.com/in/username"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    GitHub Profile URL
                                  </label>
                                  <input
                                    type="url"
                                    name="github_url"
                                    value={formData.github_url}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                    placeholder="https://github.com/username"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    Portfolio Website
                                  </label>
                                  <input
                                    type="url"
                                    name="portfolio_url"
                                    value={formData.portfolio_url}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                    placeholder="https://yourportfolio.com"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── STEP 4: DOCUMENTS, SCREENING & DECLARATION ── */}
                      {activeFormStep === 4 && (
                        <div className="space-y-8">
                          <div className="border-b border-[#1c252d] pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6A00]">
                              STEP 4 OF 4
                            </p>
                            <h2 className="hero-font text-xl font-bold uppercase text-gray-100 sm:text-2xl">
                              DOCUMENTS & <span className="text-[#FF6A00]">DECLARATION</span>
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                              Upload your CV, answer screening questions, and authorize consent.
                            </p>
                          </div>

                          <div className="space-y-8">
                            {/* Document Uploads Grid */}
                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                              {/* Resume */}
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                  Resume / CV {jobData?.resume_required === "Yes" && <span className="text-[#FF6A00]">*</span>}
                                </label>
                                <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed ${errors.resume ? "border-red-500 bg-red-500/5" : "border-[#1e2830] bg-[#070b0e] hover:border-[#FF6A00]/60"} p-6 text-center transition cursor-pointer`}>
                                  <input
                                    type="file"
                                    name="resume"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="resume-input"
                                    accept=".pdf,.doc,.docx"
                                  />
                                  <label htmlFor="resume-input" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-[#FF6A00]" size={26} />
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-200">Click or drag resume</p>
                                    <p className="mt-1 text-[11px] text-gray-500">PDF, DOC, DOCX (Max 10 MB)</p>
                                  </label>
                                </div>
                                {formData.resume && (
                                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                                    ✓ Attached: {formData.resume.name}
                                  </p>
                                )}
                                {errors.resume && <p className="mt-1.5 text-xs text-red-400 font-medium">{errors.resume}</p>}
                              </div>

                              {/* Cover Letter */}
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                  Cover Letter
                                </label>
                                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#1e2830] bg-[#070b0e] p-6 text-center transition hover:border-[#FF6A00]/60 cursor-pointer">
                                  <input
                                    type="file"
                                    name="cover_letter"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="cover-letter-input"
                                    accept=".pdf,.doc,.docx"
                                  />
                                  <label htmlFor="cover-letter-input" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-500" size={26} />
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-200">Upload Cover Letter</p>
                                    <p className="mt-1 text-[11px] text-gray-500">PDF, DOC, DOCX (Optional)</p>
                                  </label>
                                </div>
                                {formData.cover_letter && (
                                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                                    ✓ Attached: {formData.cover_letter.name}
                                  </p>
                                )}
                              </div>

                              {/* Portfolio File */}
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                  Portfolio File / Case Studies
                                </label>
                                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#1e2830] bg-[#070b0e] p-6 text-center transition hover:border-[#FF6A00]/60 cursor-pointer">
                                  <input
                                    type="file"
                                    name="portfolio_file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="portfolio-input"
                                  />
                                  <label htmlFor="portfolio-input" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-500" size={26} />
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-200">Upload Portfolio File</p>
                                    <p className="mt-1 text-[11px] text-gray-500">Any file type (Max 10 MB)</p>
                                  </label>
                                </div>
                                {formData.portfolio_file && (
                                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                                    ✓ Attached: {formData.portfolio_file.name}
                                  </p>
                                )}
                              </div>

                              {/* Certificates */}
                              <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                  Certificates / Transcripts
                                </label>
                                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[#1e2830] bg-[#070b0e] p-6 text-center transition hover:border-[#FF6A00]/60 cursor-pointer">
                                  <input
                                    type="file"
                                    name="certificates"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="certificates-input"
                                  />
                                  <label htmlFor="certificates-input" className="cursor-pointer">
                                    <Upload className="mx-auto mb-2 text-gray-500" size={26} />
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-200">Upload Certificates</p>
                                    <p className="mt-1 text-[11px] text-gray-500">PDF, Images (Max 10 MB)</p>
                                  </label>
                                </div>
                                {formData.certificates && (
                                  <p className="mt-2 text-xs font-semibold text-emerald-400">
                                    ✓ Attached: {formData.certificates.name}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Screening Questions (if any) */}
                            {jobData?.screening_questions && jobData.screening_questions.length > 0 && (
                              <div className="border-t border-[#1c252d] pt-6">
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#FF6A00]">
                                  Screening Questions
                                </h3>

                                <div className="space-y-4">
                                  {jobData.screening_questions.map((question, i) => (
                                    <div key={question.id || i} className="rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5">
                                      <label className="mb-2 block text-xs font-semibold text-gray-200">
                                        {question.question_text}{" "}
                                        {question.required && <span className="text-[#FF6A00]">*</span>}
                                      </label>

                                      {question.question_type === "text" && (
                                        <input
                                          type="text"
                                          value={formData.screening_answers[question.id] || ""}
                                          onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                                          className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                          placeholder="Your answer"
                                        />
                                      )}

                                      {question.question_type === "textarea" && (
                                        <textarea
                                          value={formData.screening_answers[question.id] || ""}
                                          onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                                          className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                          placeholder="Your response..."
                                          rows="3"
                                        />
                                      )}

                                      {question.question_type === "yes_no" && (
                                        <div className="flex gap-6 pt-2 text-xs">
                                          <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                                            <input
                                              type="radio"
                                              name={`screening_${question.id}`}
                                              value="Yes"
                                              checked={formData.screening_answers[question.id] === "Yes"}
                                              onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                                              className="accent-[#FF6A00]"
                                            />
                                            <span>Yes</span>
                                          </label>
                                          <label className="flex items-center gap-2 cursor-pointer text-gray-200">
                                            <input
                                              type="radio"
                                              name={`screening_${question.id}`}
                                              value="No"
                                              checked={formData.screening_answers[question.id] === "No"}
                                              onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                                              className="accent-[#FF6A00]"
                                            />
                                            <span>No</span>
                                          </label>
                                        </div>
                                      )}

                                      {question.question_type === "dropdown" && (
                                        <select
                                          value={formData.screening_answers[question.id] || ""}
                                          onChange={(e) => handleScreeningChange(question.id, e.target.value)}
                                          style={{ colorScheme: "dark", backgroundColor: "#0c1216", color: "#f3f4f6" }}
                                          className="w-full rounded-xl border border-[#1e2830] bg-[#0c1216] px-4 py-3 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                                        >
                                          <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select option</option>
                                          {question.options?.map((opt, idx) => (
                                            <option key={idx} value={opt} style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Additional Information */}
                            <div className="border-t border-[#1c252d] pt-6">
                              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-200">
                                Candidate Statement & Insights
                              </h3>

                              <div className="space-y-5">
                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    Why do you want to join Q-Techx Solutions?
                                  </label>
                                  <textarea
                                    value={formData.additional_information}
                                    onChange={(e) => setFormData({ ...formData, additional_information: e.target.value })}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                    placeholder="Tell us about your motivation..."
                                    rows="3"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    Why are you suitable for this role?
                                  </label>
                                  <textarea
                                    value={formData.why_suitable}
                                    onChange={(e) => setFormData({ ...formData, why_suitable: e.target.value })}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                    placeholder="Highlight key achievements or strengths..."
                                    rows="3"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    Relevant Project Experience
                                  </label>
                                  <textarea
                                    value={formData.project_experience}
                                    onChange={(e) => setFormData({ ...formData, project_experience: e.target.value })}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3 text-xs sm:text-sm text-gray-100 placeholder-zinc-600 outline-none transition focus:border-[#FF6A00]"
                                    placeholder="Key projects and tech stacks utilized..."
                                    rows="3"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                    How did you hear about this opportunity?
                                  </label>
                                  <select
                                    value={formData.hear_about}
                                    onChange={(e) => setFormData({ ...formData, hear_about: e.target.value })}
                                    style={{ colorScheme: "dark", backgroundColor: "#070b0e", color: "#f3f4f6" }}
                                    className="w-full rounded-xl border border-[#1e2830] bg-[#070b0e] px-4 py-3.5 text-xs sm:text-sm text-gray-100 outline-none transition focus:border-[#FF6A00] [color-scheme:dark]"
                                  >
                                    <option value="" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Select an option</option>
                                    <option value="LinkedIn" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">LinkedIn</option>
                                    <option value="Company Website" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Company Website</option>
                                    <option value="Referral" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Friend / Employee Referral</option>
                                    <option value="Job Portal" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Job Portal</option>
                                    <option value="Social Media" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Social Media</option>
                                    <option value="Other" style={{ backgroundColor: "#0c1216", color: "#f3f4f6" }} className="bg-[#0c1216] text-gray-100">Other</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Declaration & Consent Checkboxes */}
                            <div className="border-t border-[#1c252d] pt-6">
                              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-200">
                                Declarations & Authorizations <span className="text-[#FF6A00]">*</span>
                              </h3>

                              <div className="space-y-4 rounded-2xl border border-[#1c252d] bg-[#070b0e] p-5 text-xs text-gray-300">
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="declaration_accuracy"
                                    checked={formData.declaration_accuracy}
                                    onChange={handleInputChange}
                                    className="mt-0.5 accent-[#FF6A00]"
                                  />
                                  <span>
                                    I confirm that all information provided in this application is accurate and true. <span className="text-[#FF6A00]">*</span>
                                  </span>
                                </label>
                                {errors.declaration_accuracy && (
                                  <p className="ml-6 text-xs text-red-400 font-medium">{errors.declaration_accuracy}</p>
                                )}

                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="declaration_privacy"
                                    checked={formData.declaration_privacy}
                                    onChange={handleInputChange}
                                    className="mt-0.5 accent-[#FF6A00]"
                                  />
                                  <span>
                                    I agree to the Company's Privacy Policy. <span className="text-[#FF6A00]">*</span>
                                  </span>
                                </label>
                                {errors.declaration_privacy && (
                                  <p className="ml-6 text-xs text-red-400 font-medium">{errors.declaration_privacy}</p>
                                )}

                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="declaration_terms"
                                    checked={formData.declaration_terms}
                                    onChange={handleInputChange}
                                    className="mt-0.5 accent-[#FF6A00]"
                                  />
                                  <span>
                                    I agree to the Terms & Conditions. <span className="text-[#FF6A00]">*</span>
                                  </span>
                                </label>
                                {errors.declaration_terms && (
                                  <p className="ml-6 text-xs text-red-400 font-medium">{errors.declaration_terms}</p>
                                )}

                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="declaration_contact"
                                    checked={formData.declaration_contact}
                                    onChange={handleInputChange}
                                    className="mt-0.5 accent-[#FF6A00]"
                                  />
                                  <span>
                                    I authorize Q-Techx Solutions to contact me via Email / Phone. <span className="text-[#FF6A00]">*</span>
                                  </span>
                                </label>
                                {errors.declaration_contact && (
                                  <p className="ml-6 text-xs text-red-400 font-medium">{errors.declaration_contact}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── STEP ACTION BUTTONS (BOTTOM OF FORM) ── */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#1c252d]">
                        <div>
                          {activeFormStep > 1 ? (
                            <button
                              type="button"
                              onClick={handlePrevStep}
                              className="inline-flex items-center gap-2 rounded-full border border-[#25323a] bg-[#070b0e] px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:border-[#FF6A00]/50 hover:text-[#FF6A00] transition"
                            >
                              <ArrowLeft size={14} />
                              <span>Previous Step</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate("/career")}
                              className="inline-flex items-center gap-2 rounded-full border border-[#25323a] bg-[#070b0e] px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 hover:border-[#FF6A00]/50 hover:text-[#FF6A00] transition"
                            >
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>

                        <div>
                          {activeFormStep < 4 ? (
                            <button
                              type="button"
                              onClick={handleNextStep}
                              className="inline-flex items-center gap-2 rounded-full bg-[#FF6A00] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,106,0,0.35)] hover:bg-[#ff781a] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] transition"
                            >
                              <span>Save & Continue</span>
                              <ArrowRight size={14} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleReview}
                              className="inline-flex items-center gap-2 rounded-full bg-[#FF6A00] px-7 py-3 text-xs font-extrabold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,106,0,0.35)] hover:bg-[#ff781a] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] transition"
                            >
                              <span>Review Application</span>
                              <Sparkles size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </PageContainer>

        {/* Bottom Orange Laser Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </div>

      {/* ── SOCIAL MEDIA FOOTER ── */}
    </>
  );
};

export default JobApply;
