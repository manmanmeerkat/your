import { ContactCard } from "../contactCard/ContactCard";

export const SimpleContact = () => {
  return (
    <section id="get-in-touch" className="py-12 bg-[#2b1e1c] text-white scroll-mt-32">
        <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4 bg-[#180614] py-2">Get in Touch</h2>
            <p className="text-lg my-8 max-w-2xl mx-auto text-left">
              We welcome your questions, suggestions, or any other inquiries. <br />
              Please use the form below to reach out to us.
            </p>
            <ContactCard
              title="Contact Us Using the Form"
              content="Feel free to send us a message using the form below."
              link={{ href: "/contact", label: "Go to Contact Form ≫" }}
            />
        </div>
    </section>
  );
};
