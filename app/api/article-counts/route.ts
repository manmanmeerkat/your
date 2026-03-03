// app/api/article-counts/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const IS_DEV = process.env.NODE_ENV === "development";
const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
const IS_NON_PROD = IS_DEV || IS_PREVIEW;

// Dev/Preview: 常に最新
// Prod: deploy-driven（基本固定）
export const dynamic = IS_NON_PROD ? "force-dynamic" : "force-static";
export const revalidate = IS_NON_PROD ? 0 : false;

export async function GET() {
  try {
    // ✅ 速くて1回で済む（おすすめ）
    const rows = await prisma.article.groupBy({
      by: ["category"],
      where: { published: true },
      _count: { _all: true },
    });

    const counts = { culture: 0, mythology: 0, customs: 0, festivals: 0 };

    for (const r of rows) {
      const key = r.category as keyof typeof counts;
      if (key in counts) counts[key] = r._count._all;
    }

    const res = NextResponse.json({ counts });

    // Prodは長めにキャッシュしてOK（デプロイで更新される想定）
    if (!IS_NON_PROD) {
      res.headers.set("Cache-Control", "public, s-maxage=31536000, immutable");
    } else {
      res.headers.set("Cache-Control", "no-store");
    }

    return res;
  } catch (e) {
    // 🔥 ここは 200固定にしなくてもOK（ページ側でfallbackするなら）
    return NextResponse.json(
      { counts: { culture: 0, mythology: 0, customs: 0, festivals: 0 } },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}