"use client";

import Image from "next/image";
import { ContactForm } from "@/components/getInTouch/contactForm/ContactForm";
import { SNS_LINKS } from "@/constants/constants";
import Link from "next/link";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

export default function ContactPage() {

  const filteredSNSLinks = SNS_LINKS.filter((sns) => sns.img !== "/images/icon/x-white.png");

  return (
    <div>
      {/* ヒーローヘッダー */}
      <section className="relative bg-slate-900 text-white py-32">
        <Image
          src="/images/category-top/contact.jpg"
          alt="get in touch"
          width={1024}
          height={400}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black opacity-60 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">Get in Touch</h1>
          <p className="text-xl max-w-2xl mx-auto drop-shadow-md">
            We welcome your questions, suggestions, or any other inquiries. 
            Please use the form below to reach out to us.
          </p>
        </div>
      </section>

      {/* フォームセクション */}
      <section className="pt-12 bg-slate-950">
        <div className="container mx-auto px-4 max-w-2xl">
          <ContactForm />
        </div>
      </section>

      <WhiteLine/>
      
      {/* その他の連絡方法 */}
      <section className="pb-16 bg-slate-950 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto text-center">
          <p className="text-xl font-bold mb-3">Follow us:</p>
          <div className="flex justify-center items-center flex-wrap gap-2">
            {filteredSNSLinks.map((sns, index) => (
              <div key={sns.label} className="flex items-center">
                <Link
                  href={sns.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-slate-600 hover:text-red-600 group"
                >
                  <Image
                    src={sns.img}
                    alt={`${sns.label} icon`}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                  <span className="relative block">
                    {sns.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </Link>
                {index < filteredSNSLinks.length - 1 && (
                  <span className="mx-2 text-slate-400">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <BackToHomeBtn/>
      <WhiteLine/>
    </div>
  );
}
