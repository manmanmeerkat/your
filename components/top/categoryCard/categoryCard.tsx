import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { categoryItemType } from "@/types/types";

export default function CategoryCard({ href, title, img, description }: categoryItemType) {
  return (
    <Link
      href={href}
      className="
        group block h-full
        focus:outline-none
        focus-visible:ring-2 focus-visible:ring-[#df7163]/70
        focus-visible:ring-offset-2 focus-visible:ring-offset-[#180614]
        rounded-xl
      "
    >
      <div
        className="
          h-full overflow-hidden rounded-xl
          bg-[#d8d3ce]
          shadow-md
          transition-all duration-200
          group-hover:-translate-y-1 group-hover:shadow-lg
          ring-1 ring-black/5
          flex flex-col
        "
      >
        {/* Image (fixed ratio) */}
        <div className="relative aspect-[16/9]">
          <Image
            src={img}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            priority={false}
          />
          {/* subtle overlay for readability / consistency */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1 text-[#180614]">
          <h3 className="text-lg md:text-xl font-bold leading-snug">
            {title}
          </h3>

          <p className="mt-2 text-sm md:text-base text-[#180614]/80 leading-relaxed">
            {description}
          </p>

          {/* CTA pinned to bottom */}
          <div className="mt-auto pt-4 flex justify-end">
            <Button
              className="
                rounded-full
                px-6 py-2
                bg-[#c96a5d]/90
                text-[#f3f3f2]
                backdrop-blur-sm
                shadow-sm
                hover:bg-[#f3f3f2]/90
                hover:text-[#c96a5d]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:shadow-md
              "
            >
              Explore more
              <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
