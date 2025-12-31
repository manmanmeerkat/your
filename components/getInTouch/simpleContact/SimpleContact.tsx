import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { ContactCard } from "../contactCard/ContactCard";

export const SimpleContact = () => {
  return (
    <section
      id="get-in-touch"
      className="bg-[#2b1e1c] text-white mt-4"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Title block */}
        <div className="text-center mb-10">
          <SectionTitle>Get in Touch</SectionTitle>

          <p className="mt-5 text-sm md:text-base text-[#f3f3f2]/75 max-w-2xl mx-auto leading-relaxed">
              We’re always happy to hear from you.<br></br>
              If you have a question, suggestion, or thought to share, please feel free to reach out.
          </p>
        </div>
          <ContactCard
            title="Contact Us"
            content="Feel free to send us a message using the form below."
            link={{ href: "/contact", label: "Go to Contact Form" }}
          />
      </div>
    </section>
  );
};
