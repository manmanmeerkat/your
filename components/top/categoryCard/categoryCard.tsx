import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { categoryItemType } from "@/types/types";

export default function CategoryCard({
  href,
  title,
  img,
  description,
}: categoryItemType) {
  return (
    <Link href={href} className="block group">
      <div className="bg-[#f3f3f2] rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105 flex flex-col h-full p-4 pt-6">
        <div className="relative flex items-center justify-center">
          <Image
            src={img}
            alt={title}
            width={350}
            height={180}
            className="object-cover rounded-md"
            unoptimized
          />
        </div>
        <div className="mt-4 text-center md:text-left flex-grow text-[#180614]">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p>{description}</p>
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            className="w-[160px] font-normal
              border border-[#df7163] bg-[#df7163] text-[#f3f3f2] rounded-full
              hover:bg-[#f3f3f2]  hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
              shadow hover:shadow-lg"
          >
            Explore more ≫
          </Button>
        </div>
      </div>
    </Link>
  );
}