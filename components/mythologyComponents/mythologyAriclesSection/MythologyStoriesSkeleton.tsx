// app/mythology/_components/MythologyStoriesSkeleton.tsx
import { SectionTitle } from "@/components/sectionTitle/SectionTitle";

export function MythologyArticlesSkeleton() {
  return (
    <section className="py-20" id="mythology-stories">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <SectionTitle>Japanese mythological stories</SectionTitle>

          <p className="mt-4 text-sm md:text-base text-[#f3f3f2]/60 leading-relaxed">
            Loading stories…
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`story-skel-${index}`}
              className="animate-pulse rounded-xl bg-black/20 p-4 ring-1 ring-white/10"
            >
              <div className="h-40 w-full rounded-md bg-white/10 mb-4" />
              <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-4 w-1/2 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
