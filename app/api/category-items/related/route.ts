import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0; // 任意：毎回DBから取りたいなら

export async function GET(request: NextRequest) {
  try {
    // ✅ request.url を使わない
    const sp = request.nextUrl.searchParams;

    const category = sp.get("category");
    const excludeId = sp.get("excludeId");
    const limit = Math.min(Math.max(Number(sp.get("limit") ?? 3), 1), 12); // 1〜12に制限

    if (!category) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const related = await prisma.categoryItem.findMany({
      where: {
        published: true,
        category,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        createdAt: true,
        images: {
          take: 1,
          orderBy: [{ isFeatured: "desc" }, { id: "asc" }], // ✅ featured優先→先頭
          select: { url: true, altText: true },
        },
      },
    });

    // ✅ related用DTO（軽い）
    const items = related.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      href: `/category-item/${a.slug}`,
      imageUrl: a.images?.[0]?.url ?? null,
      imageAlt: a.images?.[0]?.altText ?? a.title,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching related items:", error);
    return NextResponse.json({ items: [] }, { status: 200 }); // relatedは落ちてもページ壊さない設計が安心
  }
}
