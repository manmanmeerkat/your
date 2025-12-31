import Image from "next/image";

export function AllArticlesHeroSection() {
  return (
    <section className="relative min-h-[220px] md:min-h-[280px] pt-24 pb-20 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/category-top/all-posts.jpg"
          alt="All Posts background"
          fill
          priority
          className="object-cover -z-10 brightness-75"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-16 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          All Articles
        </h1>
        <p className="mt-2 text-sm md:text-base text-white/75">
          Explore articles across mythology, culture, festivals, and customs.
        </p>
      </div>
    </section>
  );
}
