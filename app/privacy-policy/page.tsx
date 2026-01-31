import Image from "next/image";
import Script from "next/script";
import { Suspense } from "react";

import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";
import { BackToContactLink } from "@/components/privacyPolicyComponents/BackToContactLink";

import { Breadcrumb } from "@/components/breadcrumb";
import { generateBreadcrumbStructuredData } from "@/components/breadcrumb/config";

export default function PrivacyPolicyPage() {

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Privacy Policy", href: "/privacy-policy", isCurrentPage: true },
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
        {/* background layer */}
        <div className="absolute inset-0">
          <Image
            src="/images/category-top/privacy-policy.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={60}
            className="object-cover"
          />

          {/* overlay（読みやすさを自然に） */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/55 to-black/75" />
        </div>

        {/* content layer */}
        <div className="relative container mx-auto px-6 md:px-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm md:text-base text-white/75">
            How we handle information with care
          </p>
        </div>
      </section>

      {/* Back to Contact */}
      <div className="container mx-auto px-4 mt-6">
        <div className="mx-auto max-w-4xl">
          <Suspense fallback={null}>
            <BackToContactLink />
          </Suspense>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-10 md:pt-14 pb-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-md p-6 sm:p-8 md:p-10">
            {/* Optional: small intro note */}
            <p className="text-white/80 leading-7">
              This Privacy Policy explains how we handle information when you visit our website.
              We focus on sharing cultural content and do not require user registration.
            </p>

            <div className="my-8 h-px bg-white/10" />

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                Introduction
              </h2>
              <p className="text-white/75 leading-7">
                Welcome to our website, which introduces Japanese culture, traditions, and customs
                to a global audience. This page explains how we respect your privacy when you browse
                our content.
              </p>
              <p className="text-white/75 leading-7">
                Our website is primarily an informational resource. We do not require user
                registration and do not actively collect personal information.
              </p>
            </section>

            <div className="my-8 h-px bg-white/10" />

            {/* Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                Information We Collect
              </h2>
              <p className="text-white/75 leading-7">
                When you visit our website, we may collect limited information:
              </p>

              <ul className="space-y-3 pl-5 list-disc text-white/75 leading-7">
                <li>
                  <span className="text-white font-semibold">Log Data</span>: Our web servers may
                  collect standard log information such as your IP address, browser type, pages
                  visited, and time spent on the site. This information is used only for website
                  operation, security, and improvement.
                </li>
                <li>
                  <span className="text-white font-semibold">Cookies</span>: We use essential cookies
                  for basic functionality. We may also use analytics cookies to understand how
                  visitors use our site, but these do not collect personally identifiable information.
                </li>
              </ul>
            </section>

            <div className="my-8 h-px bg-white/10" />

            {/* How We Use Information */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                How We Use Information
              </h2>
              <p className="text-white/75 leading-7">
                The limited information we collect is used to:
              </p>
              <ul className="space-y-2 pl-5 list-disc text-white/75 leading-7">
                <li>Maintain and improve our website</li>
                <li>Better understand how visitors use our content</li>
                <li>Detect and prevent technical or security issues</li>
              </ul>
              <p className="text-white/75 leading-7">
                We do not sell, rent, or share information with third parties except as required by
                law or to protect our rights and the safety of our website.
              </p>
            </section>

            <div className="my-8 h-px bg-white/10" />

            {/* Analytics */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                Analytics
              </h2>
              <p className="text-white/75 leading-7">
                We may use third-party analytics services (such as Google Analytics) to understand
                how visitors use our site. These services may collect anonymous information, such as
                pages viewed and time spent on the site.
              </p>
              <p className="text-white/75 leading-7">
                This information helps us improve the website and content. These services operate
                under their own privacy policies.
              </p>
            </section>

            <div className="my-8 h-px bg-white/10" />

            {/* External Links */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                External Links
              </h2>
              <p className="text-white/75 leading-7">
                Our website may contain links to external sites that are not operated by us. We have
                no control over their content or practices and cannot accept responsibility for their
                privacy policies.
              </p>
              <p className="text-white/75 leading-7">
                We encourage you to review the privacy policies of any site you visit.
              </p>
            </section>

            <div className="my-8 h-px bg-white/10" />

            {/* Changes to This Privacy Policy */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                Changes to This Privacy Policy
              </h2>
              <p className="text-white/75 leading-7">
                We may update this Privacy Policy from time to time. Any changes will be posted on
                this page and the “Last updated” date will be revised.
              </p>
              <p className="text-white/75 leading-7">
                Please review this page periodically for updates.
              </p>
            </section>

            <div className="my-8 h-px bg-white/10" />

            {/* Contact Us */}
            <section className="space-y-4">
              <h2 className="text-xl md:text-2xl font-semibold text-[#f19072]">
                Contact Us
              </h2>
              <p className="text-white/75 leading-7">
                If you have any questions about this Privacy Policy, please contact us through the
                methods provided on the website.
              </p>
              <p className="text-sm text-white/50 italic">
                Last updated: December 29, 2025
              </p>
            </section>
          </div>

          <div className="container mx-auto px-4 mt-6">
            <div className="mx-auto max-w-4xl">
              <Suspense fallback={null}>
                <BackToContactLink className="justify-center w-full" />
              </Suspense>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <BackToHomeBtn />
          </div>
        </div>
      </div>
    </div>
  );
}
