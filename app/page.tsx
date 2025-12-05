"use client";

import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState, useMemo, useRef, useEffect } from "react";
import SearchInput from "@/components/SearchInput";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  Building,
  FileText,
  Info,
  Landmark,
  Layers,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  Target,
} from "lucide-react";
import { servicesData, propertyTypesData, locationsData } from "@/data";
import { BRAND_NAME, PHONE, ADDRESS, PROPERTY_TYPES as PROPERTY_TYPES_CONSTANTS, SERVICES as SERVICES_CONSTANTS } from "@/lib/constants";
import { getLocationImagePath, getPropertyTypeImagePath } from "@/lib/image-utils";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";

// Extend window type for Turnstile
declare global {
  interface Window {
    _turnstileLoaded?: boolean;
    _lastTurnstileToken?: string;
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string, options?: Record<string, unknown>) => Promise<string>;
      reset: (widgetId: string) => void;
    };
  }
}

const PRIMARY_BRAND_COLOR = "#0f2d4c";
const ACCENT_COLOR = "#f5b544";
const HAS_STAFFED_OFFICE = true;

// Combine property types first, then services
const PROJECT_TYPES = [
  ...PROPERTY_TYPES_CONSTANTS.map(pt => pt.name),
  ...SERVICES_CONSTANTS.map(s => s.title),
  "Other"
];

type Service = { title: string; description: string; href: string };
type PropertyType = { title: string; benefit: string; href: string; slug: string };
type CityItem = { name: string; description: string; slug: string };
type FAQ = { question: string; answer: string };

// Map servicesData to the expected format for the home page
const SERVICES: readonly Service[] = servicesData
  .filter(service => ['timelines', 'structures', 'execution'].includes(service.category))
  .slice(0, 5)
  .map(service => ({
    title: service.name,
    description: service.short,
    href: `/services/${service.route}`,
  }));

// Map propertyTypesData to the expected format for the home page
const PROPERTY_TYPES: readonly PropertyType[] = propertyTypesData
  .slice(0, 6)
  .map(propertyType => {
    const benefitMap: Record<string, string> = {
      multifamily: "Stable rental income with professional management options for hands-off ownership opportunities.",
      "triple-net-retail": "Credit-rated corporate tenants provide guaranteed monthly cash flow with zero management responsibilities.",
      "industrial-flex": "Essential logistics businesses with long-term leases and recession-resistant tenant bases.",
      "medical-office": "Healthcare providers offer stable occupancy with corporate tenant reliability and lease guarantees.",
      "dst-tic": "Fractional ownership provides passive income diversification with institutional-quality NNN lease properties.",
      "self-storage": "Automated operations and consistent demand create reliable passive income streams.",
    };

    return {
      title: propertyType.name,
      benefit: benefitMap[propertyType.slug] || "Strategic property investment opportunity for 1031 exchange investors.",
      href: `/property-types/${propertyType.route}`,
      slug: propertyType.slug,
    };
  });

// Map locationsData to the expected format for the home page
const CA_CITIES_SLUGS: readonly CityItem[] = locationsData
  .slice(0, 6)
  .map(location => {
    const descriptionMap: Record<string, string> = {
      "downtown-los-angeles": "Exchange support for adaptive reuse towers, mixed-use redevelopments, and Opportunity Zone parcels.",
      "century-city": "Corporate headquarters and medical office properties in the heart of LA's business district.",
      "hollywood": "Entertainment industry properties and creative office spaces in Hollywood CA.",
      "beverly-hills": "Luxury retail and office properties with high-net-worth investor focus.",
      "west-hollywood": "Guidance for boutique hospitality and creative office reinvestments with tight deadline management.",
      "culver-city": "Tech and media company headquarters with modern office and flex properties.",
      "santa-monica": "Coastal advisory for hospitality, retail, and multifamily repositioning along the Silicon Beach corridor.",
      "venice": "Beachfront commercial and residential properties in Venice CA.",
      "marina-del-rey": "Marina and waterfront commercial properties in Marina Del Rey CA.",
      "malibu": "Exclusive coastal properties and luxury estates in Malibu CA.",
      "burbank": "Media and entertainment industry properties in Burbank CA.",
      "glendale": "Investor services for corporate headquarters relocations and Class A office dispositions.",
      "pasadena": "Historic district compliance with attorney partnerships for legacy wealth transitions.",
      "san-fernando-valley": "Affordable commercial properties and industrial spaces across the San Fernando Valley.",
      "long-beach": "Port-adjacent logistics exchanges and mixed-use waterfront developments across Los Angeles County.",
      "torrance": "South Bay commercial and industrial properties in Torrance CA.",
      "redondo-beach": "Beach city commercial properties and retail spaces in Redondo Beach CA.",
      "manhattan-beach": "Upscale beach city properties and commercial real estate in Manhattan Beach CA.",
      "pomona": "Inland Empire commercial and industrial properties in Pomona CA.",
      "rancho-cucamonga": "Growing Inland Empire market with commercial and industrial opportunities.",
      "ontario": "Airport-adjacent logistics and distribution properties in Ontario CA.",
      "irvine": "Orange County-adjacent properties with corporate office and R&D facilities.",
      "newport-beach": "Luxury coastal properties and high-end commercial real estate in Newport Beach CA.",
    };

    return {
      name: location.name,
      description: descriptionMap[location.slug] || `${location.type} properties available for 1031 exchange in ${location.name}.`,
      slug: location.route,
    };
  });

