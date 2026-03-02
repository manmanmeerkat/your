import { NextResponse } from "next/server";
import { getRandomRelatedArticles } from "@/lib/sidebar/getRelatedArticles";

export const dynamic = "force-dynamic"; // ✅ 毎回実行させる

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") || "";
  const currentSlug = searchParams.get("currentSlug") || "";
  const take = Number(searchParams.get("take") || "6");
  const pool = Number(searchParams.get("pool") || "300");

  if (!category || !currentSlug) {
    return NextResponse.json({ items: [] }, { status: 400 });
  }

  try {
    const items = await getRandomRelatedArticles({
      category,
      currentSlug,
      take,
      pool,
    });

    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store", // ✅ キャッシュさせない
        },
      }
    );
  } catch {
    return NextResponse.json(
      { items: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}