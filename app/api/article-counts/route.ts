import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prisma クライアントをグローバルに保持（hot reload 対策）
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: NextRequest) {
  try {
    console.log('カテゴリー記事数API: リクエスト受信');
    
    // 公開済み記事のみカウント
    const publishedCondition = { published: true };
    
    // 各カテゴリーごとの記事数を取得
    const categoryCounts = await Promise.all([
      // culture カテゴリーの記事数
      prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'culture',
        },
      }),
      // mythology カテゴリーの記事数
      prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'mythology',
        },
      }),
      // customs カテゴリーの記事数
      prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'customs',
        },
      }),
      // festivals カテゴリーの記事数
      prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'festivals',
        },
      }),
    ]);
    
    // カテゴリーごとの記事数をオブジェクトに整形
    const counts = {
      culture: categoryCounts[0],
      mythology: categoryCounts[1],
      customs: categoryCounts[2],
      festivals: categoryCounts[3],
    };
    
    console.log('カテゴリー記事数取得成功:', counts);
    
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('カテゴリー記事数取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}