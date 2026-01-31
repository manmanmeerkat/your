// app/api/articles/route.ts
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { Prisma, Article, Image, ArticleTrivia } from '@prisma/client';

// 🆕 一口メモを含む記事型を定義
type ArticleWithImagesAndTrivia = Article & {
  images: Image[];
  trivia?: ArticleTrivia[];
};

// 🚀 接続プール最適化: 単一接続を再利用
let prismaConnectionPromise: Promise<void> | null = null;

async function ensurePrismaConnection() {
  if (!prismaConnectionPromise) {
    prismaConnectionPromise = prisma.$connect().catch((error) => {
      console.error('Prisma接続エラー:', error);
      prismaConnectionPromise = null; // リセットして再試行可能にする
      throw error;
    });
  }
  return prismaConnectionPromise;
}

// 📊 データベースクエリ最適化
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ensurePrismaConnection();
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`試行 ${attempt}/${maxRetries} 失敗:`, error);
      
      if (attempt < maxRetries) {
        // 指数バックオフで再試行
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        prismaConnectionPromise = null; // 接続をリセット
      }
    }
  }
  
  throw lastError;
}

// 🎯 並列クエリ実行でパフォーマンス改善（一口メモ対応）
async function getArticlesWithPagination(
  where: Prisma.ArticleWhereInput,
  page: number,
  pageSize: number,
  includeTrivia: boolean = false,
  includeTriviaDetails: boolean = false
): Promise<{ articles: ArticleWithImagesAndTrivia[]; totalCount: number }> {
  const skip = (page - 1) * pageSize;
  
  // 🆕 一口メモのinclude条件を動的に設定
  const triviaInclude = includeTrivia ? {
    where: includeTriviaDetails ? {} : { isActive: true },
    orderBy: { displayOrder: 'asc' } as const
  } : false;
  
  // 📈 重要: countとfindManyを並列実行
  const [articles, totalCount] = await Promise.all([
    executeWithRetry(() =>
      prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            // 🚀 最適化: フィーチャー画像優先、全画像取得も可能
            orderBy: [
              { isFeatured: 'desc' },
              { createdAt: 'asc' }
            ],
          },
          // 🆕 一口メモを含める
          trivia: triviaInclude,
        },
        skip,
        take: pageSize,
      })
    ),
    executeWithRetry(() => prisma.article.count({ where }))
  ]);
  
  return { articles, totalCount };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📊 記事一覧API: リクエスト受信');
    
    // URLからクエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    console.log('🔍 検索パラメータ:', params);
    
    // 📊 パラメータ解析（バリデーション強化）
    const publishedParam = searchParams.get('published');
    const categoryParam = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const searchType = searchParams.get('searchType') || 'title';
    
    // 🆕 一口メモ関連のパラメータ
    const includeImages = searchParams.get('includeImages') === 'true';
    const includeTrivia = searchParams.get('includeTrivia') === 'true';
    const includeTriviaDetails = searchParams.get('includeTriviaDetails') === 'true';
    
    console.log('🆕 一口メモパラメータ:', {
      includeImages,
      includeTrivia,
      includeTriviaDetails
    });
    
    // ページネーション用パラメータ（境界値チェック強化）
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10') || 10));
    
    console.log('📄 ページネーション:', { page, pageSize });
    
    // 🎯 クエリ条件構築の最適化
    const where: Prisma.ArticleWhereInput = {};
    
    // published パラメータ
    if (publishedParam !== null) {
      where.published = publishedParam === 'true';
    }
    
    // カテゴリフィルター
    if (categoryParam) {
      where.category = categoryParam;
    }
    
    // 🚀 検索機能の最適化（インデックス活用）
    if (searchQuery && searchQuery.trim() !== '') {
      const trimmedQuery = searchQuery.trim();
      console.log('🔍 検索実行:', { query: trimmedQuery, type: searchType });
      
      switch (searchType) {
        case 'title':
          where.title = {
            contains: trimmedQuery,
            mode: 'insensitive'
          };
          break;
        
        case 'content':
          where.content = {
            contains: trimmedQuery,
            mode: 'insensitive'
          };
          break;
        
        case 'both':
          where.OR = [
            {
              title: {
                contains: trimmedQuery,
                mode: 'insensitive'
              }
            },
            {
              content: {
                contains: trimmedQuery,
                mode: 'insensitive'
              }
            }
          ];
          break;
        
        default:
          where.title = {
            contains: trimmedQuery,
            mode: 'insensitive'
          };
      }
    }
    
    console.log('🎯 検索条件:', where);
    
    // 📊 メインクエリ実行（一口メモ対応）
    const { articles, totalCount } = await getArticlesWithPagination(
      where, 
      page, 
      pageSize, 
      includeTrivia, 
      includeTriviaDetails
    );
    
    // 🆕 一口メモ統計情報をログ出力
    if (includeTrivia) {
      console.log('📝 一口メモ統計:');
      articles.forEach((article, index) => {
        const triviaCount = article.trivia?.length || 0;
        const activeTriviaCount = article.trivia?.filter(t => t.isActive).length || 0;
        
        if (triviaCount > 0) {
          console.log(`  記事 ${index + 1}: "${article.title}" - 一口メモ ${triviaCount}件 (アクティブ: ${activeTriviaCount}件)`);
        }
      });
      
      const totalTrivia = articles.reduce((sum, article) => sum + (article.trivia?.length || 0), 0);
      const totalActiveTrivia = articles.reduce((sum, article) => 
        sum + (article.trivia?.filter(t => t.isActive).length || 0), 0);
      
      console.log(`📊 全体統計: 一口メモ総数 ${totalTrivia}件, アクティブ ${totalActiveTrivia}件`);
    }
    
    const pageCount = Math.ceil(totalCount / pageSize) || 1;
    const processingTime = Date.now() - startTime;
    
    console.log('✅ 処理完了:', {
      記事数: articles.length,
      総件数: totalCount,
      処理時間: `${processingTime}ms`,
      一口メモ含む: includeTrivia
    });
    
    // 🚀 レスポンス最適化
    const response = NextResponse.json({
      articles,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        pageCount
      },
      // 🆕 パフォーマンス情報（開発時のみ）
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          processingTime,
          queryParams: params,
          articlesFound: articles.length,
          triviaIncluded: includeTrivia,
          totalTriviaCount: includeTrivia ? 
            articles.reduce((sum, article) => sum + (article.trivia?.length || 0), 0) : 0
        }
      })
    });
    
    // 📈 キャッシュヘッダーの最適化（一口メモ含む場合は短時間キャッシュ）
    if (includeTrivia) {
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    }
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=3600');
    response.headers.set('Vary', 'Accept-Encoding');
    
    // 📊 ETag対応（データに基づく）
    const etag = `"${totalCount}-${page}-${pageSize}-${articles[0]?.updatedAt?.getTime() || 0}-${includeTrivia ? 'trivia' : 'no-trivia'}"`;
    response.headers.set('ETag', etag);
    
    return response;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ 記事一覧取得エラー:', error);
    console.error('⏱️ エラー発生時の処理時間:', `${processingTime}ms`);
    
    // 📊 エラー詳細ログ
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('🔍 Prismaエラー詳細:', {
        code: error.code,
        meta: error.meta,
        message: error.message
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : String(error),
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        // フォールバック値
        articles: [],
        pagination: {
          total: 0,
          page: Math.max(1, parseInt(new URL(request.url).searchParams.get('page') || '1') || 1),
          pageSize: Math.min(50, Math.max(1, parseInt(new URL(request.url).searchParams.get('pageSize') || '10') || 10)),
          pageCount: 1
        }
      },
      { status: 500 }
    );
  }
}