const FAQ_ITEMS: readonly FAQ[] = [
  {
    question: "What makes triple net lease properties attractive investments?",
    answer:
      "NNN lease properties offer stable passive income through credit-rated corporate tenants who assume all property expenses, maintenance, and risks. These recession-proof businesses provide guaranteed monthly cash flow with zero management responsibilities for property owners.",
  },
  {
    question: "What types of businesses typically use triple net leases?",
    answer:
      "Essential service businesses dominate NNN leases including fast-food restaurants (Taco Bell, Wendy's), drug stores (Walgreens, CVS), convenience stores (7-Eleven), medical clinics, auto parts stores (AutoZone), dollar stores (Dollar General), car washes, and gas station-convenience store combinations.",
  },
  {
    question: "What are the different types of triple net leases?",
    answer:
      "Absolute NNN leases have tenants paying all expenses including taxes, insurance, and maintenance. Regular NNN leases are similar but may require landlords to cover some costs like roof repairs. Ground leases involve land-only rentals lasting 20-99 years where tenants pay all development costs.",
  },
  {
    question: "How do I evaluate tenant creditworthiness for NNN properties?",
    answer:
      "Review S&P and Moody's credit ratings, financial statements, business stability during economic downturns, and lease guarantees. Investment-grade rated tenants provide the highest security for passive income investments.",
  },
  {
    question: "What are the benefits of owning NNN lease properties?",
    answer:
      "NNN properties offer low entry barriers ($500K-$2M+), predictable monthly income with rent escalations, zero management responsibilities, tax advantages, and security not found in traditional investments. Corporate tenants assume all property risks.",
  },
  {
    question: "How does passive income work with triple net lease properties?",
    answer:
      "Property owners collect guaranteed monthly rent payments while tenants handle all property expenses, maintenance, and management. This creates truly passive income streams with corporate-level reliability and long-term lease guarantees (10-20+ years).",
  },
];

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_NAME,
  url: "https://www.1031exchangelosangeles.com/",
  logo: "https://www.1031exchangelosangeles.com/og-image.png",
  telephone: "+1-818-412-8402",
  address: HAS_STAFFED_OFFICE
    ? {
        "@type": "PostalAddress",
        streetAddress: ADDRESS.split(',')[0],
        addressLocality: "Los Angeles",
        addressRegion: "CA",
        postalCode: ADDRESS.split(',').slice(-1)[0].trim().split(' ')[1],
        addressCountry: "US",
      }
    : {
        "@type": "PostalAddress",
        addressLocality: "Los Angeles",
        addressRegion: "CA",
        addressCountry: "US",
      },
  sameAs: [
    "https://www.linkedin.com/company/pacific-equity-1031-advisors",
    "https://www.avvo.com/",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+1-818-412-8402",
      contactType: "customer service",
      areaServed: ["US-CA", "US-CA-Los Angeles"],
      availableLanguage: ["English"],
    },
  ],
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "1031 Exchange Los Angeles",
  url: "https://www.1031exchangelosangeles.com/",
  potentialAction: {
    "@type": "SearchAction",
    target:
      "https://www.1031exchangelosangeles.com/search?query={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const LOCAL_BUSINESS_SCHEMA = (() => {
  const baseSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.1031exchangelosangeles.com/#organization",
    name: BRAND_NAME,
    image: "https://www.1031exchangelosangeles.com/og-image.png",
    logo: "https://www.1031exchangelosangeles.com/og-image.png",
    url: "https://www.1031exchangelosangeles.com/",
    telephone: "+1-818-412-8402",
    email: "help@1031exchangelosangeles.com",
    address: HAS_STAFFED_OFFICE
      ? {
          "@type": "PostalAddress",
          streetAddress: ADDRESS.split(',')[0],
          addressLocality: "Los Angeles",
          addressRegion: "CA",
          postalCode: ADDRESS.split(',').slice(-1)[0].trim().split(' ')[1],
          addressCountry: "US",
        }
      : {
          "@type": "PostalAddress",
          addressLocality: "Los Angeles",
          addressRegion: "CA",
          addressCountry: "US",
        },
    priceRange: "$$",
    areaServed: [
      {
        "@type": "City",
        name: "Los Angeles",
        "@id": "https://www.wikidata.org/wiki/Q65",
      },
      {
        "@type": "State",
        name: "California",
        "@id": "https://www.wikidata.org/wiki/Q99",
      },
    ],
    serviceType: [
      "1031 Exchange Services",
      "Triple Net Lease Property Identification",
      "NNN Lease Property Investment",
      "Commercial Real Estate Advisory",
    ],
    description: "Expert triple net lease property identification connecting Los Angeles CA investors with credit-rated corporate tenants and passive income opportunities.",
  };

  if (HAS_STAFFED_OFFICE) {
    baseSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: "34.0522",
      longitude: "-118.2437",
    };
    baseSchema.openingHoursSpecification = [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ];
  }

  return baseSchema;
})();

