//api/trivia/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: 新しい一口メモを作成（記事またはカテゴリ項目用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, categoryItemId, ...triviaData } = body;

    // どちらか一方のIDが必要
    if (!articleId && !categoryItemId) {
      return NextResponse.json(
        { success: false, error: "Either articleId or categoryItemId is required" },
        { status: 400 }
      );
    }

    if (articleId && categoryItemId) {
      return NextResponse.json(
        { success: false, error: "Cannot specify both articleId and categoryItemId" },
        { status: 400 }
      );
    }

    let newTrivia;

    if (articleId) {
      // 記事の存在確認
      const article = await prisma.article.findUnique({
        where: { id: articleId }
      });

      if (!article) {
        return NextResponse.json(
          { success: false, error: "Article not found" },
          { status: 404 }
        );
      }

      // 表示順序の自動設定
      const maxOrder = await prisma.articleTrivia.findFirst({
        where: { articleId },
        orderBy: { displayOrder: 'desc' }
      });

      newTrivia = await prisma.articleTrivia.create({
        data: {
          articleId,
          title: triviaData.title,
          content: triviaData.content,
          contentEn: triviaData.contentEn,
          category: triviaData.category || 'default',
          tags: triviaData.tags || [],
          iconEmoji: triviaData.iconEmoji,
          colorTheme: triviaData.colorTheme,
          displayOrder: triviaData.displayOrder ?? (maxOrder?.displayOrder || 0) + 1,
          isActive: triviaData.isActive ?? true,
        },
      });
    } else if (categoryItemId) {
      // カテゴリ項目の存在確認
      const categoryItem = await prisma.categoryItem.findUnique({
        where: { id: categoryItemId }
      });

      if (!categoryItem) {
        return NextResponse.json(
          { success: false, error: "Category item not found" },
          { status: 404 }
        );
      }

      // 表示順序の自動設定
      const maxOrder = await prisma.categoryItemTrivia.findFirst({
        where: { categoryItemId },
        orderBy: { displayOrder: 'desc' }
      });

      newTrivia = await prisma.categoryItemTrivia.create({
        data: {
          categoryItemId,
          title: triviaData.title,
          content: triviaData.content,
          contentEn: triviaData.contentEn,
          category: triviaData.category || 'default',
          tags: triviaData.tags || [],
          iconEmoji: triviaData.iconEmoji,
          colorTheme: triviaData.colorTheme,
          displayOrder: triviaData.displayOrder ?? (maxOrder?.displayOrder || 0) + 1,
          isActive: triviaData.isActive ?? true,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      trivia: newTrivia 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating trivia:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create trivia" },
      { status: 500 }
    );
  }
}