import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// サーバー起動時のウォームアップ処理
export async function GET() {
  try {
    console.log('Prisma接続ウォームアップを開始...');
    
    // 単純なクエリを実行してプリペアドステートメントを初期化
    await prisma.$executeRaw`SELECT 1`;
    
    // 基本的なテーブルカウントを実行
    const articleCount = await prisma.article.count();
    
    console.log('Prisma接続ウォームアップ成功:', { articleCount });
    
    return NextResponse.json({ status: 'ok', message: 'Database connection warmed up' });
  } catch (error) {
    console.error('Prismaウォームアップエラー:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to warm up database connection' },
      { status: 500 }
    );
  }
}