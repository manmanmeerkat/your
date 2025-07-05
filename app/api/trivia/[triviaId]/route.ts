//api/trivia/[triviaId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: 個別一口メモの取得
export async function GET(
  request: NextRequest,
  { params }: { params: { triviaId: string } }
) {
  try {
    const trivia = await prisma.articleTrivia.findUnique({
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

// PUT: 個別一口メモの更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { triviaId: string } }
) {
  try {
    const body = await request.json();
    
    const updatedTrivia = await prisma.articleTrivia.update({
      where: { id: params.triviaId },
      data: {
        title: body.title,
        content: body.content,
        contentEn: body.contentEn,
        category: body.category,
        tags: body.tags,
        iconEmoji: body.iconEmoji,
        colorTheme: body.colorTheme,
        displayOrder: body.displayOrder,
        isActive: body.isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true,
      trivia: updatedTrivia 
    });
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

// DELETE: 個別一口メモの削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { triviaId: string } }
) {
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