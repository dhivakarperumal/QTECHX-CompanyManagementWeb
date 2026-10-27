import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://qtechx.com";
const SITE_NAME = "Q-Techx Solutions";
const DEFAULT_IMAGE = `${SITE_URL}/images/logo.png`;
const DEFAULT_KEYWORDS =
  "custom software development company, web development company, mobile app development, cloud solutions, SaaS development, digital transformation, enterprise software, AI software development, website development company, app development company, USA software company, UK software company, UAE software company, India software company, software company in India, software services in USA, software services in UK, software services in UAE, software services in India, custom software development in USA, custom software development in UK, custom software development in UAE, custom software development in India, software development in Tamil Nadu, software development in Chennai, software development in Coimbatore, software development in Madurai, software development in Trichy, software development in Salem, software development in Tirunelveli, software development in Thanjavur, software development in Vellore, software development in Erode, software development in Tiruppur, software development in Dindigul, software development in Kanyakumari, software development in Karur, software development in Krishnagiri, software development in Cuddalore, software development in Nagapattinam, software development in Theni, software development in Virudhunagar, software development in Namakkal, software development in Ramanathapuram, software development in Dharmapuri, software development in Pudukkottai, software development in Sivagangai, software development in Perambalur, software development in Ariyalur, software development in Thiruvannamalai, software development in Nilgiris, software development in Tuticorin, software development in Chengalpattu, software development in Mayiladuthurai, software development in Ranipet, software development in Tenkasi, software development in Villupuram, software development in Kallakurichi, software development in Andhra Pradesh, software development in Arunachal Pradesh, software development in Assam, software development in Bihar, software development in Chhattisgarh, software development in Goa, software development in Gujarat, software development in Haryana, software development in Himachal Pradesh, software development in Jharkhand, software development in Karnataka, software development in Kerala, software development in Madhya Pradesh, software development in Maharashtra, software development in Manipur, software development in Meghalaya, software development in Mizoram, software development in Nagaland, software development in Odisha, software development in Punjab, software development in Rajasthan, software development in Sikkim, software development in Telangana, software development in Tripura, software development in Uttar Pradesh, software development in Uttarakhand, software development in West Bengal, Q-Techx Solutions";

const pages = {
  "/": {
    title: "Q-Techx Solutions | Custom Software Development Company",
    description:
      "Q-Techx Solutions provides custom software development, web apps, mobile apps, cloud solutions, AI solutions, and digital transformation services for businesses across the USA, UK, UAE, and India, including major cities and Tamil Nadu districts.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/about": {
    title: "About Q-Techx Solutions | Global IT Partner",
    description:
      "Learn about Q-Techx Solutions and how we build scalable digital products for startups, SMEs, and enterprises across the USA, UK, UAE, and India.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/projects": {
    title: "Software Projects & Client Work | Q-Techx Solutions",
    description:
      "Explore software projects, web platforms, and digital solutions delivered by Q-Techx Solutions.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/prices": {
    title: "Software Development Pricing | Q-Techx Solutions",
    description:
      "Review pricing and engagement models for custom software, web development, mobile apps, and cloud solutions.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/contact": {
    title: "Contact Q-Techx Solutions | Start Your Project",
    description:
      "Contact Q-Techx Solutions to discuss custom software, web development, cloud, AI, and mobile app projects for clients in the USA, UK, UAE, and India.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/career": {
    title: "Careers at Q-Techx Solutions",
    description: "Explore exciting career opportunities and growth roles at Q-Techx Solutions.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/whychooseus": {
    title: "Why Choose Q-Techx Solutions | Trusted Tech Partner",
    description:
      "Discover why businesses choose Q-Techx Solutions for strategy, product development, and digital execution.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/whoweworkwith": {
    title: "Who We Work With | Q-Techx Solutions",
    description:
      "See the industries and business types that partner with Q-Techx Solutions for digital innovation.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/whatwedo": {
    title: "What We Do | Q-Techx Solutions",
    description:
      "Learn about the services Q-Techx Solutions offers, from software development to digital transformation.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/achievements": {
    title: "Our Achievements | Q-Techx Solutions",
    description:
      "View the milestones, success stories, and project impact delivered by Q-Techx Solutions.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/booknow": {
    title: "Book a Consultation | Q-Techx Solutions",
    description: "Book a consultation with Q-Techx Solutions to discuss your software development needs.",
    keywords: DEFAULT_KEYWORDS,
  },
  "/privacy-policy": {
    title: "Privacy Policy | Q-Techx Solutions",
    description:
      "Read the privacy policy for Q-Techx Solutions and understand how your information is handled.",
    keywords: DEFAULT_KEYWORDS,
  },
};

function setMetaTag(type, key, value) {
  const selector = type === "property" ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  element.setAttribute(type, key);
  element.setAttribute("content", value);
}

function setLinkTag(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

function getPageMeta(pathname) {
  if (pathname.startsWith("/services/")) {
    return {
      title: "Custom Software Services | Q-Techx Solutions",
      description:
        "Explore custom software services from Q-Techx Solutions, including web, mobile, cloud, and digital product development.",
      keywords: DEFAULT_KEYWORDS,
    };
  }

  if (pathname.startsWith("/apply/")) {
    return {
      title: "Apply for a Job | Q-Techx Solutions",
      description: "Apply for a role at Q-Techx Solutions and join a growing digital innovation team.",
      keywords: DEFAULT_KEYWORDS,
    };
  }

  return pages[pathname] || pages["/"];
}

export default function Seo() {
  const { pathname } = useLocation();
  const page = getPageMeta(pathname);
  const canonical = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

  useEffect(() => {
    document.title = page.title;

    setMetaTag("name", "description", page.description);
    setMetaTag("name", "keywords", page.keywords || DEFAULT_KEYWORDS);
    setMetaTag("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag("name", "author", SITE_NAME);
    setMetaTag("name", "publisher", SITE_NAME);
    setMetaTag("name", "language", "English");

    setLinkTag("canonical", canonical);

    document.querySelectorAll('meta[property^="og:"]').forEach((element) => element.remove());
    document.querySelectorAll('meta[name^="twitter:"]').forEach((element) => element.remove());

    const openGraph = {
      "og:type": "website",
      "og:site_name": SITE_NAME,
      "og:title": page.title,
      "og:description": page.description,
      "og:url": canonical,
      "og:image": DEFAULT_IMAGE,
      "og:image:alt": "Q-Techx Solutions logo",
      "og:locale": "en_US",
    };

    Object.entries(openGraph).forEach(([property, content]) => {
      const tag = document.createElement("meta");
      tag.setAttribute("property", property);
      tag.setAttribute("content", content);
      document.head.appendChild(tag);
    });

    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", page.title);
    setMetaTag("name", "twitter:description", page.description);
    setMetaTag("name", "twitter:image", DEFAULT_IMAGE);

    let schema = document.getElementById("qtechx-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "qtechx-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }

    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: DEFAULT_IMAGE,
          description:
            "Custom software, web, mobile, cloud, and enterprise technology solutions for global businesses.",
          areaServed: [
            { "@type": "Country", name: "United States" },
            { "@type": "Country", name: "United Kingdom" },
            { "@type": "Country", name: "United Arab Emirates" },
          ],
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            availableLanguage: ["English"],
            areaServed: ["US", "UK", "AE"],
          },
          sameAs: ["https://www.linkedin.com/in/q-techx-solutions-724346366/"],
        },
        {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description:
            "Q-Techx Solutions delivers custom software development and digital transformation services.",
          inLanguage: "en-US",
        },
      ],
    });
  }, [pathname, page]);

  return null;
}
