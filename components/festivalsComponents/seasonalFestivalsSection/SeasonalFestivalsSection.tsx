// components/festivalsComponents/seasonalFestivalsSection/SeasonalFestivalsSection.tsx
import Image from "next/image";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { SEASONAL_FESTIVALS } from "@/constants/constants";

export function SeasonalFestivalsSection() {
  return (
    <section className="py-20" id="seasonal-festivals">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>Seasonal Festivals</SectionTitle>
          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
            <span className="block">Many festivals follow Japan’s seasonal calendar.</span>
            <span className="block mt-1">Here are common examples you’ll see across the year.</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {SEASONAL_FESTIVALS.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full relative overflow-hidden ring-1 ring-white/10 shadow-sm">
                <Image
                  src={item.img}
                  alt={`${item.season} icon`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 112px, 128px"
                  loading="lazy"
                />
              </div>

              <h3 className="mt-4 font-semibold text-base md:text-lg text-white">
                {item.label}
              </h3>

              <p className="mt-2 text-white/80 text-sm md:text-base leading-relaxed">
                {item.example1}
                <br />
                {item.example2}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
