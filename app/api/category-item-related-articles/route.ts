import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RelatedItem = {
  id: string;
  slug: string;
  title: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

function pickRandom<T>(arr: T[], n: number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") || "";
  const currentSlug = searchParams.get("currentSlug") || "";
  const take = Math.max(1, Math.min(Number(searchParams.get("take") || "3"), 6));
  const pool = Math.max(10, Math.min(Number(searchParams.get("pool") || "60"), 300));

  if (!category || !currentSlug) {
    return NextResponse.json({ items: [] satisfies RelatedItem[] }, { status: 400 });
  }

  const candidates = await prisma.categoryItem.findMany({
    where: {
      published: true,
      category,
      NOT: { slug: currentSlug },
    },
    orderBy: { createdAt: "desc" },
    take: pool,
    select: {
      id: true,
      slug: true,
      title: true,
      images: {
        take: 1,
        orderBy: [{ isFeatured: "desc" }, { id: "asc" }],
        select: { url: true, altText: true },
      },
    },
  });

  const mapped: RelatedItem[] = candidates.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    href: `/category-item/${a.slug}`,
    imageUrl: a.images?.[0]?.url ?? null,
    imageAlt: a.images?.[0]?.altText ?? a.title,
  }));

  const items = pickRandom(mapped, take);

  return NextResponse.json(
    { items },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}