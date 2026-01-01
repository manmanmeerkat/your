//api/trivia/[triviaId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: 個別一口メモの取得（記事またはカテゴリ項目用）
export async function GET(
  request: NextRequest,
  { params }: { params: { triviaId: string } }
) {
  try {
    // まず記事のtriviaから検索
    let trivia = await prisma.articleTrivia.findUnique({
      where: { id: params.triviaId },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true
          }
        }
      }
    });

    // 記事のtriviaが見つからない場合、カテゴリ項目のtriviaから検索
    if (!trivia) {
      const categoryItemTrivia = await prisma.categoryItemTrivia.findUnique({
        where: { id: params.triviaId },
        include: {
          categoryItem: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true
            }
          }
        }
      });

      if (categoryItemTrivia) {
        // カテゴリ項目のtriviaを記事のtriviaと同じ形式に変換
        trivia = {
          ...categoryItemTrivia,
          article: {
            id: categoryItemTrivia.categoryItem.id,
            title: categoryItemTrivia.categoryItem.title,
            slug: categoryItemTrivia.categoryItem.slug,
            category: categoryItemTrivia.categoryItem.category,
          }
        } as any;
      }
    }

    if (!trivia) {
      return NextResponse.json(
        { success: false, error: "Trivia not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      trivia 
    });
  } catch (error) {
    console.error("Error fetching trivia:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trivia" },
      { status: 500 }
    );
  }
}

// PUT: 個別一口メモの更新（記事またはカテゴリ項目用）
export async function PUT(
  request: NextRequest,
  { params }: { params: { triviaId: string } }
) {
  try {
    const body = await request.json();
    
    // 送信されたフィールドのみを更新する（部分更新対応）
    const updateData: {
      updatedAt: Date;
      title?: string;
      content?: string;
      contentEn?: string | null;
      category?: string;
      tags?: string[];
      iconEmoji?: string | null;
      colorTheme?: string | null;
      displayOrder?: number;
      isActive?: boolean;
    } = {
      updatedAt: new Date(),
    };
    
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.contentEn !== undefined) updateData.contentEn = body.contentEn;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.iconEmoji !== undefined) updateData.iconEmoji = body.iconEmoji;
    if (body.colorTheme !== undefined) updateData.colorTheme = body.colorTheme;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    // まず記事のtriviaから検索して更新を試行
    try {
      const updatedTrivia = await prisma.articleTrivia.update({
        where: { id: params.triviaId },
        data: updateData,
      });

      return NextResponse.json({ 
        success: true,
        trivia: updatedTrivia 
      });
    } catch (error) {
      // 記事のtriviaが見つからない場合、カテゴリ項目のtriviaを更新
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const updatedTrivia = await prisma.categoryItemTrivia.update({
          where: { id: params.triviaId },
          data: updateData,
        });

        return NextResponse.json({ 
          success: true,
          trivia: updatedTrivia 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error updating trivia:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Trivia not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update trivia" },
      { status: 500 }
    );
  }
}

// DELETE: 個別一口メモの削除（記事またはカテゴリ項目用）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { triviaId: string } }
) {
  try {
    // まず記事のtriviaから削除を試行
    try {
      const deletedTrivia = await prisma.articleTrivia.delete({
        where: { id: params.triviaId },
      });

      return NextResponse.json({ 
        success: true,
        message: "Trivia deleted successfully",
        trivia: deletedTrivia
      });
    } catch (error) {
      // 記事のtriviaが見つからない場合、カテゴリ項目のtriviaを削除
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const deletedTrivia = await prisma.categoryItemTrivia.delete({
          where: { id: params.triviaId },
        });

        return NextResponse.json({ 
          success: true,
          message: "Trivia deleted successfully",
          trivia: deletedTrivia
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error deleting trivia:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Trivia not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete trivia" },
      { status: 500 }
    );
  }
}