import { ContactCard } from "../contactCard/ContactCard"

export const SimpleContact = () => {
  return (
    <section id="get-in-touch" className="py-12 bg-slate-950 scroll-mt-32">
        <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Get in Touch</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white">
            We welcome your questions, suggestions, or any other inquiries. <br />
            Please use the form below to reach out to us.
            </p>
            <ContactCard
            title="Contact Us Directly via Email"
            content="You can also reach us directly at the following email address:"
            detail="info@yoursecretjapan.com"
            />
        </div>
    </section>
  )
}
