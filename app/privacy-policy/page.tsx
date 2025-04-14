"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import Image from "next/image";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="relative bg-slate-950 text-white pt-24 pb-24">
        <div className="absolute inset-0 z-0 opacity-30">
          <Image
            src="/images/category-top/privacy-policy.jpg"
            alt="Japanese Customs"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="container mx-auto px-6 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-justifyr">
            Our commitment to your privacy
          </p>
        </div>
      </section>

      {/* プライバシーポリシーコンテンツ */}
      <div className="container mx-auto px-4 pt-32 pb-8">
        <div className="max-w-4xl mx-auto bg-slate-800/40 rounded-lg p-8 text-white text-justify">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              Introduction
            </h2>
            <p className="mb-4 text-gray-300">
              Welcome to our website dedicated to introducing Japanese culture,
              traditions, and customs to a global audience. This Privacy Policy
              explains how we handle information when you visit our website.
            </p>
            <p className="text-gray-300">
              Our website is primarily an informational resource, and we do not
              require user registration or actively collect personal
              information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              Information We Collect
            </h2>
            <p className="mb-4 text-gray-300">
              When you visit our website, we collect minimal information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300">
              <li>
                <strong className="text-white">Log Data</strong>: Our web
                servers automatically collect standard log information,
                including your IP address, browser type, pages visited, and time
                spent on the site. This information is used only for website
                operation and improvement purposes.
              </li>
              <li>
                <strong className="text-white">Cookies</strong>: We use
                essential cookies to ensure the website functions properly. We
                may also use analytics cookies to understand how visitors use
                our site, but these do not collect personally identifiable
                information.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              How We Use Information
            </h2>
            <p className="mb-4 text-gray-300">
              The limited information we collect is used for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-300">
              <li>Maintaining and improving our website</li>
              <li>
                Analyzing how visitors use our site to enhance content and user
                experience
              </li>
              <li>Detecting and preventing technical issues</li>
            </ul>
            <p className="text-gray-300">
              We do not sell, rent, or share any information with third parties
              except as required by law or to protect our rights.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              Analytics
            </h2>
            <p className="mb-4 text-gray-300">
              We may use third-party analytics services (like Google Analytics)
              to help us understand how visitors use our site. These services
              collect anonymous information about your visits to our website,
              such as the pages you view and how long you spend on the site.
            </p>
            <p className="text-gray-300">
              The information is used to compile reports and help us improve the
              site. These third-party services have their own privacy policies
              regarding how they use such information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              External Links
            </h2>
            <p className="mb-4 text-gray-300">
              Our website may contain links to external sites that are not
              operated by us. Please be aware that we have no control over the
              content and practices of these sites, and cannot accept
              responsibility or liability for their respective privacy policies.
            </p>
            <p className="text-gray-300">
              We encourage you to review the privacy policies of any site you
              visit from our website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              Changes to This Privacy Policy
            </h2>
            <p className="mb-4 text-gray-300">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "last updated" date.
            </p>
            <p className="text-gray-300">
              You are advised to review this Privacy Policy periodically for any
              changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-rose-500">
              Contact Us
            </h2>
            <p className="mb-4 text-gray-300">
              If you have any questions about this Privacy Policy, please
              contact us through our provided contact methods on the website.
            </p>
            <p className="text-sm text-gray-400 italic">
              Last updated: April 13, 2025
            </p>
          </section>
        </div>
      </div>
      <BackToHomeBtn/>

      <WhiteLine />
    </>
  );
}
