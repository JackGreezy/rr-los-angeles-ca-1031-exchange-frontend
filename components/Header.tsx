"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Phone,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { PHONE, SERVICES, LOCATIONS, PROPERTY_TYPES } from "@/lib/constants";

const Header = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isSticky, setIsSticky] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const locationsRef = useRef<HTMLDivElement>(null);
  const propertiesRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // On non-home pages, always use white text/logo
  const shouldUseWhiteText = !isHomePage || isSticky;

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
      if (
        locationsRef.current &&
        !locationsRef.current.contains(event.target as Node)
      ) {
        setLocationsOpen(false);
      }
      if (
        propertiesRef.current &&
        !propertiesRef.current.contains(event.target as Node)
      ) {
        setPropertiesOpen(false);
      }
      if (
        toolsRef.current &&
        !toolsRef.current.contains(event.target as Node)
      ) {
        setToolsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setLocationsOpen(false);
        setPropertiesOpen(false);
        setToolsOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSticky || !isHomePage
          ? "bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center flex-shrink-0 min-w-0"
          >
            <img
              src="/1031-exchange-los-angeles-ca-logo.png"
              alt="1031 Exchange Los Angeles"
              className={`h-12 w-auto max-w-[200px] transition-all duration-300 flex-shrink-0 ${shouldUseWhiteText ? 'brightness-0 invert' : ''}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setLocationsOpen(false);
                }}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => {
                  // Keep open for a brief moment to allow mouse to enter dropdown
                  setTimeout(() => {
                    if (!servicesRef.current?.matches(':hover')) {
                      setServicesOpen(false);
                    }
                  }, 100);
                }}
                className={`flex items-center space-x-1 ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                <span>Services</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-6"
                    onMouseEnter={() => setServicesOpen(true)}
                    onMouseLeave={() => setServicesOpen(false)}
                  >
                    <div className="space-y-4">
                      {SERVICES.slice(0, 7).map((service) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="block text-sm text-white hover:text-white hover:bg-slate-800/50 rounded px-3 py-2 transition-colors"
                        >
                          {service.title}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <Link
                        href="/services"
                        className="text-sm text-white hover:text-white font-medium"
                      >
                        View all {SERVICES.length} services →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Locations Dropdown */}
            <div className="relative" ref={locationsRef}>
              <button
                onClick={() => {
                  setLocationsOpen(!locationsOpen);
                  setServicesOpen(false);
                  setPropertiesOpen(false);
                }}
                onMouseEnter={() => setLocationsOpen(true)}
                onMouseLeave={() => {
                  setTimeout(() => {
                    if (!locationsRef.current?.matches(':hover')) {
                      setLocationsOpen(false);
                    }
                  }, 100);
                }}
                className={`flex items-center space-x-1 ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
                aria-expanded={locationsOpen}
                aria-haspopup="true"
              >
                <span>Locations</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {locationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-6"
                    onMouseEnter={() => setLocationsOpen(true)}
                    onMouseLeave={() => setLocationsOpen(false)}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {LOCATIONS.slice(0, 8).map((location) => (
                        <Link
                          key={location.slug}
                          href={`/locations/${location.slug}`}
                          className="block text-sm text-white hover:text-white hover:bg-slate-800/50 rounded px-2 py-1 transition-colors"
                        >
                          {location.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <Link
                        href="/locations"
                        className="text-sm text-white hover:text-white font-medium"
                      >
                        View all {LOCATIONS.length} locations →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Properties Dropdown */}
            <div className="relative" ref={propertiesRef}>
              <button
                onClick={() => {
                  setPropertiesOpen(!propertiesOpen);
                  setServicesOpen(false);
                  setLocationsOpen(false);
                }}
                onMouseEnter={() => setPropertiesOpen(true)}
                onMouseLeave={() => {
                  setTimeout(() => {
                    if (!propertiesRef.current?.matches(':hover')) {
                      setPropertiesOpen(false);
                    }
                  }, 100);
                }}
                className={`flex items-center space-x-1 ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
                aria-expanded={propertiesOpen}
                aria-haspopup="true"
              >
                <span>Properties</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {propertiesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-6"
                    onMouseEnter={() => setPropertiesOpen(true)}
                    onMouseLeave={() => setPropertiesOpen(false)}
                  >
                    <div className="space-y-4">
                      {PROPERTY_TYPES.map((propertyType) => (
                        <Link
                          key={propertyType.slug}
                          href={`/property-types#${propertyType.slug}`}
                          className="block text-sm text-white hover:text-white hover:bg-slate-800/50 rounded px-3 py-2 transition-colors"
                        >
                          {propertyType.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <Link
                        href="/properties"
                        className="text-sm text-white hover:text-white font-medium"
                      >
                        View all properties →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => {
                  setToolsOpen(!toolsOpen);
                  setServicesOpen(false);
                  setLocationsOpen(false);
                  setPropertiesOpen(false);
                }}
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => {
                  setTimeout(() => {
                    if (!toolsRef.current?.matches(':hover')) {
                      setToolsOpen(false);
                    }
                  }, 100);
                }}
                className={`flex items-center space-x-1 ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
                aria-expanded={toolsOpen}
                aria-haspopup="true"
              >
                <span>Tools</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-6"
                    onMouseEnter={() => setToolsOpen(true)}
                    onMouseLeave={() => setToolsOpen(false)}
                  >
                    <div className="space-y-4">
                      <Link
                        href="/tools/boot-calculator"
                        className="block text-sm text-white hover:text-white hover:bg-slate-800/50 rounded px-3 py-2 transition-colors"
                        onClick={() => setToolsOpen(false)}
                      >
                        <div className="font-medium">Boot Calculator</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Calculate boot and tax implications
                        </div>
                      </Link>

                      <Link
                        href="/tools/exchange-cost-estimator"
                        className="block text-sm text-white hover:text-white hover:bg-slate-800/50 rounded px-3 py-2 transition-colors"
                        onClick={() => setToolsOpen(false)}
                      >
                        <div className="font-medium">Exchange Cost Estimator</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Estimate QI fees and closing costs
                        </div>
                      </Link>

                      <Link
                        href="/tools/identification-rules-checker"
                        className="block text-sm text-white hover:text-white hover:bg-slate-800/50 rounded px-3 py-2 transition-colors"
                        onClick={() => setToolsOpen(false)}
                      >
                        <div className="font-medium">Identification Rules Checker</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Validate against IRS identification rules
                        </div>
                      </Link>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <Link
                        href="/tools"
                        className="text-sm text-white hover:text-white font-medium"
                        onClick={() => setToolsOpen(false)}
                      >
                        View all tools →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/about"
              className={`${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
            >
              About
            </Link>

            <Link
              href="/blog"
              className={`${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
            >
              Blog
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 hover:from-amber-600 hover:to-amber-700 transition-colors shadow-lg"
            >
              Contact
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} transition-colors`}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-800/50"
            >
              <div className="py-6 space-y-6">
                {/* Services Mobile */}
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setServicesOpen(!servicesOpen);
                      setLocationsOpen(false);
                      setPropertiesOpen(false);
                      setToolsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'}`}
                    aria-expanded={servicesOpen}
                  >
                    <span className="font-medium">Services</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3">
                          {SERVICES.slice(0, 7).map((service) => (
                            <Link
                              key={service.slug}
                              href={`/services/${service.slug}`}
                              className="block text-sm text-white hover:text-white py-2"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setServicesOpen(false);
                              }}
                            >
                              {service.title}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/services"
                          className="block text-sm text-white font-medium pt-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setServicesOpen(false);
                          }}
                        >
                          View all {SERVICES.length} services →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Locations Mobile */}
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLocationsOpen(!locationsOpen);
                      setServicesOpen(false);
                      setPropertiesOpen(false);
                      setToolsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'}`}
                    aria-expanded={locationsOpen}
                  >
                    <span className="font-medium">Locations</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${locationsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {locationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-2 gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {LOCATIONS.map((location) => (
                          <Link
                            key={location.slug}
                            href={`/locations/${location.slug}`}
                            className="block text-sm text-white hover:text-white py-1"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setLocationsOpen(false);
                            }}
                          >
                            {location.name}
                          </Link>
                        ))}
                        <Link
                          href="/locations"
                          className="block text-sm text-white font-medium pt-2 col-span-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setLocationsOpen(false);
                          }}
                        >
                          View all {LOCATIONS.length} locations →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Properties Mobile */}
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPropertiesOpen(!propertiesOpen);
                      setServicesOpen(false);
                      setLocationsOpen(false);
                      setToolsOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'}`}
                    aria-expanded={propertiesOpen}
                  >
                    <span className="font-medium">Properties</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${propertiesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {propertiesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {PROPERTY_TYPES.map((propertyType) => (
                          <Link
                            key={propertyType.slug}
                            href={`/property-types#${propertyType.slug}`}
                            className="block text-sm text-white hover:text-white py-1"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setPropertiesOpen(false);
                            }}
                          >
                            {propertyType.name}
                          </Link>
                        ))}
                        <Link
                          href="/properties"
                          className="block text-sm text-white font-medium pt-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setPropertiesOpen(false);
                          }}
                        >
                          View all properties →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tools Mobile */}
                <div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setToolsOpen(!toolsOpen);
                      setServicesOpen(false);
                      setLocationsOpen(false);
                      setPropertiesOpen(false);
                    }}
                    className={`flex items-center justify-between w-full text-left ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'}`}
                    aria-expanded={toolsOpen}
                  >
                    <span className="font-medium">Tools</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {toolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href="/tools/boot-calculator"
                          className="block text-sm text-white hover:text-white py-1"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setToolsOpen(false);
                          }}
                        >
                          Boot Calculator
                        </Link>
                        <Link
                          href="/tools/exchange-cost-estimator"
                          className="block text-sm text-white hover:text-white py-1"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setToolsOpen(false);
                          }}
                        >
                          Exchange Cost Estimator
                        </Link>
                        <Link
                          href="/tools/identification-rules-checker"
                          className="block text-sm text-white hover:text-white py-1"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setToolsOpen(false);
                          }}
                        >
                          Identification Rules Checker
                        </Link>
                        <Link
                          href="/tools"
                          className="block text-sm text-white font-medium pt-2"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setToolsOpen(false);
                          }}
                        >
                          View all tools →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/about"
                  className={`block ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>

                <Link
                  href="/blog"
                  className={`block ${shouldUseWhiteText ? 'text-white hover:text-white' : 'text-black hover:text-black'} font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>

                <div className="pt-4 border-t border-slate-800">
                  <a
                    href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-2 text-white hover:text-white font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    {PHONE}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
