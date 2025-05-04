"use client";

import Image from "next/image";
import Link from "next/link";

interface GodData {
  name: string;
  img: string;
}

interface GodsGalleryProps {
  gods: GodData[];
  slugMap: Record<string, string>;
}

export default function GodsGallery({ gods, slugMap }: GodsGalleryProps) {
  const getGodSlug = (name: string): string => {
    if (slugMap[name]) {
      return slugMap[name];
    }
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
      {gods.map((god, index) => {
        const slug = getGodSlug(god.name);

        return (
          <Link href={`/category-item/${slug}`} key={index} className="group">
            <div className="w-32 h-32 mx-auto bg-slate-200 rounded-full relative overflow-hidden cursor-pointer">
              <Image
                src={god.img}
                alt={god.name}
                fill
                style={{ objectFit: "cover" }}
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <p className="mt-2 font-medium text-sm sm:text-base text-white group-hover:underline">
              {god.name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
