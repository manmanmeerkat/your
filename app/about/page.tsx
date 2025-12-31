import Image from "next/image";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_ITEMS } from "@/constants/constants";
import CategoryCard from "@/components/top/categoryCard/categoryCard";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";
// import Redbubble from "@/components/redBubble/RedBubble";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";

export default function AboutPage() {
  return (
    <div className="bg-[#2b1e1c] text-[#f3f3f2] pb-16">
      {/* ヘッダーセクション */}
      <section className="relative bg-slate-900 min-h-[55vh] md:min-h-[45vh]">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/category-top/about.jpg"
              alt="About us"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              // About画像にも blur を付けたい場合は下を有効化（あとで実値を入れる）
              // placeholder="blur"
              // blurDataURL="data:image/jpeg;base64,/9j/..." // 実値
            />
            <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.35))]" />
          </div>

          <div className="container mx-auto px-6 py-20 md:py-24 relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-block rounded-2xl px-8 py-4 md:px-8 md:py-4 bg-black/20 backdrop-blur-sm ring-1 ring-white/10 shadow-lg [background:linear-gradient(90deg,rgba(0,0,0,.38),rgba(0,0,0,.16))]">
                <h1 className="text-4xl md:text-5xl font-bold mb-5 drop-shadow-lg">
                  About us
                </h1>

                <p className="italic text-sm md:text-base text-white/85 mb-6 drop-shadow">
                  A quiet guide to Japan’s deeper beauty.
                </p>

                <div className="text-left text-lg md:text-xl text-white/90 leading-relaxed md:leading-loose space-y-4">
                  <p>
                    Your Secret Japan offers a gentle journey into the cultural layers of Japan,
                    where history, belief, and everyday life quietly intertwine.
                  </p>
                  <p>
                    Through ancient myths, enduring arts, seasonal customs, and small moments of
                    beauty, we share stories that reveal how the Japanese people have long lived in
                    dialogue with nature.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 select-none inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-white/85 bg-black/25 backdrop-blur-sm ring-1 ring-white/10 shadow-sm hover:bg-black/30 transition">
              <span>Scroll</span>
              <span className="animate-bounce">↓</span>
            </div>
          </div>
        </section>

      {/* ミッションセクション */}
      <section className="pt-16 md:px-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <SectionTitle>Our mission</SectionTitle>

          <div className="mt-10 md:mt-12 relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-lg backdrop-blur-md p-8 md:p-10 text-left">
            <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-30" />
            <div className="pointer-events-none absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

            <div className="relative pl-5 md:pl-7">
              <p className="mb-5 text-lg leading-relaxed text-white/90">
                Your Secret Japan is driven by a quiet curiosity to explore the deeper layers of
                Japanese culture.
              </p>

              <p className="mb-5 text-lg leading-relaxed text-white/90">
                Rather than presenting Japan as a destination, we focus on the stories,
                sensibilities, and traditions that have shaped how people in Japan have lived,
                thought, and connected with the world around them.
              </p>

              <p className="mb-5 text-lg leading-relaxed text-white/90">
                From ancient myths and seasonal customs to enduring crafts and everyday practices,
                we aim to share this cultural heritage in a way that is gentle, accessible, and
                grounded in lived experience.
              </p>

              <p className="mb-6 text-lg leading-relaxed text-white/90">
                Whether you are just beginning your journey or have long been drawn to Japan, we
                hope these stories offer new perspectives and moments of discovery.
              </p>

              <p className="mt-8 pt-6 border-t border-white/10 text-center text-lg italic text-white/85">
                We invite you to discover your own, quietly meaningful Japan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <WhiteLine />

      {/* コンテンツセクション */}
      <section className="py-16 md:px-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Heading */}
          <div className="text-center mb-10">
            <SectionTitle>Our Contents</SectionTitle>
            <p className="mt-3 mx-auto max-w-2xl text-sm md:text-base text-[#f3f3f2]/80">
              Begin a quiet journey through the themes and stories that shape Japan’s culture and everyday life.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORY_ITEMS.map((item) => (
              <CategoryCard
                key={item.href}
                href={item.href}
                title={item.title}
                img={item.img}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </section>
      <WhiteLine />
      <SimpleContact />
      {/* <Redbubble /> */}
      <WhiteLine />
      <BackToHomeBtn />
    </div>
  );
}
