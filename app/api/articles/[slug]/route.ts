// app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../route'; // 共通のPrismaインスタンスを再利用
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('記事詳細API: スラッグ =', params.slug);
    
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: { images: true },
    });
    
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('記事取得エラー:', error);
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
    console.log('記事更新API: スラッグ =', params.slug);
    
    // 記事の存在確認
    const existingArticle = await prisma.article.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Supabaseクライアント初期化
    const supabase = createServerComponentClient({ cookies });
    
    // セッションチェック（認証確認）
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('認証エラー: セッションなし');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // リクエストボディを取得
    const { title, slug, summary, content, category, published, images } = await req.json();
    console.log('受信データ（抜粋）:', { title, slug, category, published });
    
    // 新しいスラッグが別の記事と重複していないか確認
    if (slug !== params.slug) {
      const duplicateSlug = await prisma.article.findFirst({
        where: {
          slug,
          id: { not: existingArticle.id },
        },
      });
      
      if (duplicateSlug) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }
    
    // 記事を更新
    const article = await prisma.article.update({
      where: { id: existingArticle.id },
      data: {
        title,
        slug,
        summary: summary || '',
        content,
        category,
        published,
        updatedAt: new Date(),
      },
    });
    
    console.log('記事更新成功:', article.id);
    
    // 画像の処理
    if (images && Array.isArray(images)) {
      console.log('画像処理開始:', images.length, '個の画像');
      
      // 既存の画像をすべて削除
      await prisma.image.deleteMany({
        where: { articleId: article.id },
      });
      
      // 新しい画像を追加
      for (const image of images) {
        try {
          if (image.url) {
            await prisma.image.create({
              data: {
                articleId: article.id,
                url: image.url,
                altText: image.altText || title,
                isFeatured: image.isFeatured || false,
              },
            });
          }
        } catch (imageError) {
          console.error('画像処理エラー:', imageError);
          // 画像処理エラーは無視して続行
        }
      }
      
      console.log('画像処理完了');
    }
    
    // 更新した記事を返す（画像付き）
    const updatedArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: { images: true },
    });
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('記事更新エラー:', error);
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
    console.log('記事削除API: スラッグ =', params.slug);
    
    // 記事の存在確認
    const existingArticle = await prisma.article.findUnique({
      where: { slug: params.slug },
    });
    
    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Supabaseクライアント初期化
    const supabase = createServerComponentClient({ cookies });
    
    // セッションチェック（認証確認）
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 関連する画像を先に削除
    await prisma.image.deleteMany({
      where: { articleId: existingArticle.id },
    });
    
    // 記事を削除
    await prisma.article.delete({
      where: { id: existingArticle.id },
    });
    
    console.log('記事削除成功');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('記事削除エラー:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}