// components/customsComponents/wayOfLifeSection/WayOfLifeSection.tsx
import Image from "next/image";
import { WAY_OF_LIFE } from "@/constants/constants";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";

export function WayOfLifeSection() {
  return (
    <section className="py-16" id="japanese-way-of-life">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <SectionTitle>Japanese Way of Life</SectionTitle>

          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
            <span className="block">Small habits and shared manners that shape daily life.</span>
            <span className="block mt-1">Explore the values behind everyday routines in Japan.</span>
          </p>
        </div>

        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] justify-items-center">
          {WAY_OF_LIFE.map((item) => (
            <div key={item.label} className="text-center">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full relative overflow-hidden mx-auto ring-1 ring-white/10 shadow-sm">
                <Image
                  src={item.img}
                  alt={item.label}
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm md:text-base text-white/90 leading-snug">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