type FormState = {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  timeline: string;
  details: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  company: "",
  email: "",
  phone: "",
  projectType: "",
  timeline: "",
  details: "",
};

const heroBackgroundStyle = {
  backgroundImage:
    "linear-gradient(140deg, rgba(15,45,76,0.96) 0%, rgba(15,45,76,0.82) 40%, rgba(245,181,68,0.28) 100%)",
};

const overlayStyle = {
  backgroundImage:
    "radial-gradient(circle at 20% 20%, rgba(245,181,68,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.14), transparent 45%)",
};

const glassPanelStyle = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
  borderColor: "rgba(255,255,255,0.18)",
  backdropFilter: "blur(14px)",
} as const;

function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window._turnstileLoaded) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );
    if (existing) {
      window._turnstileLoaded = true;
      return resolve();
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      window._turnstileLoaded = true;
      resolve();
    };
    s.onerror = () => {
      console.error("Failed to load Turnstile script");
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(s);
  });
}

// Removed cardMotion to fix SSR hydration issues

export default function Page(): JSX.Element {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [locationSearchQuery] = useState("");
  const [turnstileId, setTurnstileId] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const captchaRef = useRef<HTMLDivElement | null>(null);

  const heroCityNames = useMemo(
    () => CA_CITIES_SLUGS.map((city) => city.name).join(" • "),
    [],
  );

  const filteredCities = useMemo(() => {
    if (!locationSearchQuery.trim()) return CA_CITIES_SLUGS;
    return CA_CITIES_SLUGS.filter(city =>
      city.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
      city.description.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );
  }, [locationSearchQuery]);

  useEffect(() => {
    let cancelled = false;
    if (!TURNSTILE_SITE_KEY) return;

    const initTurnstile = async () => {
      try {
        await loadTurnstile();
        if (cancelled) return;

        const turnstile = window.turnstile;
        if (!turnstile || !captchaRef.current) {
          console.error("Turnstile not available");
          return;
        }

        const id: string = turnstile.render(captchaRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          size: "normal",
          callback: () => setTurnstileReady(true),
          "error-callback": () => setTurnstileReady(false),
          "timeout-callback": () => setTurnstileReady(false),
        });

        setTurnstileId(id);
        setTurnstileReady(true);
      } catch (error) {
        console.error("Failed to initialize Turnstile:", error);
        setTurnstileReady(false);
      }
    };

    initTurnstile();

    return () => {
      cancelled = true;
    };
  }, []);

  const validateForm = (state: FormState): FormErrors => {
    const newErrors: FormErrors = {};
    if (!state.name.trim()) {
      newErrors.name = "Please enter your full name.";
    }
    if (!state.email.trim()) {
      newErrors.email = "Please enter a valid email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
      newErrors.email = "Please enter a valid email format.";
    }
    if (!state.phone.trim()) {
      newErrors.phone = "Please provide a phone number.";
    }
    if (!state.projectType) {
      newErrors.projectType = "Please select a project type.";
    }
    if (!state.timeline) {
      newErrors.timeline = "Please select a timeline.";
    }
    if (!state.details.trim()) {
      newErrors.details = "Please provide details about your exchange goals.";
    }
    return newErrors;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    // Special handling for phone field - only allow numbers, spaces, dashes, and parentheses
    if (field === 'phone') {
      const phoneRegex = /[^0-9\s\-\(\)\+]/g;
      value = value.replace(phoneRegex, '');
    }

    setFormState(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setStatusMessage("");

    const validationErrors = validateForm(formState);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("error");
      setStatusMessage("Please complete all required fields.");
      return;
    }

    try {
      setStatus("loading");
      let turnstileToken = "";
      if (TURNSTILE_SITE_KEY) {
        if (!turnstileReady || !window.turnstile || !turnstileId) {
          setStatus("error");
          setStatusMessage("Please complete the security verification.");
          return;
        }

        try {
          window.turnstile!.reset(turnstileId);
          turnstileToken = await new Promise<string>((resolve, reject) => {
            window.turnstile!.execute(turnstileId, {
              async: true,
              action: "form_submit",
              callback: (token: string) => resolve(token),
              "error-callback": () => reject(new Error("turnstile-error")),
              "timeout-callback": () => reject(new Error("turnstile-timeout")),
            });
          });
        } catch (err) {
          console.error("Turnstile execution error:", err);
          setStatus("error");
          setStatusMessage("Security verification failed. Please try again.");
          return;
        }
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          phone: formState.phone.replace(/\D/g, ''),
          turnstileToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setStatus("success");
      setStatusMessage("Thank you for your inquiry. A member of our team will contact you within 24 hours.");
      setFormState(initialFormState);
      setErrors({});
      if (window.turnstile && turnstileId) {
        window.turnstile!.reset(turnstileId);
      }
    } catch {
      setStatus("error");
      setStatusMessage("There was an issue sending your message. Please try again or call us directly.");
      if (window.turnstile && turnstileId) {
        window.turnstile!.reset(turnstileId);
      }
    }
  };

  return (
    <>
      <Head>
        <link rel="canonical" href="https://www.1031exchangelosangeles.com/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_SCHEMA),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(FAQ_SCHEMA),
          }}
        />
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <header className="relative overflow-hidden mt-16 md:mt-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src="/1031-exchange-los-angeles-ca.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0"
            style={{
              ...heroBackgroundStyle,
              zIndex: 1,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              ...overlayStyle,
              zIndex: 2,
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32" style={{ zIndex: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-12"
            >
              <div className="flex flex-col gap-8 md:gap-10">
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-200">
                    1031 Exchange Los Angeles
                  </p>
                  <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
                    Los Angeles NNN Lease Property Experts
                  </h1>
                  <p className="mt-6 text-lg leading-relaxed text-slate-100/90 md:text-xl">
                    Whether you&apos;re seeking stable passive income or recession-proof investments, we identify triple net lease properties with credit-rated tenants providing guaranteed monthly cash flow and zero management responsibilities across Los Angeles CA.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-base font-medium shadow-lg transition-transform focus-visible:ring-2 focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    style={{
                      backgroundColor: ACCENT_COLOR,
                      color: PRIMARY_BRAND_COLOR,
                    }}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Call {PHONE}
                  </motion.a>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="#lead-form"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3 text-base font-medium text-white transition focus-visible:ring-2 focus-visible:ring-slate-100 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent hover:border-white/60 hover:bg-white/5"
                    >
                      Find NNN Properties
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </motion.div>
                </div>
              </div>
              <div
                className="rounded-3xl border px-6 py-6 shadow-lg md:px-8 md:py-7"
                style={glassPanelStyle}
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-3 text-sm text-white/85">
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/60">
                      <Target className="h-4 w-4" aria-hidden="true" />
                      NNN Property Assurance
                    </div>
                    <p className="text-base text-white/90">
                      Credit-rated tenants. Corporate guarantees. Zero management responsibilities.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-sm text-white/75 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center">
                      Investment-Grade Tenants
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center">
                      Corporate Guarantees
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center">
                      Passive Income Focus
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/30">
                {heroCityNames}
              </p>
            </motion.div>
          </div>
        </header>

        <main>
          <section className="bg-slate-950 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto flex max-w-3xl flex-col gap-4 text-center"
            >
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Why Choose {BRAND_NAME}
                </p>
                <h2 className="font-serif text-3xl text-white md:text-4xl">
                  Expert NNN lease property identification delivering passive income security and hands-off ownership.
                </h2>
                <p className="text-base leading-relaxed text-slate-300">
                  We connect Los Angeles CA investors with investment-grade triple net lease properties featuring credit-rated tenants, guaranteed monthly cash flow, and zero management responsibilities.
                </p>
              </motion.div>
              <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Investment-Grade Tenant Selection & Verification",
                    description:
                      "Connect with S&P and Moody-rated corporate tenants including fast-food chains, drug stores, and medical companies with proven recession resistance. Verify tenant creditworthiness and lease terms ensuring long-term stability (10-20+ years) and predictable income streams.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Triple Net Lease Structure Analysis",
                    description:
                      "Evaluate absolute NNN, regular NNN, and ground lease options to identify properties where tenants assume all expenses and risks.",
                    icon: FileText,
                  },
                  {
                    title: "Passive Income Optimization",
                    description:
                      "Structure acquisitions for guaranteed monthly cash flow with annual rent escalations and minimal landlord responsibilities.",
                    icon: Calculator,
                  },
                  {
                    title: "Los Angeles Market Intelligence",
                    description:
                      "Navigate Southern California commercial real estate with deep knowledge of essential service businesses and property availability.",
                    icon: Landmark,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    whileHover={{ y: -6 }}
                  >
                    <item.icon
                      className="h-10 w-10"
                      style={{ color: ACCENT_COLOR }}
                      aria-hidden="true"
                    />
                    <h3 className="mt-6 font-serif text-xl text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-6 md:px-8 md:py-7">
                <p className="text-sm text-slate-300">
                  Triple net lease properties offer investors stable passive income through credit-rated corporate tenants. While NNN investments can be part of tax-advantaged strategies, they do not guarantee specific tax outcomes. Review the{" "}
                  <Link
                    href="https://ttc.lacounty.gov/documentary-transfer-tax/"
                    className="text-slate-100 underline decoration-2 underline-offset-4"
                  >
                    Los Angeles County documentary transfer tax guidance
                  </Link>{" "}
                  and consult qualified tax professionals for your specific situation.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
              >
                <div className="max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                    NNN Lease Investment Process
                  </p>
                  <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                    Identify credit-rated tenants, verify lease terms, and secure passive income properties.
                  </h2>
                </div>
                <div className="flex gap-4 text-sm text-slate-300">
                  <Link
                    href="https://www.irs.gov/forms-pubs/about-form-8824"
                    className="inline-flex items-center gap-2 underline decoration-2 underline-offset-4 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    IRS Form 8824
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="https://www.irs.gov/tax-professionals/like-kind-exchanges-under-irc-code-section-1031"
                    className="inline-flex items-center gap-2 underline decoration-2 underline-offset-4 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Like-Kind Property Rules
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {[
                  {
                    title: "Evaluate tenant creditworthiness",
                    description:
                      "Research corporate tenant financial strength, S&P/Moody ratings, and business stability across economic cycles.",
                    icon: ShieldCheck,
                  },
                  {
                    title: "Analyze lease structures",
                    description:
                      "Review absolute NNN vs regular NNN terms, rent escalation clauses, and expense responsibility assignments.",
                    icon: FileText,
                  },
                  {
                    title: "Secure passive income properties",
                    description:
                      "Identify recession-proof businesses with guaranteed monthly cash flow and zero management requirements.",
                    icon: Target,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-sm"
                  >
                    <item.icon
                      className="h-9 w-9"
                      style={{ color: ACCENT_COLOR }}
                      aria-hidden="true"
                    />
                    <h3 className="mt-5 font-serif text-xl text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-6 md:px-8 md:py-7">
                <p className="text-sm text-slate-300">
                  Vacation rentals and mixed-use personal residences require special handling. Review{" "}
                  <Link
                    href="https://www.irs.gov/irb/2008-16_IRB#RP-2008-16"
                    className="text-slate-100 underline decoration-2 underline-offset-4"
                  >
                    Rev. Proc. 2008-16
                  </Link>{" "}
                  to align personal use limits with IRS safe harbor provisions.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-950 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  NNN Property Services
                </p>
                <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                  Comprehensive triple net lease property identification and acquisition support across Los Angeles CA.
                </h2>
              </motion.div>
              <div className="mt-14 grid gap-8 md:grid-cols-2">
                {SERVICES.map((service) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-xl text-white">
                        {service.title}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-slate-500" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {service.description}
                    </p>
                    <Link
                      href={service.href}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-100 underline decoration-2 underline-offset-4 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      View service detail
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10">
                <Link
                  href="/services/"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-5 py-3 text-sm font-medium text-slate-100 hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  See all services
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Property Types
                </p>
                <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                  Discover triple net lease opportunities across essential service businesses with credit-rated corporate tenants.
                </h2>
              </motion.div>
              <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {PROPERTY_TYPES.map((property) => (
                  <motion.div
                    key={property.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7 shadow transition hover:-translate-y-1 hover:shadow-lg relative overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.8)), url(${getPropertyTypeImagePath(property.slug)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <Layers
                      className="h-8 w-8"
                      style={{ color: ACCENT_COLOR }}
                      aria-hidden="true"
                    />
                    <h3 className="mt-5 font-serif text-lg text-white">
                      {property.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {property.benefit}
                    </p>
                    <Link
                      href={property.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-100 underline decoration-2 underline-offset-4 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                    >
                      Learn more
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-10">
                <Link
                  href="/property-types/"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-5 py-3 text-sm font-medium text-slate-100 hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Explore property types
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          <section className="bg-slate-950 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Los Angeles Coverage
                </p>
                <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                  Comprehensive NNN lease property identification across every Los Angeles CA submarket.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  {BRAND_NAME} connects investors with triple net lease properties featuring credit-rated tenants from Downtown LA to the Inland Empire. Our extensive market knowledge ensures access to recession-proof businesses with guaranteed income streams.
                </p>

                {/* Location Search */}
                <div className="mt-6 max-w-md">
                  <SearchInput
                    placeholder="Search Los Angeles areas..."
                    items={CA_CITIES_SLUGS.map(city => ({
                      title: city.name,
                      slug: city.slug,
                      description: city.description,
                      href: `/locations/${city.slug}`,
                    }))}
                    onNoResults={(query) => {
                      window.location.href = `/contact?project_type=Other&location=${encodeURIComponent(query)}`;
                    }}
                  />
                </div>
              </motion.div>
              <div className="mt-14 grid gap-8 md:grid-cols-2">
                {filteredCities.length > 0 ? filteredCities.map((city) => (
                  <motion.div
                    key={city.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 relative overflow-hidden"
                    style={{
                      backgroundImage: `linear-gradient(rgba(15,23,42,0.8), rgba(15,23,42,0.8)), url(${getLocationImagePath(city.slug)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin
                        className="mt-1 h-5 w-5"
                        style={{ color: ACCENT_COLOR }}
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-serif text-lg text-white">
                          {city.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {city.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link
                        href={`/locations/${city.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-100 underline decoration-2 underline-offset-4 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        View location detail
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="col-span-full text-center py-12"
                  >
                    <div className="max-w-md mx-auto">
                      <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="font-serif text-xl text-white mb-2">
                        No areas found
                      </h3>
                      <p className="text-slate-400 mb-6">
                        We couldn&apos;t find &quot;{locationSearchQuery}&quot; in Los Angeles CA, but we serve many other areas.
                      </p>
                      <Link
                        href={`/contact?project_type=Other&location=${encodeURIComponent(locationSearchQuery)}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                      >
                        Contact for Other Areas
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/locations/"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-5 py-3 text-sm font-medium text-slate-100 hover:bg-slate-800/60 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  See locations
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <p className="text-sm text-slate-400">
                  Service available statewide, including Orange County, San Diego County, and Northern California exchanges.
                </p>
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="bg-slate-900 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <h2 className="font-serif text-3xl text-white md:text-4xl mb-4">
                  Free NNN Property Tools
                </h2>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                  Educational calculators and resources to help Los Angeles CA investors evaluate
                  triple net lease opportunities. These tools provide analysis and guidance for
                  identifying passive income properties with credit-rated corporate tenants.
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-900/20 to-blue-800/20 p-8 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link href="/tools/boot-calculator" className="block">
                    <Calculator className="mb-4 h-12 w-12 text-blue-400" />
                    <h3 className="mb-2 text-2xl font-semibold">Boot Calculator</h3>
                    <p className="text-slate-100 mb-4">
                      Calculate boot and estimate tax implications from cash received, mortgage relief, and non-like-kind property.
                    </p>
                    <div className="flex items-center text-sm font-medium text-blue-300 group-hover:text-blue-200">
                      Use Calculator <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-green-900/20 to-green-800/20 p-8 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link href="/tools/exchange-cost-estimator" className="block">
                    <Receipt className="mb-4 h-12 w-12 text-green-400" />
                    <h3 className="mb-2 text-2xl font-semibold">Exchange Cost Estimator</h3>
                    <p className="text-slate-100 mb-4">
                      Estimate QI fees, escrow costs, title insurance, and recording fees for Los Angeles County exchanges.
                    </p>
                    <div className="flex items-center text-sm font-medium text-green-300 group-hover:text-green-200">
                      Use Estimator <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="group rounded-2xl border border-slate-800 bg-gradient-to-br from-purple-900/20 to-purple-800/20 p-8 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link href="/tools/identification-rules-checker" className="block">
                    <Target className="mb-4 h-12 w-12 text-purple-400" />
                    <h3 className="mb-2 text-2xl font-semibold">Identification Rules Checker</h3>
                    <p className="text-slate-100 mb-4">
                      Validate replacement property identification against IRS Three Property, 200%, and 95% Rules.
                    </p>
                    <div className="flex items-center text-sm font-medium text-purple-300 group-hover:text-purple-200">
                      Use Validator <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 text-center"
              >
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-100 hover:bg-slate-800/60 transition-colors"
                >
                  View All Tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </section>

          <section className="bg-slate-950 py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  Frequently Asked Questions
                </p>
                <h2 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                  Comprehensive answers for investors exploring triple net lease properties and passive income opportunities.
                </h2>
              </motion.div>
              <div className="mt-12 divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-900/60">
                {FAQ_ITEMS.map((faq, index) => (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="p-8"
                  >
                    <div className="flex items-start gap-4">
                      <InfoBadge />
                      <div>
                        <h3 className="font-serif text-xl text-white">
                          {faq.question}
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                    {index < FAQ_ITEMS.length - 1 && (
                      <div className="mt-8 h-px bg-slate-800/80" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="lead-form"
            className="bg-slate-900 py-20 md:py-28"
            aria-labelledby="lead-form-title"
          >
            <div className="mx-auto max-w-7xl px-6 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="grid gap-12 lg:grid-cols-2"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                    Start the Conversation
                  </p>
                  <h2
                    id="lead-form-title"
                    className="mt-3 font-serif text-3xl text-white md:text-4xl"
                  >
                    Request a confidential consultation to discover Los Angeles CA NNN lease opportunities.
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-300">
                    Share your investment goals and we will identify triple net lease properties with credit-rated corporate tenants providing guaranteed passive income. Same-day responses for serious investors.
                  </p>
                  <div className="mt-8 flex flex-col gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      <span>Call us at {PHONE}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      <span>
                        Service area: Los Angeles County, Orange County, San Diego County, San Francisco Bay Area
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-slate-400" aria-hidden="true" />
                      <span>Complimentary timeline outline with every consultation</span>
                    </div>
                  </div>
                </div>

                <motion.form
                  onSubmit={handleSubmit}
                  method="post"
                  action="/api/contact"
                  noValidate
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 shadow-lg"
                >
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label="Name"
                        id="name"
                        type="text"
                        value={formState.name}
                        onChange={(value) => handleInputChange("name", value)}
                        error={errors.name}
                        required
                        autoComplete="name"
                      />

                      <FormField
                        label="Company (Optional)"
                        id="company"
                        type="text"
                        value={formState.company}
                        onChange={(value) => handleInputChange("company", value)}
                        autoComplete="organization"
                      />
                    </div>

                    <FormField
                      label="Email"
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={(value) => handleInputChange("email", value)}
                      error={errors.email}
                      required
                      autoComplete="email"
                    />

                    <FormField
                      label="Phone"
                      id="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={(value) => handleInputChange("phone", value)}
                      error={errors.phone}
                      required
                      autoComplete="tel"
                    />

                    <FormField
                      label="Project Type"
                      id="projectType"
                      type="select"
                      value={formState.projectType}
                      onChange={(value) => handleInputChange("projectType", value)}
                      error={errors.projectType}
                      required
                      options={PROJECT_TYPES}
                    />

                    <FormField
                      label="Timeline"
                      id="timeline"
                      type="select"
                      value={formState.timeline}
                      onChange={(value) => handleInputChange("timeline", value)}
                      error={errors.timeline}
                      required
                      options={[
                        "Immediately (within 30 days)",
                        "Within 3 months",
                        "Within 6 months",
                        "6+ months",
                        "Just researching options"
                      ]}
                    />

                    <FormField
                      label="Project Details"
                      id="details"
                      type="textarea"
                      value={formState.details}
                      onChange={(value) => handleInputChange("details", value)}
                      error={errors.details}
                      required
                      rows={4}
                      helper="Describe your property being sold, budget range, and specific requirements."
                    />
                  </div>
                  {TURNSTILE_SITE_KEY ? (
                    <div className="flex justify-center">
                      <div ref={captchaRef} className="min-h-[78px]" />
                    </div>
                  ) : null}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold focus-visible:ring-2 focus-visible:ring-slate-50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: ACCENT_COLOR,
                      color: PRIMARY_BRAND_COLOR,
                    }}
                    disabled={status === "loading" || (!!TURNSTILE_SITE_KEY && !turnstileReady)}
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.button>

                  {statusMessage && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      status === "success"
                        ? "bg-green-500/10 border border-green-500/20 text-green-300"
                        : "bg-red-500/10 border border-red-500/20 text-red-300"
                    }`}>
                      {statusMessage}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-slate-400 text-center" id="form-compliance">
                    Educational content only. Not tax or legal advice.
                  </p>
                </motion.form>
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-900/60 bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
            <div className="grid gap-12 md:grid-cols-4">
              <div className="flex flex-col gap-4">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                  {BRAND_NAME}
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                  Expert triple net lease property identification connecting Los Angeles CA investors with credit-rated corporate tenants and passive income opportunities.
                </p>
                <Link
                  href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-100 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {PHONE}
                </Link>
                {HAS_STAFFED_OFFICE ? (
                  <div className="text-sm text-slate-400">
                    <p>722 S Broadway</p>
                    <p>Los Angeles, CA 90014</p>
                    <p>Monday to Friday, 8:00 AM to 6:00 PM PT</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Dedicated NNN lease specialists with comprehensive Los Angeles CA market coverage.
                  </p>
                )}
              </div>
              <div>
                <h3 className="font-serif text-lg text-white">Quick Links</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>
                    <Link
                      href="/services/"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/property-types/"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Property Types
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/locations/"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Locations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/resources/"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg text-white">Service Areas</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  {CA_CITIES_SLUGS.slice(0, 4).map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/locations/${city.slug}`}
                        className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/locations/"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      View full coverage
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg text-white">Compliance Resources</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>
                    <Link
                      href="https://www.irs.gov/forms-pubs/about-form-8824"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      IRS Form 8824 Instructions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.irs.gov/tax-professionals/like-kind-exchanges-under-irc-code-section-1031"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      IRS Like-Kind Exchanges Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.ftb.ca.gov/file/business/types/corporations/1031-like-kind-exchanges.html"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      California FTB 1031 Guidance
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://ttc.lacounty.gov/documentary-transfer-tax/"
                      className="hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      Los Angeles Documentary Transfer Tax
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-900/60 py-6">
              <div className="mx-auto flex flex-col gap-4 px-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-8">
                <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
                <p>
                  Nothing on this site constitutes legal, tax, or investment advice. Engage qualified professionals before executing a 1031 exchange.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function FormField(props: {
  label: string;
  id: keyof FormState;
  type: "text" | "email" | "tel" | "select" | "textarea";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  helper?: string;
  options?: string[];
  rows?: number;
}): JSX.Element {
  const {
    label,
    id,
    type,
    value,
    onChange,
    autoComplete,
    error,
    required,
    helper,
    options,
    rows,
  } = props;
  const inputClasses =
    "mt-2 w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = `${error ? errorId : ""}${helper ? ` ${helperId}` : ""}`.trim();

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
        {required ? <span style={{ color: ACCENT_COLOR }}>{" "}*</span> : null}
      </label>
      {type === "select" ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
        >
          <option value="">Select an option</option>
          {options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows || 4}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={inputClasses}
        />
      )}
      {helper ? (
        <p id={helperId} className="mt-2 text-xs text-slate-400">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function InfoBadge(): JSX.Element {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900/70">
      <InfoIcon />
    </div>
  );
}

function InfoIcon(): JSX.Element {
  return (
    <Info
      className="h-5 w-5"
      style={{ color: ACCENT_COLOR }}
      aria-hidden="true"
    />
  );
}

