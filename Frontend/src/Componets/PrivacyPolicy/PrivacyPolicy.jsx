import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import {
  FiShield,
  FiLock,
  FiEye,
  FiDatabase,
  FiUserCheck,
  FiFileText,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiRefreshCw,
  FiShare2,
  FiArrowRight,
  FiServer,
} from "react-icons/fi";
import Head from "../Components/Head";
import PageContainer from "../CommonComponents/PageContainer";
import SectionTitle from "../CommonComponents/SectionTitle";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
    });
    AOS.refresh();
  }, []);

  const sections = [
    { id: "overview", label: "1. Overview & Commitment", icon: FiShield },
    { id: "collection", label: "2. Information We Collect", icon: FiDatabase },
    { id: "usage", label: "3. How We Use Information", icon: FiFileText },
    { id: "security", label: "4. Data Security & Storage", icon: FiLock },
    { id: "cookies", label: "5. Cookies & Tracking", icon: FiEye },
    { id: "sharing", label: "6. Third-Party Sharing", icon: FiShare2 },
    { id: "rights", label: "7. Your Privacy Rights", icon: FiUserCheck },
    { id: "retention", label: "8. Data Retention Policy", icon: FiRefreshCw },
    { id: "contact", label: "9. Contact & Inquiries", icon: FiMail },
  ];

  const highlights = [
    {
      icon: FiLock,
      title: "Bank-Grade Encryption",
      desc: "All client data and communications are encrypted using standard SSL/TLS and modern cryptographic protocols.",
    },
    {
      icon: FiShield,
      title: "Zero Unauthorized Selling",
      desc: "We never sell, rent, or trade your personal or business data to any third-party marketing entities.",
    },
    {
      icon: FiUserCheck,
      title: "Complete User Control",
      desc: "You retain full ownership of your data with unconditional rights to request access, modification, or erasure.",
    },
    {
      icon: FiServer,
      title: "Secure Infrastructure",
      desc: "Hosted on resilient cloud architecture with multi-layered firewalls and automated threat detection.",
    },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── HERO BANNER ── */}
      <Head
        title="Privacy Policy"
        subtitle={
          <>
            <Link className="text-lg font-semibold text-white transition hover:text-[#FF6A00]" to="/">
              Home
            </Link>
            <IoIosArrowForward className="mx-1 text-lg font-bold text-white" />
            <Link className="text-lg font-semibold text-white transition hover:text-[#FF6A00]" to="/privacy-policy">
              Privacy Policy
            </Link>
          </>
        }
      />

      {/* ── MAIN CONTENT (CYBERPUNK BLACK & ORANGE THEME) ── */}
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

        <PageContainer className="relative z-10 py-16 lg:py-20">
          {/* Header Section */}
          <SectionTitle
            subtitle="LEGAL & TRANSPARENCY"
            title="PRIVACY"
            highlight="POLICY"
            description="At Q-Techx Solutions, we are dedicated to protecting your privacy and safeguarding your personal, business, and project data. This policy details how we collect, handle, and secure your information across our web applications, services, and client portals."
            align="center"
          />


          {/* Quick Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  data-aos="fade-up"
                  data-aos-delay={idx * 100}
                  className="group relative rounded-2xl border border-white/10 bg-[#11171c]/70 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6A00]/50 hover:bg-[#11171c] hover:shadow-[0_10px_30px_rgba(255,106,0,0.15)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#FF6A00]/30 bg-[#FF6A00]/10 text-xl text-[#FF6A00] transition-colors group-hover:border-[#FF6A00] group-hover:bg-[#FF6A00] group-hover:text-white">
                    <Icon />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/70">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Content Layout with Sidebar Table of Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Navigation Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28 rounded-2xl border border-white/10 bg-[#11171c]/80 p-6 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <FiFileText className="text-[#FF6A00]" />
                  Table of Contents
                </h2>
                <div className="mb-4 h-[2px] w-10 bg-[#FF6A00]" />
                <nav className="space-y-1">
                  {sections.map((sec) => {
                    const SecIcon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs sm:text-sm font-medium transition-all duration-200 ${isActive
                            ? "border border-[#FF6A00]/40 bg-[#FF6A00]/15 text-[#FF6A00] font-semibold"
                            : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                          }`}
                      >
                        <SecIcon
                          className={`text-base shrink-0 transition-colors ${isActive ? "text-[#FF6A00]" : "text-white/40 group-hover:text-[#FF6A00]"
                            }`}
                        />
                        <span className="truncate">{sec.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Direct Contact Box inside Sidebar */}
                <div className="mt-8 rounded-xl border border-[#FF6A00]/20 bg-[#FF6A00]/5 p-4 text-center">
                  <FiHelpCircle className="mx-auto text-2xl text-[#FF6A00] mb-2" />
                  <h4 className="text-sm font-semibold text-white">Have Privacy Concerns?</h4>
                  <p className="text-xs text-white/60 mt-1 mb-3">
                    Our compliance team is here to assist with any questions or data requests.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#FF6A00] px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#ff7e1d] shadow-[0_4px_15px_rgba(255,106,0,0.3)]"
                  >
                    <span>Contact Privacy Officer</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Policy Details Content */}
            <main className="lg:col-span-8 space-y-12">
              {/* 1. Overview */}
              <section
                id="overview"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiShield className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    1. Overview & Our Commitment
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    Welcome to <strong className="text-white">Q-Techx Solutions</strong> ("Company", "we", "us", or "our"). We deliver premier enterprise IT solutions, web and mobile software development, cloud services, and technical consulting.
                  </p>
                  <p>
                    We recognize that privacy is a fundamental right. We are dedicated to maintaining the confidentiality, integrity, and security of the personal and business data entrusted to us by our clients, job applicants, website visitors, and partners.
                  </p>
                  <p>
                    This Privacy Policy outlines the types of information we collect, how it is utilized, the stringent security protocols we maintain, and your rights concerning your personal information.
                  </p>
                </div>
              </section>

              {/* 2. Information We Collect */}
              <section
                id="collection"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiDatabase className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    2. Information We Collect
                  </h2>
                </div>
                <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    Depending on how you interact with our platform, services, or communication channels, we collect the following categories of information:
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-4">
                      <h3 className="font-semibold text-white flex items-center gap-2 mb-2 text-sm sm:text-base">
                        <FiCheckCircle className="text-[#FF6A00]" />
                        A. Information You Voluntarily Provide
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-white/70 text-xs sm:text-sm">
                        <li>
                          <strong className="text-white/90">Contact Inquiries:</strong> Full name, corporate email address, phone number, organization name, project scope, and message contents submitted via contact or quotation forms.
                        </li>
                        <li>
                          <strong className="text-white/90">Career & Job Applications:</strong> Resumes/CVs, portfolios, educational history, work experience, cover letters, and contact details submitted through our job application portal.
                        </li>
                        <li>
                          <strong className="text-white/90">Client Account & Portal Data:</strong> Authentication credentials (usernames and encrypted passwords), role permissions, project specifications, invoice records, and task comments.
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-4">
                      <h3 className="font-semibold text-white flex items-center gap-2 mb-2 text-sm sm:text-base">
                        <FiCheckCircle className="text-[#FF6A00]" />
                        B. Automated Technical & Device Information
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-white/70 text-xs sm:text-sm">
                        <li>
                          <strong className="text-white/90">Device & Connection Data:</strong> IP address, operating system, browser type and version, language settings, and screen resolution.
                        </li>
                        <li>
                          <strong className="text-white/90">Usage Analytics:</strong> Pages visited, interaction duration, click patterns, referring URLs, and error logs for diagnostic optimization.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. How We Use Information */}
              <section
                id="usage"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiFileText className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    3. How We Use Your Information
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    Q-Techx Solutions processes collected data strictly for legitimate operational and business purposes:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {[
                      { title: "Service Delivery & Execution", text: "Architecting, developing, deploying, and maintaining tailored software, web applications, and IT consulting solutions." },
                      { title: "Client Communication", text: "Providing project updates, sprint reviews, milestone deliveries, quotation estimates, and administrative billing." },
                      { title: "Talent Acquisition", text: "Evaluating qualifications, conducting candidate reviews, and scheduling interviews for open career positions." },
                      { title: "Platform Security & Maintenance", text: "We take appropriate security measures to protect our platform, prevent unauthorized access, monitor suspicious activity, and promptly address technical issues." },
                      { title: "Legal & Regulatory Compliance", text: "Complying with applicable tax, financial, and data retention regulations under governing legal frameworks." },
                      { title: "Experience Optimization", text: "Enhancing user interface responsiveness, navigation structure, and delivering relevant technical content." },
                    ].map((useCase, index) => (
                      <div key={index} className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#FF6A00] mb-1">
                          {useCase.title}
                        </h4>
                        <p className="text-xs text-white/70">
                          {useCase.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 4. Data Security */}
              <section
                id="security"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiLock className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    4. Data Security & Storage Standards
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    We deploy robust physical, organizational, and technological safeguards to prevent unauthorized access, alteration, disclosure, or destruction of your personal data:
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    <li className="flex items-start gap-2.5">
                      <FiCheckCircle className="text-[#FF6A00] mt-1 shrink-0" />
                      <span><strong className="text-white">Cryptographic Protection:</strong> We use encryption to protect your information while it is being transmitted and stored, helping keep your data secure from unauthorized access.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FiCheckCircle className="text-[#FF6A00] mt-1 shrink-0" />
                      <span><strong className="text-white">Role-Based Access Controls (RBAC):</strong> Restricted internal access granted strictly on a need-to-know basis with multi-factor authentication (MFA).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FiCheckCircle className="text-[#FF6A00] mt-1 shrink-0" />
                      <span><strong className="text-white">Regular Vulnerability Audits:</strong> Continuous code reviews, automated dependency security scanning, and server hardening.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <FiCheckCircle className="text-[#FF6A00] mt-1 shrink-0" />
                      <span><strong className="text-white">Data Backups:</strong> Automated, encrypted off-site cloud backups with fast disaster recovery mechanisms.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 5. Cookies & Tracking */}
              <section
                id="cookies"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiEye className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    5. Cookies & Tracking Technologies
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    Our web application uses cookies and similar storage technologies to preserve your preferences, maintain secure session states, and monitor performance.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="font-semibold text-white text-xs sm:text-sm mb-1">Essential Cookies</h4>
                      <p className="text-xs text-white/60">Required for authentication tokens, routing, and fundamental security operations.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="font-semibold text-white text-xs sm:text-sm mb-1">Performance Cookies</h4>
                      <p className="text-xs text-white/60">Help us analyze loading times, user journeys, and feature adoption rates.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="font-semibold text-white text-xs sm:text-sm mb-1">Preference Cookies</h4>
                      <p className="text-xs text-white/60">Remember interface configurations, dashboard settings, and UI preferences.</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60">
                    You can manage or disable cookies at any time via your browser settings. Note that disabling essential cookies may impact certain platform features.
                  </p>
                </div>
              </section>

              {/* 6. Third-Party Sharing */}
              <section
                id="sharing"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiShare2 className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    6. Third-Party Sharing & Disclosure
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    <strong className="text-white">We do not sell, rent, or trade your personal data.</strong> We only share information with trusted third parties under strict confidentiality and data-protection terms:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-white/70 text-xs sm:text-sm">
                    <li>
                      <strong className="text-white/90">Cloud & Infrastructure Providers:</strong> Secure hosting environments (such as AWS, Google Cloud, or Azure) subject to strict enterprise data privacy agreements.
                    </li>
                    <li>
                      <strong className="text-white/90">Communication & Notification Services:</strong> Trusted transactional messaging gateways (e.g. EmailJS, SMTP providers) solely for delivering service confirmations and inquiries.
                    </li>
                    <li>
                      <strong className="text-white/90">Legal Compliance:</strong> When required by statutory law, court subpoenas, or legal processes to protect rights, safety, and property.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 7. Your Privacy Rights */}
              <section
                id="rights"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiUserCheck className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    7. Your Privacy Rights & Choices
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    Regardless of your geographic location, we provide comprehensive rights over your personal data:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Right to Access & Portability</h4>
                      <p className="text-xs text-white/70">Request a complete copy of the personal information we hold regarding your account or organization.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Right to Rectification</h4>
                      <p className="text-xs text-white/70">Request correction or updates to any inaccurate, outdated, or incomplete personal details.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Right to Erasure ("To Be Forgotten")</h4>
                      <p className="text-xs text-white/70">Request the permanent deletion of your personal data where retention is no longer legally mandated.</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.07] bg-[#0b0f14] p-3.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-white mb-1">Right to Withdraw Consent</h4>
                      <p className="text-xs text-white/70">Opt-out of promotional communications or revoke prior consent for data processing at any time.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 8. Data Retention */}
              <section
                id="retention"
                data-aos="fade-up"
                className="rounded-2xl border border-white/10 bg-[#11171c]/60 p-6 sm:p-8 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    <FiRefreshCw className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    8. Data Retention & Policy Updates
                  </h2>
                </div>
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-white/80">
                  <p>
                    We retain personal data only for as long as necessary to fulfill the operational purposes described in this policy, support active client project agreements, resolve disputes, and comply with legal obligations.
                  </p>
                  <p>
                    We periodically review and update this Privacy Policy to reflect changing regulatory requirements or technological enhancements. When significant modifications occur, we will update the version number and effective date at the top of this page.
                  </p>
                </div>
              </section>

              {/* 9. Contact & Inquiries */}
              <section
                id="contact"
                data-aos="fade-up"
                className="rounded-2xl border border-[#FF6A00]/30 bg-gradient-to-br from-[#11171c] to-[#0b0f14] p-6 sm:p-8 backdrop-blur-md shadow-[0_10px_40px_rgba(255,106,0,0.1)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF6A00] text-white shadow-[0_0_15px_rgba(255,106,0,0.5)]">
                    <FiMail className="text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    9. Contact Our Data Protection Officer
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
                  If you have inquiries, privacy feedback, or would like to exercise any of your data rights, please contact our compliance desk:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#03070a]/60 p-4">
                    <FiMapPin className="text-[#FF6A00] mt-1 shrink-0 text-base" />
                    <div>
                      <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Office Location</h4>
                      <p className="text-xs sm:text-sm text-white mt-0.5">
                        No.58 Vaitheeshwaran Nagar, Tirupattur - 635653
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#03070a]/60 p-4">
                    <FiMail className="text-[#FF6A00] mt-1 shrink-0 text-base" />
                    <div>
                      <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email Inquiries</h4>
                      <a
                        href="mailto:info@qtechx.com"
                        className="text-xs sm:text-sm text-white hover:text-[#FF6A00] transition mt-0.5 block"
                      >
                        info@qtechx.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#03070a]/60 p-4">
                    <FiPhone className="text-[#FF6A00] mt-1 shrink-0 text-base" />
                    <div>
                      <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Direct Line</h4>
                      <a
                        href="tel:+919597293504"
                        className="text-xs sm:text-sm text-white hover:text-[#FF6A00] transition mt-0.5 block"
                      >
                        +91 95972 93504
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                  {/* <span className="text-xs text-white/50">
                    Response timeline: Typically within 24 to 48 business hours.
                  </span> */}
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A00] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:bg-[#ff7e1d] hover:shadow-[0_4px_20px_rgba(255,106,0,0.4)]"
                  >
                    <span>Submit Privacy Query</span>
                    <FiArrowRight />
                  </Link>
                </div>
              </section>
            </main>
          </div>
        </PageContainer>
      </div>
    </>
  );
};

export default PrivacyPolicy;
