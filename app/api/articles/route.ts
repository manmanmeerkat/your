// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // デフォルトインポートに変更
import { Prisma, Article, Image } from '@prisma/client'; // 型をインポート

// 記事と画像を含む型を定義
type ArticleWithImages = Article & {
  images: Image[];
};

// 接続リセット関数
async function resetPrismaConnection() {
  try {
    await prisma.$disconnect();
    // 再接続は自動的に行われる
    console.log('Prisma接続をリセットしました');
  } catch (error) {
    console.error('Prisma接続リセットエラー:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // 接続をリセット
    await resetPrismaConnection();
    
    console.log('記事一覧API: リクエスト受信');
    
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    console.log('検索パラメータ:', Object.fromEntries(searchParams.entries()));
    
    const publishedParam = searchParams.get('published');
    const categoryParam = searchParams.get('category');
    const searchQuery = searchParams.get('search');
    const searchType = searchParams.get('searchType') || 'title'; // 新しく追加
    
    // ページネーション用パラメータ
    let page = 1;
    let pageSize = 10;
    
    try {
      const pageParam = searchParams.get('page');
      if (pageParam) page = parseInt(pageParam);
      
      const pageSizeParam = searchParams.get('pageSize');
      if (pageSizeParam) pageSize = parseInt(pageSizeParam);
    } catch (e) {
      console.error('ページネーションパラメータ解析エラー:', e);
    }
    
    // NaN チェック
    if (isNaN(page)) page = 1;
    if (isNaN(pageSize)) pageSize = 10;
    
    const skip = (page - 1) * pageSize;
    
    // クエリ条件を構築
    const where: Prisma.ArticleWhereInput = {};
    
    // published パラメータが指定されている場合のみフィルタリング
    if (publishedParam !== null) {
      where.published = publishedParam === 'true';
    }
    
    // カテゴリが指定されている場合
    if (categoryParam) {
      where.category = categoryParam;
    }
    
    // キーワード検索が指定されている場合（修正された部分）
    if (searchQuery && searchQuery.trim() !== '') {
      const trimmedQuery = searchQuery.trim();
      console.log('検索実行:', { query: trimmedQuery, type: searchType });
      
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
          // デフォルトはタイトル検索
          where.title = {
            contains: trimmedQuery,
            mode: 'insensitive'
          };
      }
    }
    
    console.log('検索条件:', where);
    console.log('ページネーション:', { page, pageSize, skip });
    
    // エラーハンドリングを分離
    let totalCount = 0;
    // 明示的に型を指定
    let articles: ArticleWithImages[] = [];
    
    try {
      // 記事の総数を取得（ページネーション用）
      totalCount = await prisma.article.count({ where });
    } catch (countError) {
      console.error('記事数取得エラー:', countError);
      // エラー発生時は再試行
      await resetPrismaConnection();
      try {
        totalCount = await prisma.article.count({ where });
      } catch (retryError) {
        console.error('記事数再取得エラー:', retryError);
        // フォールバック値を使用
        totalCount = 0;
      }
    }
    
    try {
      // 記事をデータベースから取得
      articles = await prisma.article.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          images: true,
        },
        skip,
        take: pageSize,
      });
    } catch (articlesError) {
      console.error('記事取得エラー:', articlesError);
      // エラー発生時は再試行（より単純なクエリで）
      await resetPrismaConnection();
      try {
        const simpleArticles = await prisma.article.findMany({
          where,
          take: pageSize,
        });
        // 型を合わせるため空の画像配列を追加
        articles = simpleArticles.map(article => ({
          ...article,
          images: []
        }));
      } catch (retryError) {
        console.error('記事再取得エラー:', retryError);
        // 空の配列を使用
        articles = [];
      }
    }
    
    // ページネーション情報を含めてレスポンス
    return NextResponse.json({
      articles,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        pageCount: Math.ceil(totalCount / pageSize) || 1
      }
    });
  } catch (error) {
    console.error('記事一覧取得エラー:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : String(error),
        // フォールバック値も提供
        articles: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 10,
          pageCount: 1
        }
      },
      { status: 500 }
    );
  } finally {
    // 処理完了後に明示的に切断
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('切断エラー:', disconnectError);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 接続をリセット
    await resetPrismaConnection();
    
    console.log('記事作成API: リクエスト受信');
    
    // リクエストボディを取得
    const requestBody = await request.json();
    console.log('受信データ（抜粋）:', {
      title: requestBody.title,
      slug: requestBody.slug,
      category: requestBody.category,
      imagesCount: requestBody.images?.length || 0
    });
    
    // 必須データの検証
    const { title, slug, content, category } = requestBody;
    
    if (!title || !slug || !content || !category) {
      return NextResponse.json(
        { 
          error: '必須フィールドが不足しています',
          missing: Object.entries({ title, slug, content, category })
            .filter(([, v]) => !v)
            .map(([k]) => k)
        },
        { status: 400 }
      );
    }
    
    // スラッグの重複チェック
    let existingArticle: Article | null = null;
    try {
      existingArticle = await prisma.article.findUnique({
        where: { slug },
      });
    } catch (findError) {
      console.error('記事重複チェックエラー:', findError);
      await resetPrismaConnection();
      // 再試行
      existingArticle = await prisma.article.findUnique({
        where: { slug },
      });
    }
    
    if (existingArticle) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    
    // 記事データを準備
    const articleData: Prisma.ArticleCreateInput = {
      title,
      slug,
      summary: requestBody.summary || '',
      description: requestBody.description || '',
      content,
      category,
      published: requestBody.published || false,
    };
    
    console.log('作成する記事データ:', articleData);
    
    // 記事作成とエラーハンドリング
    let article: Article;
    try {
      // 記事を作成
      article = await prisma.article.create({
        data: articleData,
      });
    } catch (createError) {
      console.error('記事作成エラー:', createError);
      // 接続をリセットして再試行
      await resetPrismaConnection();
      article = await prisma.article.create({
        data: articleData,
      });
    }
    
    console.log('記事作成成功:', article.id);
    
    // 画像の処理（もしあれば）
    if (requestBody.images && requestBody.images.length > 0) {
      console.log('画像処理開始:', requestBody.images.length, '個の画像');
      
      for (const image of requestBody.images) {
        try {
          await prisma.image.create({
            data: {
              articleId: article.id,
              url: image.url,
              altText: image.altText || title,
              isFeatured: image.isFeatured || false,
            },
          });
        } catch (imageError) {
          console.error('画像保存エラー:', imageError);
          // 画像保存エラーは無視して続行
          
          // 必要に応じて接続をリセット
          await resetPrismaConnection();
          
          try {
            await prisma.image.create({
              data: {
                articleId: article.id,
                url: image.url,
                altText: image.altText || title,
                isFeatured: image.isFeatured || false,
              },
            });
          } catch (retryError) {
            console.error('画像再保存エラー:', retryError);
            // 次の画像へ続行
          }
        }
      }
      
      console.log('画像処理完了');
    }
    
    // 作成した記事を返す（画像付き）
    let completeArticle: ArticleWithImages | Article = article;
    try {
      const fetchedArticle = await prisma.article.findUnique({
        where: { id: article.id },
        include: { images: true },
      });
      
      if (fetchedArticle) {
        completeArticle = fetchedArticle;
      }
    } catch (findError) {
      console.error('作成記事取得エラー:', findError);
      // エラー発生時は基本情報のみ返す（すでに article に代入済み）
    }
    
    return NextResponse.json(
      {
        message: '記事を作成しました',
        article: completeArticle,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('記事作成API エラー:', error);
    return NextResponse.json(
      {
        error: '記事の作成に失敗しました',
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined
      },
      { status: 500 }
    );
  } finally {
    // 処理完了後に明示的に切断
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('切断エラー:', disconnectError);
    }
  }
}