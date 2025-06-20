//api/trivia/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 全一口メモの取得（管理者用・統計用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const limit = searchParams.get('limit');

    const where = {
      ...(category && { category }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
    };

    const triviaList = await prisma.articleTrivia.findMany({
      where,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true
          }
        }
      },
      orderBy: [
        { article: { updatedAt: 'desc' } },
        { displayOrder: 'asc' }
      ],
      ...(limit && { take: parseInt(limit) }),
    });

    // 統計情報
    const stats = {
      total: triviaList.length,
      active: triviaList.filter(t => t.isActive).length,
      categories: [...new Set(triviaList.map(t => t.category))],
    };

    return NextResponse.json({ 
      success: true,
      trivia: triviaList,
      stats
    });
  } catch (error) {
    console.error("Error fetching all trivia:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trivia" },
      { status: 500 }
    );
  }
}