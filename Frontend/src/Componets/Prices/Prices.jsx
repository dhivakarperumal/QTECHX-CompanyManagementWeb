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
} from "react-icons/fi";
import SocialMedia from "../Home/SocialMedia";
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

  useEffect(() => {
    AOS.init({ duration: 900, easing: "ease-in-out", once: true, offset: 60 });

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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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

                    {/* Popular Badge */}
                    {isFeatured && (
                      <div className="absolute right-4 top-4 z-20">
                        <span className="flex items-center gap-1.5 rounded-full border border-[#FF6A00] bg-[#FF6A00] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,106,0,0.5)]">
                          <FiZap size={11} />
                          <span>MOST POPULAR</span>
                        </span>
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6 sm:p-7 md:p-8">
                      {/* Plan Title */}
                      <h3
                        className={`
                          text-xl
                          font-bold
                          uppercase
                          tracking-tight
                          transition-colors
                          duration-300
                          sm:text-2xl
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
                        <span className="hero-font text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
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
                        <Link
                          to="/booknow"
                          state={{ selectedPlan: plan.plan_title }}
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
                        </Link>
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

      {/* ── SOCIAL MEDIA FOOTER (MATCHING HOME) ── */}
      <SocialMedia />
    </>
  );
};

export default Prices;
