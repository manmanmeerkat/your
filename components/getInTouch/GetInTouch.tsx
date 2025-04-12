import { Button } from "../ui/button"
import Link from "next/link"

export const GetInTouch = () => {
  return (
    // お問い合わせセクション
    <section className="py-16 bg-slate-950 text-center">
      <div className="container mx-auto px-4 text-white">
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Have any questions or suggestions?<br/>
          We’d love to hear from you.
        </p>
        <Link href="/contact">
          <Button size="lg"
            className="w-[220px] font-normal
            border border-rose-700 bg-rose-700 text-white
            hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
            shadow hover:shadow-lg"
          >
            Contact Form ≫
          </Button>
        </Link>
      </div>
    </section>
  )
}