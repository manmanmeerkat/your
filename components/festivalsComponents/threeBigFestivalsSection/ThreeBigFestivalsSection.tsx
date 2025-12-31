// components/festivalsComponents/threeBigFestivalsSection/ThreeBigFestivalsSection.tsx
import Image from "next/image";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { THREE_BIG_FESTIVALS } from "@/constants/constants";

export function ThreeBigFestivalsSection() {
  return (
    <section className="py-20" id="three-big-festivals">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>Japan&apos;s Three Biggest Festivals</SectionTitle>
          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
            <span className="block">Three iconic festivals often cited as Japan’s “biggest.”</span>
            <span className="block mt-1">Each has a distinct style, history, and spirit.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {THREE_BIG_FESTIVALS.map((festival, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10 shadow-md"
            >
              <div className="h-48 relative">
                <Image
                  src={festival.img}
                  alt={festival.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#f3f3f2]">
                  {festival.title}
                </h3>
                <p className="text-[#f3f3f2]/75 leading-relaxed">
                  {festival.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
