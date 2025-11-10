"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Head from "next/head";
import SearchInput from "@/components/SearchInput";
import { inventoryBatch01, propertyTypesData } from "@/data";
import { PHONE, PRIMARY_CITY, PRIMARY_STATE_ABBR } from "@/lib/constants";
import { notFound } from "next/navigation";
import { getPropertyTypeImagePath } from "@/lib/image-utils";

interface PropertyTypePageProps {
  params: {
    slug: string;
  };
}

export default function PropertyTypePage({ params }: PropertyTypePageProps) {
  // Find property type by route (which is what's in the URL slug)
  const propertyType = propertyTypesData.find(pt => pt.route === params.slug);
  if (!propertyType) {
    notFound();
  }

  // Get inventory spotlight data for this property type
  const inventoryData = inventoryBatch01.inventorySpotlight01.find(
    item => item.type === propertyType.slug
  );

  if (!inventoryData) {
    notFound();
  }

  // Get related property types (exclude current one)
  const relatedPropertyTypes = useMemo(() => {
    return inventoryBatch01.inventorySpotlight01
      .filter(item => item.type !== propertyType.slug)
      .slice(0, 4)
      .map(item => {
        const pt = propertyTypesData.find(p => p.slug === item.type);
        return {
          ...item,
          route: pt?.route || item.type,
        };
      });
  }, [propertyType.slug]);

  // Search items include ALL property types except the current one
  const searchItems = useMemo(() => {
    return propertyTypesData
      .filter(pt => pt.slug !== propertyType.slug)
      .map(pt => {
        // Try to get inventory data for description, fallback to name
        const inventoryItem = inventoryBatch01.inventorySpotlight01.find(item => item.type === pt.slug);
        return {
          title: pt.name,
          slug: pt.route,
          description: inventoryItem?.copy || `Explore ${pt.name.toLowerCase()} investment opportunities for your 1031 exchange in Los Angeles CA.`,
          href: `/property-types/${pt.route}`,
        };
      });
  }, [propertyType.slug]);

  const handleNoResults = (query: string) => {
    window.location.href = `/contact?project_type=${encodeURIComponent(query)}`;
  };

  // Generate FAQ content based on property type
  const faqs = [
    {
      question: `What makes ${inventoryData.title.toLowerCase()} a good 1031 exchange option in ${PRIMARY_CITY} ${PRIMARY_STATE_ABBR}?`,
      answer: `${inventoryData.copy} Our Los Angeles CA specialists help investors identify ${propertyType.name.toLowerCase()} properties that meet IRS like-kind requirements while providing strong investment returns and operational benefits.`
    },
    {
      question: `How do I find ${propertyType.name.toLowerCase()} replacement properties in California?`,
      answer: `We maintain relationships with brokers and property owners throughout ${PRIMARY_CITY} ${PRIMARY_STATE_ABBR} to identify ${propertyType.name.toLowerCase()} opportunities that qualify for 1031 exchanges. Our team conducts thorough market analysis and property due diligence to ensure compliance and investment quality.`
    },
    {
      question: `What are the timeline requirements for exchanging into ${propertyType.name.toLowerCase()} properties?`,
      answer: `1031 exchange rules require identifying replacement properties within 45 days and closing within 180 days of selling your relinquished property. We help investors meet these deadlines by maintaining an active pipeline of ${propertyType.name.toLowerCase()} opportunities in Los Angeles CA and surrounding markets.`
    },
    {
      question: `What financing options are available for ${propertyType.name.toLowerCase()} 1031 exchange properties?`,
      answer: `Financing for ${propertyType.name.toLowerCase()} replacement properties varies based on property type, location, and investor qualifications. We work with lenders familiar with 1031 exchange structures to help secure appropriate financing that maintains tax-deferred status while meeting your investment objectives.`
    }
  ];

  return (
    <>
      <Head>
        <title>{inventoryData.title} | Los Angeles CA 1031 Exchange Property Types</title>
        <meta
          name="description"
          content={`${inventoryData.copy} Explore ${propertyType.name.toLowerCase()} investment opportunities for your 1031 exchange in Los Angeles CA.`}
        />
        <meta
          name="keywords"
          content={`${propertyType.name.toLowerCase()}, 1031 exchange, Los Angeles CA, ${propertyType.name.toLowerCase()} properties, replacement property, tax deferral`}
        />
        <link rel="canonical" href={`https://www.1031exchangelosangeles.com/property-types/${propertyType.route}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": inventoryData.title,
              "description": inventoryData.copy,
              "category": propertyType.name,
              "provider": {
                "@type": "Organization",
                "name": "1031 Exchange Los Angeles",
                "url": "https://www.1031exchangelosangeles.com"
              },
              "url": `https://www.1031exchangelosangeles.com/property-types/${propertyType.route}`
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 pt-16 md:pt-20">
        {/* Breadcrumb */}
        <div className="bg-slate-900 py-4">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <nav className="flex items-center space-x-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-slate-200 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/property-types" className="hover:text-slate-200 transition-colors">
                Property Types
              </Link>
              <span>/</span>
              <span className="text-slate-200">{propertyType.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section 
          className="bg-slate-950 py-20 md:py-28 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.85)), url(${getPropertyTypeImagePath(propertyType.slug)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <Link
                  href="/property-types"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Property Types
                </Link>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                  {propertyType.name}
                </span>
              </div>

              <h1 className="font-serif text-4xl md:text-5xl text-white mb-6">
                {inventoryData.title}
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed mb-8">
                {inventoryData.copy}
              </p>

              {inventoryData.note && (
                <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-300/90 italic">
                    {inventoryData.note}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/contact?project_type=${encodeURIComponent(propertyType.name)}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  Get Expert Guidance
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={`tel:${PHONE.replace(/[^0-9]/g, "")}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-700 text-slate-200 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Call {PHONE}
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Property Type Details */}
        <section className="bg-slate-900 py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-serif text-2xl text-white mb-6">
                    Why Invest in {propertyType.name} Properties for Your 1031 Exchange
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-300 leading-relaxed mb-6">
                      {inventoryData.copy} Our Los Angeles CA team specializes in identifying {propertyType.name.toLowerCase()} 
                      replacement properties that meet IRS like-kind requirements while providing strong investment returns 
                      and operational benefits for 1031 exchange investors.
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-6">
                      When considering {propertyType.name.toLowerCase()} properties for your 1031 exchange, it&apos;s essential to 
                      evaluate factors such as location, tenant quality, lease terms, and market fundamentals. Our specialists 
                      conduct thorough due diligence to ensure replacement properties align with your investment objectives and 
                      comply with all IRS regulations.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                      We work with qualified intermediaries, lenders, and local brokers throughout {PRIMARY_CITY} {PRIMARY_STATE_ABBR} 
                      to facilitate successful 1031 exchanges into {propertyType.name.toLowerCase()} assets. From initial property 
                      identification through closing, we provide comprehensive support to help you navigate the exchange process 
                      and achieve your tax-deferred investment goals.
                    </p>
                  </div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-serif text-2xl text-white mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-slate-800 pb-6 last:border-b-0">
                        <h3 className="font-serif text-lg text-white mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Related Property Types */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-slate-800 rounded-xl p-6"
                >
                  <h3 className="font-serif text-lg text-white mb-4">
                    Other Property Types
                  </h3>

                  {/* Search all property types */}
                  <div className="mb-4">
                    <SearchInput
                      placeholder="Search property types..."
                      items={searchItems}
                      onNoResults={handleNoResults}
                      maxResults={10}
                    />
                  </div>

                  {/* Display related property types */}
                  <div className="space-y-3">
                    {relatedPropertyTypes.length > 0 ? (
                      relatedPropertyTypes.map((relatedType) => (
                        <Link
                          key={relatedType.type}
                          href={`/property-types/${relatedType.route}`}
                          className="block p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/80 transition-colors group"
                        >
                          <h4 className="font-medium text-slate-200 group-hover:text-white transition-colors mb-1">
                            {relatedType.title}
                          </h4>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {relatedType.copy}
                          </p>
                        </Link>
                      ))
                    ) : null}
                  </div>
                </motion.div>

                {/* CTA Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-6"
                >
                  <h3 className="font-serif text-lg text-white mb-3">
                    Ready to Explore {propertyType.name} Opportunities?
                  </h3>
                  <p className="text-slate-300 text-sm mb-4">
                    Contact our Los Angeles CA specialists for personalized {propertyType.name.toLowerCase()} property recommendations.
                  </p>
                  <Link
                    href={`/contact?project_type=${encodeURIComponent(propertyType.name)}`}
                    className="inline-flex items-center gap-2 w-full px-4 py-3 bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-600 transition-colors justify-center"
                  >
                    Schedule Consultation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

