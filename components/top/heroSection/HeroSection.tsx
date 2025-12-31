import Link from "next/link";
import { Button } from "@/components/ui/button";
import Slider from "../slider/Slider";

export default function HeroSection() {
  return (
    <section className="relative text-[#f3f3f2] md:px-16">
      {/* Background slider */}
      <div className="absolute inset-0 z-0">
        <Slider />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-32 md:py-32">
        <h1 className="sr-only">
          Exploring Japanese Culture, Myths, and Quiet Beauty
        </h1>

        <div className="max-w-2xl">
          {/* Tag line (refined) */}
          <div className="mb-3">
            <span
              className="
                inline-flex items-center
                rounded-lg px-3 py-1
                text-xs md:text-sm
                text-white/75
                bg-black/25 backdrop-blur-sm
                ring-1 ring-white/10
                shadow-sm
              "
            >
              Myths • Culture • Seasons
            </span>
          </div>

          {/* Glass panel */}
          <div
            className="
              inline-block rounded-xl px-6 py-5
              bg-black/20 backdrop-blur-sm
              shadow-lg
              ring-1 ring-white/10
              [background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(0,0,0,.15))]
            "
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              <span className="block leading-[1.25]">Stories, beliefs,</span>
              <span className="block leading-[1.25] mt-2">and quiet beauty.</span>
            </h2>

            <p className="text-base md:text-lg leading-relaxed mb-8 drop-shadow-md text-white/90">
              A side of Japan that has yet to be put into words.
            </p>

            <div className="flex gap-4 flex-wrap">
              <Link href="#categories">
                <Button
                  size="lg"
                  className="
                    min-w-[240px] h-12
                    flex items-center justify-center
                    leading-none
                    font-semibold tracking-wide
                    border border-[#df7163] bg-[#c96a5d]/90 text-[#f3f3f2]
                    hover:brightness-110
                    hover:-translate-y-[1px]
                    transition-all duration-200
                    shadow-md hover:shadow-lg
                    group
                    transition-all
                    duration-200
                    hover:-translate-y-[1px]
                    hover:shadow-md
                  "
                >
                  Explore Categories
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Button>
              </Link>

              <Link href="#latest-articles">
                <Button
                  size="lg"
                  variant="outline"
                  className="
                    min-w-[240px] h-12 px-7
                    flex items-center justify-center
                    leading-none
                    font-semibold tracking-wide
                    border-white/40 text-[#f3f3f2]
                    bg-white/5 hover:bg-white/12
                    transition-all duration-200
                    hover:-translate-y-[1px]
                    shadow-sm hover:shadow-md
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-white/60
                    focus-visible:ring-offset-2 focus-visible:ring-offset-black/30
                    group
                  "
                >
                  Latest Articles
                  <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll hint (refined) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 select-none">
          <span
            className="
              inline-flex items-center gap-2
              rounded-full px-3 py-1
              text-sm text-white/85
              bg-black/25 backdrop-blur-sm
              ring-1 ring-white/10
              shadow-sm
            "
          >
            Scroll <span className="animate-bounce">↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}