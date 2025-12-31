// components/cultureComponents/mastersCultureSection/MastersCultureSection.tsx
import Image from "next/image";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { CULTURE_CATEGORIES } from "@/constants/constants";

export function MastersCultureSection() {
  return (
    <section className="py-20" id="japanese-culture-masters">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>Masters of Japanese Culture</SectionTitle>

          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
            <span className="block">
              Discover the people and traditions that shaped Japanese culture.
            </span>
            <span className="block mt-1">
              Tap an icon to explore each theme.
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 justify-items-center">
          {CULTURE_CATEGORIES.map((item) => (
            <div
              key={item.name}
              className="w-40 text-center group"
            >
              <div className="mx-auto w-28 h-28 md:w-32 md:h-32 rounded-full relative overflow-hidden ring-1 ring-white/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Image
                  src={item.img}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-cover"
                />
              </div>

              <p className="mt-3 text-sm md:text-base text-white/90 leading-snug text-center">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
