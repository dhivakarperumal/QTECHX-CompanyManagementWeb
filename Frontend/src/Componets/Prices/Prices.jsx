import React, { useState, useEffect, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Head from "../Components/Head";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FiCheckCircle,
  FiArrowRight,
  FiZap,
  FiShield,
  FiClock,
  FiTrendingUp,
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiTag,
  FiX
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";
import api from "../../api";

const DEFAULT_PRICING_PLANS = [
  {
    plan_title: "Static Website",
    price: "₹20,000/-",
    audience: "Individuals, small businesses, and startups",
    description:
      "Professional 5-page responsive website with essential features at an affordable price.",
    category: "Websites",
    features: [
      "5 Pages (Home, About, Services, Contact, etc.)",
      ".IN or .COM Domain Name",
      "Free Domain Registration",
      "1 Year Free High-Speed Hosting",
      "Unlimited Business Email IDs",
      "Interactive Enquiry Form",
      "Mobile-First Responsive Design",
      "Google Maps & SEO Foundation",
    ],
  },
  {
    plan_title: "Dynamic Website",
    price: "₹30,000/-",
    audience: "Small to large businesses & growing brands",
    description:
      "Dynamic 7-page website with intuitive CMS features for content control and better client interaction.",
    category: "Websites",
    isPopular: true,
    features: [
      "7 Pages + Blog / Services Manager",
      ".IN or .COM Domain Name",
      "Free Domain Registration & Setup",
      "1 Year Free High-Speed Hosting",
      "Unlimited Business Email IDs",
      "Enquiry Form with Instant Email Alerts",
      "Fully Responsive UI/UX Design",
      "Admin Panel for Add / Edit / Delete",
      "SEO-Friendly URL & Metadata Structure",
    ],
  },
  {
    plan_title: "Web Application Development",
    price: "₹35,000 – ₹3,00,000+",
    audience: "Startups, Enterprises, and SaaS Platforms",
    description:
      "Custom-built web applications with scalable cloud architecture and full backend integration.",
    category: "Web Apps",
    features: [
      "Custom Modules & Workflows",
      "Frontend + Backend (React.js + Node.js)",
      "RESTful API & Microservices Design",
      "Role-Based Authentication & Security",
      "High-Performance Admin Dashboard",
      "Automated Deployment & CI/CD Setup",
      "Scalable Cloud Database (SQL / NoSQL)",
    ],
  },
  {
    plan_title: "Mobile Application Development",
    price: "₹50,000 – ₹4,00,000+",
    audience: "Product Owners, Enterprises, EdTech, Healthcare",
    description:
      "Cross-platform mobile apps built with React Native or Flutter with complete feature sets.",
    category: "Mobile Apps",
    features: [
      "Cross-Platform Android & iOS Support",
      "Social Login, Push Notifications, & Payments",
      "Dynamic High-Speed API Integration",
      "Offline Mode & Local Storage Support",
      "Admin Panel & Analytics Connectivity",
      "Play Store & App Store Deployment Guidance",
    ],
  },
  {
    plan_title: "E-Commerce Development",
    price: "₹25,000 – ₹2,50,000+",
    audience: "Retailers, D2C Brands, and Online Sellers",
    description:
      "Full-fledged online stores with payment gateways, inventory management, and admin controls.",
    category: "E-Commerce",
    features: [
      "Product Catalog, Filters, & Search",
      "Seamless Shopping Cart & Checkout",
      "Coupons, Discounts, & Offer Engine",
      "Multi-Currency Payment Gateway Integration",
      "Inventory & Order Management Dashboard",
      "Real-Time Order Tracking Notifications",
    ],
  },
  {
    plan_title: "UI/UX Design",
    price: "₹5,000 – ₹50,000+",
    audience: "Startups, Design Teams, and App Developers",
    description:
      "Modern, conversion-driven UI/UX designs crafted in Figma for web and mobile interfaces.",
    category: "Design & SEO",
    features: [
      "Wireframes & High-Fidelity Mockups",
      "Interactive Clickable Prototypes",
      "Design Systems & Component Libraries",
      "Mobile-First User-Centric Design",
      "Figma Deliverables Ready for Developers",
    ],
  },
  {
    plan_title: "Search Engine Optimization (SEO)",
    price: "₹5,000 – ₹50,000/mo",
    audience: "Business websites, Blogs, and E-Commerce",
    description:
      "Improve Google visibility, organic keyword rankings, and targeted traffic with monthly SEO sprints.",
    category: "Design & SEO",
    features: [
      "Comprehensive On-Page Optimization",
      "Technical SEO & Core Web Vitals Fixes",
      "High-Authority Backlink Building",
      "Competitive Keyword Targeting",
      "Detailed Monthly Performance & Traffic Reports",
    ],
  },
  {
    plan_title: "CRM Solutions",
    price: "₹40,000 – ₹3,00,000+",
    audience: "Sales Teams, Institutes, and Service Providers",
    description:
      "Custom CRM systems to automate leads, pipeline tracking, customer records, and reporting.",
    category: "Web Apps",
    features: [
      "Lead Management & Pipeline Tracking",
      "Email & SMS Automated Notifications",
      "Custom User Roles & Access Permissions",
      "Automated Follow-Up Reminders",
      "Custom Analytics & Sales Dashboards",
    ],
  },
  {
    plan_title: "Internship & Job-Oriented Training",
    price: "₹3,000 – ₹15,000",
    audience: "College Students, Freshers, and Career Switchers",
    description:
      "Industry-level live training in React, Node.js, Full Stack Development, and UI/UX.",
    category: "Training",
    features: [
      "1–3 Month Hands-on Internship Programs",
      "Live Production Projects with Mentorship",
      "Modern React.js & Full-Stack Tech Stacks",
      "Verified Industry Certification & Portfolio Help",
      "Mock Technical Interviews & Placement Assistance",
    ],
  },
];

const FAQS = [
  {
    q: "Can I customize any of these pricing plans for my specific requirements?",
    a: "Absolutely! Every business is unique. We can tailor any plan to include specialized features, custom backend integrations, third-party APIs, and dedicated design specifications. Contact our team for a tailored proposal.",
  },
  {
    q: "What is the payment structure and milestone schedule?",
    a: "We work on transparent, milestone-based billing. Typically, projects are structured into: initial project kickoff deposit, milestone stage payments (UI design, core backend development, testing approval), and final deployment sign-off.",
  },
  {
    q: "Do your website plans include free hosting and domain registration?",
    a: "Yes! Our static and dynamic website plans include 1 year of free high-speed hosting and free domain registration (.in or .com), along with complimentary SSL encryption setup.",
  },
  {
    q: "What kind of post-launch maintenance and support do you provide?",
    a: "We provide dedicated post-launch support and warranty covering bug fixes, server monitoring, security updates, and performance tuning to ensure your platform operates flawlessly.",
  },
  {
    q: "How long does it take to deliver a completed project?",
    a: "Delivery time depends on project scope. Standard websites are typically delivered within 5–14 days, while custom web applications, SaaS platforms, and mobile apps typically range between 3–8 weeks.",
  },
];

const Prices = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    price_amount: "",
  });

  const handleOpenModal = (plan) => {
    setSelectedPlanForModal(plan);
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      price_amount: plan.price || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlanForModal(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Please fill in your name and email.");
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/service-requests", {
        service_title: selectedPlanForModal?.plan_title || "Pricing Plan",
        ...formData,
      });
      if (!data.success) throw new Error(data.message || "Failed to submit request");
      toast.success("Thank you! Your request has been received.");
      handleCloseModal();
    } catch (err) {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 900, easing: "ease-out-cubic", once: true, offset: 60 });
    AOS.refresh();

    const fetchPrices = async () => {
      try {
        const { data } = await api.get("/pricing/public/all");
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const formatted = data.data.map((plan, index) => {
            let parsedFeatures = plan.features;
            if (typeof parsedFeatures === "string") {
              try {
                parsedFeatures = JSON.parse(parsedFeatures);
              } catch {
                parsedFeatures = [parsedFeatures];
              }
            }
            if (!Array.isArray(parsedFeatures)) {
              parsedFeatures = [];
            }

            return {
              ...plan,
              features: parsedFeatures,
              category: plan.category || "General",
              isPopular: plan.isPopular ?? index === 1,
            };
          });
          setItems(formatted);
        } else {
          // Fallback to default rich pricing plans
          setItems(DEFAULT_PRICING_PLANS);
        }
      } catch (err) {
        console.warn("Using fallback pricing plans:", err.message);
        setItems(DEFAULT_PRICING_PLANS);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Categories list
  const categories = useMemo(() => {
    const defaultCats = ["Websites", "Web Apps", "Mobile Apps", "E-Commerce", "Design & SEO", "Training"];
    const foundCats = Array.from(new Set(items.map((p) => p.category).filter(Boolean)));
    const merged = Array.from(new Set([...foundCats, ...defaultCats]));
    return ["All", ...merged];
  }, [items]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((plan) => {
      if (plan.category === selectedCategory) return true;
      // Heuristic fallback matching for categories
      if (
        selectedCategory === "Websites" &&
        (plan.plan_title.toLowerCase().includes("website") ||
          plan.plan_title.toLowerCase().includes("static") ||
          plan.plan_title.toLowerCase().includes("dynamic"))
      ) {
        return true;
      }
      if (
        selectedCategory === "Web Apps" &&
        (plan.plan_title.toLowerCase().includes("web app") ||
          plan.plan_title.toLowerCase().includes("crm") ||
          plan.plan_title.toLowerCase().includes("saas"))
      ) {
        return true;
      }
      if (
        selectedCategory === "Mobile Apps" &&
        plan.plan_title.toLowerCase().includes("mobile")
      ) {
        return true;
      }
      if (
        selectedCategory === "E-Commerce" &&
        plan.plan_title.toLowerCase().includes("commerce")
      ) {
        return true;
      }
      if (
        selectedCategory === "Design & SEO" &&
        (plan.plan_title.toLowerCase().includes("ui") ||
          plan.plan_title.toLowerCase().includes("seo"))
      ) {
        return true;
      }
      if (
        selectedCategory === "Training" &&
        plan.plan_title.toLowerCase().includes("internship")
      ) {
        return true;
      }
      return false;
    });
  }, [items, selectedCategory]);

  return (
    <>
      {/* ── HERO BANNER (PRESERVED AS REQUESTED) ── */}
      <Head
        title="Our Prices"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white" to="/prices">
              Our Prices
            </Link>
          </>
        }
      />

      {/* ── MAIN CONTENT (DARK CYBERPUNK HOME-MATCHING THEME) ── */}
      <div className="relative w-full overflow-hidden bg-[#03070a] text-white">
        {/* Top Orange Accent Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#FF6A00]/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/2 bottom-20 h-80 w-80 -translate-x-1/2 rounded-full bg-[#FF6A00]/10 blur-[140px]" />

        {/* Tech Grid Background */}
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

        <PageContainer className="relative z-10 py-14 sm:py-16 md:py-20">
          {/* =====================================================
              1. SECTION HEADING
          ====================================================== */}
          <SectionTitle
            subtitle="TRANSPARENT & AFFORDABLE"
            title="CHOOSE THE PERFECT"
            highlight="PLAN FOR YOU"
            className="mb-10 sm:mb-14"
          />

          {/* =====================================================
              2. CATEGORY FILTER TABS
          ====================================================== */}
          <div
            data-aos="fade-up"
            data-aos-delay="150"
            className="mb-12 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? items.length
                  : filteredPlans.length;

              const isActive = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-2
                    rounded-full
                    px-4
                    py-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    transition-all
                    duration-300
                    sm:px-5
                    sm:py-2.5
                    ${
                      isActive
                        ? "border border-[#FF6A00] bg-[#FF6A00] text-white shadow-[0_0_20px_rgba(255,106,0,0.4)]"
                        : "border border-white/10 bg-[#11171c] text-white/70 hover:border-[#FF6A00]/40 hover:text-white"
                    }
                  `}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* =====================================================
              3. PRICING CARDS GRID
          ====================================================== */}
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.3)]" />
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Loading Pricing Plans...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {filteredPlans.map((plan, index) => {
                const isFeatured = plan.isPopular || plan.plan_title === "Dynamic Website";

                return (
                  <div
                    key={index}
                    data-aos="fade-up"
                    data-aos-delay={(index % 6) * 100}
                    className={`
                      group
                      relative
                      flex
                      h-full
                      flex-col
                      overflow-hidden
                      rounded-2xl
                      transition-all
                      duration-500
                      ease-[cubic-bezier(0.22,1,0.36,1)]
                      ${
                        isFeatured
                          ? "border-2 border-[#FF6A00] bg-gradient-to-br from-[#1d2329] via-[#141a20] to-[#0f1418] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(255,106,0,0.22)] -translate-y-1 hover:-translate-y-2.5"
                          : "border border-white/10 bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#0d1216] shadow-[0_12px_35px_rgba(0,0,0,0.75),0_0_20px_rgba(255,106,0,0.08)] hover:-translate-y-2 hover:border-[#FF6A00]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.18)]"
                      }
                    `}
                  >
                    {/* Top Laser Line */}
                    <div
                      className={`
                        absolute
                        left-0
                        right-0
                        top-0
                        z-20
                        h-[2px]
                        bg-[#FF6A00]
                        transition-opacity
                        duration-500
                        ${isFeatured ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                      `}
                    />
                    <div className="pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[430%]" />

                    

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      {/* Plan Title */}
                      <h3
                        className={`
                          text-lg
                          font-bold
                          uppercase
                          tracking-tight
                          transition-colors
                          duration-300
                          sm:text-xl
                          ${isFeatured ? "text-[#FF6A00]" : "text-white group-hover:text-[#FF6A00]"}
                        `}
                      >
                        {plan.plan_title}
                      </h3>

                      {/* Audience Badge */}
                      {plan.audience && (
                        <div className="mt-2.5">
                          <span className="inline-block rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FF6A00]">
                            {plan.audience}
                          </span>
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="mt-5 flex items-baseline gap-2">
                        <span className="hero-font text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                          {plan.price}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-xs leading-relaxed text-white/65 sm:text-sm">
                        {plan.description}
                      </p>

                      {/* Divider */}
                      <div className="my-6 h-px w-full bg-white/10" />

                      {/* Features List */}
                      <div className="flex-1 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                          Key Features Included:
                        </p>
                        <ul className="space-y-2.5">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-xs text-white/80 sm:text-sm"
                            >
                              <FiCheckCircle
                                className="mt-0.5 shrink-0 text-[#FF6A00]"
                                size={15}
                              />
                              <span className="leading-snug">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-8">
                        <button
                          onClick={() => handleOpenModal(plan)}
                          className={`
                            group/btn
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-3
                            rounded-xl
                            py-3.5
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            transition-all
                            duration-300
                            sm:text-sm
                            ${
                              isFeatured
                                ? "bg-[#FF6A00] text-white shadow-[0_0_25px_rgba(255,106,0,0.4)] hover:bg-[#ff7515] hover:shadow-[0_0_35px_rgba(255,106,0,0.6)]"
                                : "border border-[#FF6A00]/50 bg-[#FF6A00]/10 text-white hover:border-[#FF6A00] hover:bg-[#FF6A00] hover:shadow-[0_0_25px_rgba(255,106,0,0.35)]"
                            }
                          `}
                        >
                          <span>Get Started</span>
                          <FiArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover/btn:translate-x-1"
                          />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Card Glow */}
                    <div
                      className={`
                        pointer-events-none
                        absolute
                        -bottom-20
                        left-1/2
                        h-40
                        w-40
                        -translate-x-1/2
                        rounded-full
                        blur-[50px]
                        transition-all
                        duration-500
                        ${
                          isFeatured
                            ? "bg-[#FF6A00]/25 opacity-100"
                            : "bg-[#FF6A00]/10 opacity-50 group-hover:bg-[#FF6A00]/25 group-hover:opacity-100"
                        }
                      `}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* =====================================================
              5. INTERACTIVE FAQ ACCORDION
          ====================================================== */}
          <div className="mt-20 sm:mt-24">
            <SectionTitle
              subtitle="GOT QUESTIONS?"
              title="FREQUENTLY ASKED"
              highlight="QUESTIONS"
              size="sm"
              className="mb-10 sm:mb-12"
            />

            <div className="mx-auto max-w-3xl space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    data-aos="fade-up"
                    data-aos-delay={index * 80}
                    className="
                      overflow-hidden
                      rounded-xl
                      border
                      border-white/10
                      bg-gradient-to-br
                      from-[#171d22]
                      via-[#11171c]
                      to-[#0d1216]
                      transition-all
                      duration-300
                      hover:border-[#FF6A00]/40
                    "
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-4
                        p-5
                        text-left
                        transition-colors
                        duration-200
                        sm:p-6
                      "
                    >
                      <span className="flex items-center gap-3 text-sm font-bold text-white sm:text-base">
                        <FiHelpCircle className="shrink-0 text-[#FF6A00]" size={18} />
                        <span>{faq.q}</span>
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#FF6A00]">
                        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/5 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                        <p className="text-xs leading-relaxed text-white/70 sm:text-sm">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        
      </PageContainer>

        {/* Bottom Orange Line */}
        <div className="h-px w-full bg-[#FF6A00]/60 shadow-[0_0_8px_rgba(255,106,0,0.25)]" />
      </div>

      <Toaster position="top-right" />

      {/* ── MODAL ── */}
      {isModalOpen && selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
          
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#FF6A00]/40 bg-gradient-to-br from-[#171d22] via-[#11171c] to-[#080b0e] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(255,106,0,0.15)] sm:p-8 animate-fade-up">
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#FF6A00]" />
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-white/50 hover:text-[#FF6A00] transition"
            >
              <FiX size={20} />
            </button>

            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FF6A00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A00]">
                <FiZap size={12} />
                <span>Instant Project Inquiry</span>
              </div>
              <h3 className="hero-font text-xl font-bold uppercase text-white sm:text-2xl">
                SEND US A <span className="text-[#FF6A00]">REQUEST</span>
              </h3>
              <p className="mt-1.5 text-xs text-white/60">
                Tell us about your project requirements and our team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Selected service */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Selected Service *
                </label>
                <div className="w-full rounded-xl border border-white/10 bg-[#090d10] px-4 py-3 text-sm text-white/70">
                  {selectedPlanForModal.plan_title}
                </div>
              </div>

              {/* Price Amount */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Price Amount *
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6A00]/70" />
                  <input
                    type="text"
                    name="price_amount"
                    readOnly
                    value={formData.price_amount}
                    className="w-full rounded-xl border border-[#FF6A00]/30 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-[#FF6A00] font-bold outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Your Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-white/10 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Mobile Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-white/10 bg-[#090d10] py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Project Details / Message
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Describe your goals, requirements, or timeline..."
                    className="w-full rounded-xl border border-white/10 bg-[#090d10] p-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00]/30"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-full bg-[#FF6A00] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(255,106,0,0.35)] transition-all duration-300 hover:bg-[#e05e00] hover:shadow-[0_0_35px_rgba(255,106,0,0.55)] disabled:opacity-60 sm:text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending Request...
                  </span>
                ) : (
                  <>
                    <span>Submit Request</span>
                    <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
    </>
  );
};

export default Prices;
