// app/mythology/_components/MythologyHero.tsx
import Image from "next/image";

export function MythologyHeroSection() {
  return (
    <section className="relative bg-slate-900 min-h-[55vh] md:min-h-[45vh]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/category-top/mythology.jpg"
          alt="Japanese Mythology"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/..." // 実値
        />
        <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.35))]" />
      </div>

      <div className="container mx-auto px-6 py-20 md:py-24 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-block rounded-2xl px-8 py-4 md:px-8 md:py-4 bg-black/20 backdrop-blur-sm ring-1 ring-white/10 shadow-lg [background:linear-gradient(90deg,rgba(0,0,0,.38),rgba(0,0,0,.16))]">
            <h1 className="text-4xl md:text-5xl font-bold mb-5 drop-shadow-lg">
              Japanese Mythology
            </h1>

            <p className="italic text-sm md:text-base text-white/85 mb-6 drop-shadow">
              Where gods, nature, and humanity share the same world.
            </p>

            <div className="text-left text-lg md:text-xl text-white/90 leading-relaxed md:leading-loose space-y-4">
              <p>
                Welcome to the world of Japanese mythology, where gods, nature, and
                humanity exist side by side.
              </p>
              <p>
                From the creation of the islands to the birth of the sun goddess and
                the emergence of Japan itself, these ancient stories have shaped the
                Japanese sense of beauty, fear, and reverence for the unseen.
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
  );
}