// 🆕 POST method（一口メモ対応を追加）
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📝 記事作成API: リクエスト受信');
    
    // 🚀 リクエストボディの最適化パース
    let requestBody: {
      title?: string;
      slug?: string;
      content?: string;
      category?: string;
      summary?: string;
      description?: string;
      published?: boolean;
      images?: Array<{
        url: string;
        altText?: string;
        isFeatured?: boolean;
      }>;
      // 🆕 一口メモ初期データ（オプション）
      trivia?: Array<{
        title: string;
        content: string;
        contentEn?: string;
        category?: string;
        tags?: string[];
        iconEmoji?: string;
        colorTheme?: string;
        isActive?: boolean;
      }>;
    };
    
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('❌ JSON解析エラー:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    console.log('📄 受信データ（抜粋）:', {
      title: requestBody.title,
      slug: requestBody.slug,
      category: requestBody.category,
      imagesCount: requestBody.images?.length || 0,
      triviaCount: requestBody.trivia?.length || 0
    });
    
    // 📊 バリデーション強化
    const { title, slug, content, category } = requestBody;
    const missing = [];
    
    if (!title?.trim()) missing.push('title');
    if (!slug?.trim()) missing.push('slug');
    if (!content?.trim()) missing.push('content');
    if (!category?.trim()) missing.push('category');
    
    if (missing.length > 0) {
      return NextResponse.json(
        { 
          error: '必須フィールドが不足しています',
          missing
        },
        { status: 400 }
      );
    }
    
    // 🔍 スラッグの重複チェック（最適化）
    const existingArticle = await executeWithRetry(() =>
      prisma.article.findUnique({
        where: { slug: slug!.trim() },
        select: { id: true } // 必要最小限のデータのみ取得
      })
    );
    
    if (existingArticle) {
      return NextResponse.json(
        { error: 'Slug already exists', slug: slug!.trim() },
        { status: 400 }
      );
    }
    
    // 📊 記事データの準備（サニタイズ）
    const articleData: Prisma.ArticleCreateInput = {
      title: title!.trim(),
      slug: slug!.trim(),
      summary: requestBody.summary?.trim() || '',
      description: requestBody.description?.trim() || '',
      content: content!.trim(),
      category: category!.trim(),
      published: Boolean(requestBody.published),
    };
    
    console.log('✍️ 作成する記事データ:', {
      title: articleData.title,
      slug: articleData.slug,
      category: articleData.category,
      published: articleData.published
    });
    
    // 🚀 トランザクション使用で整合性保証（一口メモ対応）
    const result = await executeWithRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        // 記事を作成
        const article = await tx.article.create({
          data: articleData,
        });
        
        console.log('✅ 記事作成成功:', article.id);
        
        // 画像の一括処理（パフォーマンス改善）
        if (requestBody.images && Array.isArray(requestBody.images) && requestBody.images.length > 0) {
          console.log('🖼️ 画像処理開始:', requestBody.images.length, '個の画像');
          
          // 📊 画像データのバリデーションとサニタイズ
          const validImages = requestBody.images
            .filter((img) => img?.url?.trim())
            .map((img, index: number) => ({
              articleId: article.id,
              url: img.url.trim(),
              altText: img.altText?.trim() || `${title} - Image ${index + 1}`,
              isFeatured: Boolean(img.isFeatured),
            }));
          
          if (validImages.length > 0) {
            // 🚀 一括作成でパフォーマンス向上
            await tx.image.createMany({
              data: validImages,
              skipDuplicates: true, // 重複を自動スキップ
            });
            console.log(`✅ 画像処理完了: ${validImages.length}個の画像を保存`);
          }
        }
        
        // 🆕 一口メモの一括処理
        if (requestBody.trivia && Array.isArray(requestBody.trivia) && requestBody.trivia.length > 0) {
          console.log('📝 一口メモ処理開始:', requestBody.trivia.length, '個の一口メモ');
          
          const validTrivia = requestBody.trivia
            .filter((trivia) => trivia?.title?.trim() && trivia?.content?.trim())
            .map((trivia, index: number) => ({
              articleId: article.id,
              title: trivia.title.trim(),
              content: trivia.content.trim(),
              contentEn: trivia.contentEn?.trim() || null,
              category: trivia.category?.trim() || 'default',
              tags: trivia.tags || [],
              iconEmoji: trivia.iconEmoji?.trim() || null,
              colorTheme: trivia.colorTheme?.trim() || null,
              displayOrder: index + 1,
              isActive: trivia.isActive ?? true,
            }));
          
          if (validTrivia.length > 0) {
            await tx.articleTrivia.createMany({
              data: validTrivia,
              skipDuplicates: true,
            });
            console.log(`✅ 一口メモ処理完了: ${validTrivia.length}個の一口メモを保存`);
          }
        }
        
        // 作成した記事を画像・一口メモ付きで取得
        return await tx.article.findUnique({
          where: { id: article.id },
          include: { 
            images: true,
            trivia: {
              orderBy: { displayOrder: 'asc' }
            }
          },
        });
      });
    });
    
    const processingTime = Date.now() - startTime;
    console.log('✅ 記事作成処理完了:', `${processingTime}ms`);
    
    const response = NextResponse.json(
      {
        message: '記事を作成しました',
        article: result,
        // 🆕 パフォーマンス情報（開発時のみ）
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            processingTime,
            imagesCount: result?.images?.length || 0,
            triviaCount: result?.trivia?.length || 0
          }
        })
      },
      { status: 201 }
    );
    
    // 📊 作成後のキャッシュ無効化
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
    
  } catch (error: unknown) {
    const processingTime = Date.now() - startTime;
    console.error('❌ 記事作成API エラー:', error);
    console.error('⏱️ エラー発生時の処理時間:', `${processingTime}ms`);
    
    // 📊 詳細エラーログ
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('🔍 Prisma作成エラー詳細:', {
        code: error.code,
        meta: error.meta,
        message: error.message
      });
    }
    
    return NextResponse.json(
      {
        error: '記事の作成に失敗しました',
        message: error instanceof Error ? error.message : String(error),
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            processingTime,
            errorType: error instanceof Error ? error.constructor.name : typeof error
          }
        })
      },
      { status: 500 }
    );
  }
}

