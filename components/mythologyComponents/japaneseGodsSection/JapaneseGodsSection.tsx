// app/mythology/_components/GodsSection.tsx
import { Suspense } from "react";
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import { GodsGalleryWrapper } from "./gotsGalleryWrapper/GotsGalleryWrapper";
import { GodsGallerySkeleton } from "./gotsGallerySkeleton/GotsGallerySkeleton";

export function JapaneseGodsSection ({ godsSlugMapPromise }: { godsSlugMapPromise: Promise<Record<string, string>> }) {
  return (
// GodsSection.tsx
<section className="py-20" id="japanese-gods">
  <div className="container mx-auto max-w-6xl px-6">
    <div className="text-center mb-10">
      <SectionTitle>Japanese Gods</SectionTitle>

      <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/70 leading-relaxed">
        <span className="block">Meet the gods of creation, storms, the sun, and the moon.</span>
        <span className="block mt-1">Tap a portrait to discover their stories and roles.</span>
      </p>
    </div>

    <Suspense fallback={<GodsGallerySkeleton />}>
      <GodsGalleryWrapper godsSlugMapPromise={godsSlugMapPromise} />
    </Suspense>
  </div>
</section>

  );
}


