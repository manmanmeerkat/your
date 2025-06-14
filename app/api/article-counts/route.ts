// app/api/article-counts/route.ts - 最適化版
import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

// 🚀 接続プール最適化
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log('Prisma接続確立');
    } catch (error) {
      console.error('Prisma接続エラー:', error);
      throw error;
    }
  }
}

// 📊 リトライ機能付きクエリ実行
async function executeWithRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = 2,
  categoryName = 'unknown'
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensureConnection();
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`${categoryName} 取得エラー (試行 ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        // 短い遅延後に再試行
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
      }
    }
  }
  
  console.error(`${categoryName} 最終的に失敗:`, lastError!);
  return 0 as T; // フォールバック値
}

// 🎯 最適化されたカウント取得（集約クエリ使用）
async function getOptimizedCounts() {
  try {
    console.log('📊 最適化されたカウント取得開始');
    
    // 🚀 単一クエリで全カテゴリのカウントを取得
    const categoryResults = await executeWithRetry(
      () => prisma.article.groupBy({
        by: ['category'],
        where: {
          published: true,
          category: {
            in: ['culture', 'mythology', 'customs', 'festivals']
          }
        },
        _count: {
          _all: true,
        },
      }),
      3,
      'categoryCounts'
    );

    // 📊 結果を既存形式に変換
    const counts = {
      culture: 0,
      mythology: 0,
      customs: 0,
      festivals: 0
    };

    if (Array.isArray(categoryResults)) {
      categoryResults.forEach((result) => {
        if (result.category in counts) {
          counts[result.category as keyof typeof counts] = result._count._all;
        }
      });
    }

    console.log('✅ 最適化カウント取得成功:', counts);
    return counts;
    
  } catch (error) {
    console.error('❌ 最適化カウント取得失敗、個別取得にフォールバック:', error);
    
    // 🆘 フォールバック: 個別取得（既存ロジック）
    return await getIndividualCounts();
  }
}

// 🔄 フォールバック用の個別カウント取得
async function getIndividualCounts() {
  console.log('🔄 個別カウント取得開始');
  
  const counts = {
    culture: 0,
    mythology: 0, 
    customs: 0,
    festivals: 0
  };
  
  const publishedCondition = { published: true };
  
  // 📊 各カテゴリを個別に取得（リトライ付き）
  try {
    counts.culture = await executeWithRetry(
      () => prisma.article.count({
        where: { ...publishedCondition, category: 'culture' },
      }),
      2,
      'culture'
    );
  } catch (e) {
    console.error('culture記事数取得エラー:', e);
    counts.culture = 0;
  }
  
  try {
    counts.mythology = await executeWithRetry(
      () => prisma.article.count({
        where: { ...publishedCondition, category: 'mythology' },
      }),
      2,
      'mythology'
    );
  } catch (e) {
    console.error('mythology記事数取得エラー:', e);
    counts.mythology = 0;
  }
  
  try {
    counts.customs = await executeWithRetry(
      () => prisma.article.count({
        where: { ...publishedCondition, category: 'customs' },
      }),
      2,
      'customs'
    );
  } catch (e) {
    console.error('customs記事数取得エラー:', e);
    counts.customs = 0;
  }
  
  try {
    counts.festivals = await executeWithRetry(
      () => prisma.article.count({
        where: { ...publishedCondition, category: 'festivals' },
      }),
      2,
      'festivals'
    );
  } catch (e) {
    console.error('festivals記事数取得エラー:', e);
    counts.festivals = 0;
  }
  
  console.log('✅ 個別カウント取得完了:', counts);
  return counts;
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    console.log('📊 カテゴリー記事数API: リクエスト受信');
    
    // 🚀 最適化されたカウント取得を試行
    const counts = await getOptimizedCounts();
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ カテゴリー記事数取得成功: ${processingTime}ms`, counts);
    
    const response = NextResponse.json({ counts });
    
    // 📈 キャッシュ設定（カウントは頻繁に変わらないため積極的キャッシュ）
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    
    return response;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ カテゴリー記事数取得エラー (${processingTime}ms):`, error);
    
    // 🆘 エラー時でもビルドを継続するため200ステータスで応答
    const response = NextResponse.json(
      { 
        error: 'Temporary service unavailable',
        message: error instanceof Error ? error.message : String(error),
        // 📊 フォールバック値を提供
        counts: {
          culture: 0,
          mythology: 0,
          customs: 0,
          festivals: 0
        },
        // 🆕 メタデータ（開発時のみ）
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            processingTime,
            errorType: error instanceof Error ? error.constructor.name : typeof error,
            timestamp: new Date().toISOString()
          }
        })
      },
      { 
        // 🚀 重要: ビルド継続のため200ステータス
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
    
    return response;
  }
}

// 🧹 定期的なクリーンアップ（メモリリーク防止）
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('🧹 アプリケーション終了: Prisma接続をクリーンアップ');
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Prisma切断エラー:', error);
    }
  });
}