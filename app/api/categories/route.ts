// app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Prisma クライアントをグローバルに保持（hot reload 対策）
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: NextRequest) {
  try {
    console.log('カテゴリー一覧API: リクエスト受信');
    
    // 方法1: カテゴリーテーブルが存在する場合
    /* 
    // カテゴリーをデータベースから取得
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json({ categories });
    */
    
    // 方法2: 記事テーブルからユニークなカテゴリーを抽出する場合
    // 記事テーブルから全カテゴリーを抽出
    const articleCategories = await prisma.article.findMany({
      select: {
        category: true,
      },
      where: {
        category: {
          not: undefined,
        },
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });
    
    // 重複を排除して整形
    const categories = articleCategories
      .map(item => ({ name: item.category }))
      .filter(item => item.name); // null/undefinedをフィルタリング
    
    console.log(`${categories.length}件のカテゴリーを取得しました`);
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('カテゴリー一覧取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
}