// 🚀 UPDATE method（一口メモ対応）
export async function PATCH(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('id');
    const includeTrivia = searchParams.get('includeTrivia') === 'true';
    
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    const requestBody = await request.json();
    const { title, slug, content, category, summary, description, published } = requestBody;
    
    // 🔍 記事存在チェック
    const existingArticle = await executeWithRetry(() =>
      prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true, slug: true }
      })
    );
    
    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // スラッグ変更時の重複チェック
    if (slug && slug !== existingArticle.slug) {
      const duplicateSlug = await executeWithRetry(() =>
        prisma.article.findUnique({
          where: { slug: slug.trim() },
          select: { id: true }
        })
      );
      
      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'Slug already exists', slug: slug.trim() },
          { status: 400 }
        );
      }
    }
    
    // 📊 更新データの準備
    const updateData: Prisma.ArticleUpdateInput = {};
    
    if (title?.trim()) updateData.title = title.trim();
    if (slug?.trim()) updateData.slug = slug.trim();
    if (content?.trim()) updateData.content = content.trim();
    if (category?.trim()) updateData.category = category.trim();
    if (summary !== undefined) updateData.summary = summary?.trim() || '';
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (published !== undefined) updateData.published = Boolean(published);
    
    // 🚀 記事更新（一口メモ含む）
    const updatedArticle = await executeWithRetry(() =>
      prisma.article.update({
        where: { id: articleId },
        data: updateData,
        include: {
          images: true,
          trivia: includeTrivia ? {
            orderBy: { displayOrder: 'asc' }
          } : false
        },
      })
    );
    
    const processingTime = Date.now() - startTime;
    console.log('✅ 記事更新完了:', `${processingTime}ms`);
    
    const response = NextResponse.json({
      message: '記事を更新しました',
      article: updatedArticle,
      ...(process.env.NODE_ENV === 'development' && {
        debug: { 
          processingTime,
          triviaIncluded: includeTrivia,
          triviaCount: updatedArticle.trivia?.length || 0
        }
      })
    });
    
    // キャッシュ無効化
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ 記事更新エラー:', error);
    
    return NextResponse.json(
      {
        error: '記事の更新に失敗しました',
        message: error instanceof Error ? error.message : String(error),
        ...(process.env.NODE_ENV === 'development' && {
          debug: { processingTime }
        })
      },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE method（一口メモ対応）
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const articleId = searchParams.get('id');
    
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    // 🚀 トランザクションで関連データも削除（一口メモ含む）
    await executeWithRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        // 関連画像を先に削除
        await tx.image.deleteMany({
          where: { articleId }
        });
        
        // 🆕 関連一口メモを削除
        await tx.articleTrivia.deleteMany({
          where: { articleId }
        });
        
        // 記事を削除
        await tx.article.delete({
          where: { id: articleId }
        });
      });
    });
    
    const processingTime = Date.now() - startTime;
    console.log('✅ 記事削除完了:', `${processingTime}ms`);
    
    const response = NextResponse.json({
      message: '記事と関連データ（画像・一口メモ）を削除しました',
      articleId,
      ...(process.env.NODE_ENV === 'development' && {
        debug: { processingTime }
      })
    });
    
    // キャッシュ無効化
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ 記事削除エラー:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        error: '記事の削除に失敗しました',
        message: error instanceof Error ? error.message : String(error),
        ...(process.env.NODE_ENV === 'development' && {
          debug: { processingTime }
        })
      },
      { status: 500 }
    );
  }
}