//api/trivia/article/[articleId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 特定記事の一口メモ一覧取得
export async function GET(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const triviaList = await prisma.articleTrivia.findMany({
      where: { articleId: params.articleId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ 
      success: true,
      trivia: triviaList,
      count: triviaList.length
    });
  } catch (error) {
    console.error("Error fetching trivia:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trivia" },
      { status: 500 }
    );
  }
}

// POST: 特定記事に新しい一口メモを作成
export async function POST(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const body = await request.json();
    
    // 記事の存在確認
    const article = await prisma.article.findUnique({
      where: { id: params.articleId }
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" },
        { status: 404 }
      );
    }

    // 表示順序の自動設定（最後に追加）
    const maxOrder = await prisma.articleTrivia.findFirst({
      where: { articleId: params.articleId },
      orderBy: { displayOrder: 'desc' }
    });

    const newTrivia = await prisma.articleTrivia.create({
      data: {
        articleId: params.articleId,
        title: body.title,
        content: body.content,
        contentEn: body.contentEn,
        category: body.category || 'default',
        tags: body.tags || [],
        iconEmoji: body.iconEmoji,
        colorTheme: body.colorTheme,
        displayOrder: body.displayOrder ?? (maxOrder?.displayOrder || 0) + 1,
        isActive: body.isActive ?? true,
      },
    });

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

// DELETE: 特定記事の全一口メモを削除（管理者用）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const deletedTrivia = await prisma.articleTrivia.deleteMany({
      where: { articleId: params.articleId },
    });

    return NextResponse.json({ 
      success: true,
      message: `${deletedTrivia.count} trivia items deleted`,
      deletedCount: deletedTrivia.count
    });
  } catch (error) {
    console.error("Error deleting all trivia:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete trivia" },
      { status: 500 }
    );
  }
}