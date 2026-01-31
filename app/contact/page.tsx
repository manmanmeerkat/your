"use client";

import Image from "next/image";
import Script from "next/script";
import { ContactForm } from "@/components/getInTouch/contactForm/ContactForm";
// import { SNS_LINKS } from "@/constants/constants";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";


export default function ContactPage() {
  // const filteredSNSLinks = SNS_LINKS.filter(
  //   (sns) => sns.img !== "/images/icon/x-white.png"
  // );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Contact", href: "/contact", isCurrentPage: true },
  ];
  const breadcrumbJsonLd = generateBreadcrumbStructuredData(breadcrumbItems);
  
  return (
    <div className="mb-24">
      <Script
        id="breadcrumb-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="container mx-auto px-4">
        <Breadcrumb customItems={breadcrumbItems} />
      </div>
      {/* Hero */}
      <section className="relative min-h-[220px] md:min-h-[280px] pt-24 pb-20 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/category-top/contact.webp"
            alt="Contact background"
            fill
            priority
            className="object-cover -z-10 brightness-75"
          />
          <div className="absolute inset-0 bg-black/70 z-10" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/75">
            Questions, suggestions, or collaborations—feel free to reach out.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pt-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 md:p-8 backdrop-blur-md shadow-lg">
            <ContactForm />

            {/* 追加文：カードの下部に配置 */}
            <p className="mt-6 text-xs text-white/50 text-center">
              We usually reply within 2–3 business days. Your information will only be used to respond to your message.
              <span className="mx-1">•</span>
              <Link 
                href="/privacy-policy?from=contact"
                className="underline underline-offset-4 hover:text-white/70"            >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </section>

      <WhiteLine />

      {/* SNS */}
      {/* <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 md:p-8 backdrop-blur-md shadow-lg text-center">
            <p className="text-lg md:text-xl font-bold text-white/90">
              Follow us
            </p>

            <div className="mt-6 flex justify-center items-center flex-wrap gap-x-3 gap-y-3">
              {filteredSNSLinks.map((sns, index) => (
                <div key={sns.label} className="flex items-center">
                  <Link
                    href={sns.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-white/80 hover:text-white group"
                  >
                    <Image
                      src={sns.img}
                      alt={`${sns.label} icon`}
                      width={18}
                      height={18}
                      className="object-contain opacity-90 group-hover:opacity-100"
                    />
                    <span className="relative font-semibold">
                      {sns.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>

                  {index < filteredSNSLinks.length - 1 && (
                    <span className="mx-3 text-white/30">•</span>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-white/60">
              We typically reply within a few days.
            </p>
          </div>
        </div>
      </section> */}

      <BackToHomeBtn />
    </div>
  );
}

