// app/api/article-counts/route.ts
// app/api/article-counts/route.ts
import { prisma } from '../../../lib/prisma'; // 名前付きインポートに変更
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('カテゴリー記事数API: リクエスト受信');
    
    // 公開済み記事のみカウント
    const publishedCondition = { published: true };
    
    // 各カテゴリーの記事数を順次取得（並列処理を避ける）
    const counts = {
      culture: 0,
      mythology: 0, 
      customs: 0,
      festivals: 0
    };
    
    try {
      counts.culture = await prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'culture',
        },
      });
    } catch (e) {
      console.error('culture記事数取得エラー:', e);
    }
    
    try {
      counts.mythology = await prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'mythology',
        },
      });
    } catch (e) {
      console.error('mythology記事数取得エラー:', e);
    }
    
    try {
      counts.customs = await prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'customs',
        },
      });
    } catch (e) {
      console.error('customs記事数取得エラー:', e);
    }
    
    try {
      counts.festivals = await prisma.article.count({
        where: {
          ...publishedCondition,
          category: 'festivals',
        },
      });
    } catch (e) {
      console.error('festivals記事数取得エラー:', e);
    }
    
    console.log('カテゴリー記事数取得成功:', counts);
    
    return NextResponse.json({ counts });
  } catch (error) {
    console.error('カテゴリー記事数取得エラー:', error);
    
    // エラー時にもクライアントが処理できるデータを返す
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
        // フォールバック値も提供
        counts: {
          culture: 0,
          mythology: 0,
          customs: 0,
          festivals: 0
        }
      },
      { status: 500 }
    );
  }
}