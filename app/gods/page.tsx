import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function GodsPage() {
  const items = await prisma.categoryItem.findMany({
    where: {
      category: "about-japanese-gods",
      published: true,
    },
    include: { images: true },
  });

  return (
    <div className="grid grid-cols-3 gap-8">
      {items.map((item) => (
        <Link href={`/category-item/${item.slug}`} key={item.id}>
          <Image
            src={item.images[0]?.url || "/placeholder.png"}
            alt={item.images[0]?.altText || item.title}
            width={200}
            height={200}
            className="rounded-full"
          />
          <h3>{item.title}</h3>
        </Link>
      ))}
    </div>
  );
}
