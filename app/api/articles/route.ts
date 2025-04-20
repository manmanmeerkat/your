// app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('記事一覧API: リクエスト受信');
    
    // URLからクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    console.log('検索パラメータ:', Object.fromEntries(searchParams.entries()));
    
    const publishedParam = searchParams.get('published');
    const categoryParam = searchParams.get('category');
    const searchQuery = searchParams.get('search'); // キーワード検索パラメータの追加
    
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
    const where: any = {};
    
    // published パラメータが指定されている場合のみフィルタリング
    if (publishedParam !== null) {
      where.published = publishedParam === 'true';
    }
    
    // カテゴリが指定されている場合
    if (categoryParam) {
      where.category = categoryParam;
    }
    
    // キーワード検索が指定されている場合
    if (searchQuery && searchQuery.trim() !== '') {
      where.title = {
        contains: searchQuery.trim(),
        mode: 'insensitive' // 大文字小文字を区別しない
      };
    }
    
    console.log('検索条件:', where);
    console.log('ページネーション:', { page, pageSize, skip });
    
    // 記事の総数を取得（ページネーション用）
    const totalCount = await prisma.article.count({ where });
    
    // 記事をデータベースから取得
    const articles = await prisma.article.findMany({
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
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
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
            .filter(([_, v]) => !v)
            .map(([k]) => k)
        },
        { status: 400 }
      );
    }
    
    // スラッグの重複チェック
    const existingArticle = await prisma.article.findUnique({
      where: { slug },
    });
    
    if (existingArticle) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }
    
    // 記事データを準備
    const articleData = {
      title,
      slug,
      summary: requestBody.summary || '',
      content,
      category,
      published: requestBody.published || false,
    };
    
    console.log('作成する記事データ:', articleData);
    
    // 記事を作成
    const article = await prisma.article.create({
      data: articleData,
    });
    
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
        }
      }
      
      console.log('画像処理完了');
    }
    
    // 作成した記事を返す（画像付き）
    const completeArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: { images: true },
    });
    
    return NextResponse.json(
      {
        message: '記事を作成しました',
        article: completeArticle,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('記事作成API エラー:', error);
    return NextResponse.json(
      {
        error: '記事の作成に失敗しました',
        message: error.message,
        name: error.name,
        code: error.code
      },
      { status: 500 }
    );
  } finally {
    // await prisma.$disconnect();
  }
}