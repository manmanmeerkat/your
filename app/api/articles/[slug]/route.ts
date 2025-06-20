// app/api/articles/[slug]/route.ts - UUID対応 & エラー修正版
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';

// Prismaの型定義
type PrismaArticle = {
  id: string;
  title: string | null;
  slug: string | null;
  summary: string | null;
  content: string | null;
  category: string | null;
  published: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  images?: PrismaImage[];
  trivia?: PrismaTrivia[];
};

type PrismaImage = {
  id: string;
  url: string;
  altText: string | null;
  isFeatured: boolean;
  createdAt: Date;
  articleId: string;
};

type PrismaTrivia = {
  id: string;
  title: string;
  content: string;
  contentEn: string | null;
  category: string;
  tags: string[];
  iconEmoji: string | null;
  colorTheme: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  articleId: string;
};

// 安全なデータフォーマット関数
const formatArticleData = (article: PrismaArticle) => {
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return new Date().toISOString();
    try {
      return new Date(date).toISOString();
    } catch (error) {
      console.warn('日付変換エラー:', error);
      return new Date().toISOString();
    }
  };

  return {
    id: article.id || '',
    title: article.title || '',
    slug: article.slug || '',
    summary: article.summary || null,
    content: article.content || '',
    category: article.category || '',
    published: Boolean(article.published),
    description: article.description || null,
    createdAt: formatDate(article.createdAt),
    updatedAt: formatDate(article.updatedAt),
    images: (article.images || []).map((img: PrismaImage) => ({
      id: img.id || '',
      url: img.url || '',
      altText: img.altText || null,
      isFeatured: Boolean(img.isFeatured),
      createdAt: formatDate(img.createdAt),
      articleId: img.articleId || '',
    })),
    trivia: (article.trivia || []).map((t: PrismaTrivia) => ({
      id: t.id || '',
      title: t.title || '',
      content: t.content || '',
      contentEn: t.contentEn || null,
      category: t.category || '',
      tags: Array.isArray(t.tags) ? t.tags : [],
      iconEmoji: t.iconEmoji || null,
      colorTheme: t.colorTheme || null,
      displayOrder: Number(t.displayOrder) || 0,
      isActive: Boolean(t.isActive),
      createdAt: formatDate(t.createdAt),
      updatedAt: formatDate(t.updatedAt),
      articleId: t.articleId || '',
    })),
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rawSlug = params.slug;
    const decodedSlug = decodeURIComponent(params.slug);
    
    console.log('記事詳細API: 処理開始');
    console.log('- 元のスラッグ:', rawSlug);
    console.log('- デコードされたスラッグ:', decodedSlug);
    
    // 🔧 include設定（安全性向上）
    const includeConfig = {
      images: {
        select: {
          id: true,
          url: true,
          altText: true,
          isFeatured: true,
          createdAt: true,
          articleId: true,
        },
      },
      trivia: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' } as const,
        select: {
          id: true,
          title: true,
          content: true,
          contentEn: true,
          category: true,
          tags: true,
          iconEmoji: true,
          colorTheme: true,
          displayOrder: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          articleId: true,
        },
      },
    };
    
    let article = null;
    
    // 1. 完全一致検索
    try {
      article = await prisma.article.findUnique({
        where: { slug: decodedSlug },
        include: includeConfig,
      });
      
      if (article) {
        console.log('完全一致で記事が見つかりました:', article.slug);
        return NextResponse.json(formatArticleData(article));
      }
    } catch (error) {
      console.log('完全一致検索でエラー:', error);
    }
    
    // 2. 大文字小文字を無視した検索
    try {
      const articlesIgnoreCase = await prisma.article.findMany({
        where: {
          slug: {
            equals: decodedSlug,
            mode: 'insensitive',
          },
        },
        include: includeConfig,
        take: 1,
      });
      
      if (articlesIgnoreCase.length > 0) {
        article = articlesIgnoreCase[0];
        console.log('大文字小文字を無視して記事が見つかりました:', article.slug);
        return NextResponse.json(formatArticleData(article));
      }
    } catch (error) {
      console.log('大文字小文字無視検索でエラー:', error);
    }
    
    // 3. ハイフン・スペース変換検索
    try {
      const hyphenSlug = decodedSlug.replace(/\s+/g, '-');
      const spaceSlug = decodedSlug.replace(/-+/g, ' ');
      
      console.log('- ハイフン化したスラッグ:', hyphenSlug);
      console.log('- スペース化したスラッグ:', spaceSlug);
      
      const possibleSlugs = [decodedSlug, hyphenSlug, spaceSlug];
      
      for (const possibleSlug of possibleSlugs) {
        const foundArticle = await prisma.article.findFirst({
          where: { 
            OR: [
              { slug: possibleSlug },
              { slug: possibleSlug.toLowerCase() },
              { slug: { contains: possibleSlug, mode: 'insensitive' } }
            ]
          },
          include: includeConfig,
        });
        
        if (foundArticle) {
          console.log('変換されたスラッグで記事が見つかりました:', foundArticle.slug);
          return NextResponse.json(formatArticleData(foundArticle));
        }
      }
    } catch (error) {
      console.log('変換検索でエラー:', error);
    }
    
    // 4. タイトル検索（最後の手段）
    try {
      const foundByTitle = await prisma.article.findFirst({
        where: {
          title: {
            contains: decodedSlug.replace(/-/g, ' '),
            mode: 'insensitive',
          },
        },
        include: includeConfig,
      });
      
      if (foundByTitle) {
        console.log('タイトルで記事が見つかりました:', foundByTitle.slug);
        return NextResponse.json(formatArticleData(foundByTitle));
      }
    } catch (error) {
      console.log('タイトル検索でエラー:', error);
    }
    
    // 記事が見つからない場合
    console.log('記事が見つかりませんでした');
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  } catch (error) {
    console.error('記事取得API エラー:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      slug: params.slug
    });
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rawSlug = params.slug;
    const decodedSlug = decodeURIComponent(params.slug);
    
    console.log('記事更新API: 処理開始');
    console.log('- 元のスラッグ:', rawSlug);
    console.log('- デコードされたスラッグ:', decodedSlug);
    
    // 記事を検索
    let existingArticle = null;
    
    try {
      existingArticle = await prisma.article.findUnique({
        where: { slug: decodedSlug },
      });
    } catch (error) {
      console.log('記事検索エラー:', error);
    }
    
    if (!existingArticle) {
      // 大文字小文字を無視した検索
      try {
        const articlesIgnoreCase = await prisma.article.findMany({
          where: {
            slug: {
              equals: decodedSlug,
              mode: 'insensitive',
            },
          },
          take: 1,
        });
        
        if (articlesIgnoreCase.length > 0) {
          existingArticle = articlesIgnoreCase[0];
        }
      } catch (error) {
        console.log('大文字小文字無視検索エラー:', error);
      }
    }
    
    if (!existingArticle) {
      console.log('更新対象の記事が見つかりませんでした');
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // 認証チェック
    try {
      const supabase = createServerComponentClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('認証エラー: セッションなし');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.log('認証チェックエラー:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // リクエストボディを取得
    const { title, slug, summary, description, content, category, published, images } = await req.json();
    console.log('受信データ（抜粋）:', { title, slug, category, published });
    
    // 新しいスラッグの重複チェック
    if (slug !== existingArticle.slug) {
      try {
        const duplicateSlug = await prisma.article.findFirst({
          where: {
            slug,
            id: { not: existingArticle.id },
          },
        });
        
        if (duplicateSlug) {
          return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
      } catch (error) {
        console.log('スラッグ重複チェックエラー:', error);
      }
    }
    
    // 記事を更新
    const updatedArticle = await prisma.article.update({
      where: { id: existingArticle.id },
      data: {
        title,
        slug,
        summary: summary || null,
        description: description || null,
        content,
        category,
        published,
        updatedAt: new Date(),
      },
      include: {
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
            isFeatured: true,
            createdAt: true,
            articleId: true,
          },
        },
        trivia: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            title: true,
            content: true,
            contentEn: true,
            category: true,
            tags: true,
            iconEmoji: true,
            colorTheme: true,
            displayOrder: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            articleId: true,
          },
        },
      },
    });
    
    console.log('記事更新成功:', updatedArticle.id);
    
    // 画像の処理
    if (images && Array.isArray(images)) {
      console.log('画像処理開始:', images.length, '個の画像');
      
      try {
        // 既存の画像をすべて削除
        await prisma.image.deleteMany({
          where: { articleId: updatedArticle.id },
        });
        
        // 新しい画像を追加
        for (const image of images) {
          if (image.url) {
            await prisma.image.create({
              data: {
                articleId: updatedArticle.id,
                url: image.url,
                altText: image.altText || title,
                isFeatured: image.isFeatured || false,
              },
            });
          }
        }
        
        console.log('画像処理完了');
      } catch (imageError) {
        console.error('画像処理エラー:', imageError);
        // 画像処理エラーは無視して続行
      }
    }
    
    return NextResponse.json(formatArticleData(updatedArticle));
  } catch (error) {
    console.error('記事更新API エラー:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rawSlug = params.slug;
    const decodedSlug = decodeURIComponent(params.slug);
    
    console.log('記事削除API: 処理開始');
    console.log('- 元のスラッグ:', rawSlug);
    console.log('- デコードされたスラッグ:', decodedSlug);
    
    // 記事を検索
    let existingArticle = null;
    
    try {
      existingArticle = await prisma.article.findUnique({
        where: { slug: decodedSlug },
      });
    } catch (error) {
      console.log('記事検索エラー:', error);
    }
    
    if (!existingArticle) {
      console.log('削除対象の記事が見つかりませんでした');
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // 認証チェック
    try {
      const supabase = createServerComponentClient({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.log('認証チェックエラー:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // トランザクションで削除（関連データも含む）
    await prisma.$transaction(async (tx) => {
      // 関連する画像を削除
      await tx.image.deleteMany({
        where: { articleId: existingArticle.id },
      });
      
      // 関連する一口メモを削除
      await tx.articleTrivia.deleteMany({
        where: { articleId: existingArticle.id },
      });
      
      // 記事を削除
      await tx.article.delete({
        where: { id: existingArticle.id },
      });
    });
    
    console.log('記事削除成功（画像・一口メモも含む）');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('記事削除API エラー:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}