import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CategoryCard({
  href,
  title,
  image,
  description,
}: {
  href: string;
  title: string;
  image: string;
  description: string;
}) {
  return (
    <Link href={href} className="block group h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform group-hover:scale-105 flex flex-col h-full p-4 pt-6">
        <div className="relative flex items-center justify-center">
          <Image
            src={image}
            alt={title}
            width={350}
            height={194}
            className="rounded-md"
          />
        </div>
        <div className="mt-4 text-center md:text-left flex-grow">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            className="w-[160px] font-normal
                border border-rose-700 bg-rose-700 text-white rounded-full
                hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                shadow hover:shadow-lg"
          >
            Explore more ≫
          </Button>
        </div>
      </div>
    </Link>
  );
}