// app/category-item/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CategoryItemClient from "./CategoryItemClient";

interface CategoryItemDetailProps {
  params: {
    slug: string;
  };
}

export default async function CategoryItemDetailPage({
  params,
}: CategoryItemDetailProps) {
  const item = await prisma.categoryItem.findUnique({
    where: { slug: params.slug },
    include: { images: true },
  });

  if (!item || !item.published) {
    notFound();
  }

  return <CategoryItemClient item={item} />;
}

// メタデータの生成（SEO対策）
export async function generateMetadata({ params }: CategoryItemDetailProps) {
  const item = await prisma.categoryItem.findUnique({
    where: { slug: params.slug },
    include: { images: true },
  });

  if (!item) {
    return {
      title: "Not Found",
      description: "This page does not exist",
    };
  }

  return {
    title: item.title,
    description: item.content || item.content?.substring(0, 155),
    openGraph: {
      title: item.title,
      description: item.content || item.content?.substring(0, 155),
      images: item.images?.[0] ? [{ url: item.images[0].url }] : [],
    },
  };
}
