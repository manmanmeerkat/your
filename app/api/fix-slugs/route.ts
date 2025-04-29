// app/api/fix-slugs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // すべての記事を取得
    const articles = await prisma.article.findMany();
    console.log("データベース内の全記事:", articles.map(a => ({ id: a.id, slug: a.slug })));
    const updates = [];
    
    for (const article of articles) {
      // スラッグをハイフン区切りに統一
      const normalizedSlug = article.slug
        .replace(/\s+/g, '-')  // スペースをハイフンに変換
        .toLowerCase();        // 小文字に変換
      
      if (normalizedSlug !== article.slug) {
        // スラッグが異なる場合のみ更新
        console.log(`スラッグを更新: "${article.slug}" → "${normalizedSlug}"`);
        await prisma.article.update({
          where: { id: article.id },
          data: { slug: normalizedSlug }
        });
        
        updates.push({
          id: article.id,
          oldSlug: article.slug,
          newSlug: normalizedSlug
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `${updates.length} articles updated`,
      updates
    });
  } catch (error) {
    console.error('スラッグ修正エラー:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}