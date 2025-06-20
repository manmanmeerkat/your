// app/api/articles/[slug]/route.ts - 一口メモ対応修正版
import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // デバッグ用にすべてのスラッグ形式を出力
    const rawSlug = params.slug;
    const decodedSlug = decodeURIComponent(params.slug);
    
    console.log('記事詳細API: 処理開始');
    console.log('- 元のスラッグ:', rawSlug);
    console.log('- デコードされたスラッグ:', decodedSlug);
    
    // すべての記事を取得（デバッグ用）
    const allArticles = await prisma.article.findMany({
      select: { id: true, slug: true, title: true }
    });
    
    console.log('データベース内の全記事:', allArticles.map(a => ({ id: a.id, slug: a.slug, title: a.title })));
    
    // 🔧 一口メモを含むinclude設定
    const includeConfig = {
      images: true,
      // 🆕 一口メモも含める
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
    
    // 1. 完全一致
    let article = await prisma.article.findUnique({
      where: { slug: decodedSlug },
      include: includeConfig,
    });
    
    if (article) {
      console.log('完全一致で記事が見つかりました:', article.slug);
      console.log('一口メモ数:', article.trivia?.length || 0);
      return NextResponse.json(article);
    }
    
    // 2. 大文字小文字を無視した一致
    const articlesIgnoreCase = await prisma.article.findMany({
      where: {
        slug: {
          equals: decodedSlug,
          mode: 'insensitive',
        },
      },
      include: includeConfig,
    });
    
    if (articlesIgnoreCase.length > 0) {
      article = articlesIgnoreCase[0];
      console.log('大文字小文字を無視して記事が見つかりました:', article.slug);
      console.log('一口メモ数:', article.trivia?.length || 0);
      return NextResponse.json(article);
    }
    
    // 3. スラッグ内のハイフンとスペースを置き換えた一致
    const hyphenSlug = decodedSlug.replace(/\s+/g, '-');
    const spaceSlug = decodedSlug.replace(/-+/g, ' ');
    
    console.log('- ハイフン化したスラッグ:', hyphenSlug);
    console.log('- スペース化したスラッグ:', spaceSlug);
    
    const possibleSlugs = [decodedSlug, hyphenSlug, spaceSlug];
    
    for (const possibleSlug of possibleSlugs) {
      article = await prisma.article.findFirst({
        where: { 
          OR: [
            { slug: possibleSlug },
            { slug: possibleSlug.toLowerCase() },
            { slug: { contains: possibleSlug, mode: 'insensitive' } }
          ]
        },
        include: includeConfig,
      });
      
      if (article) {
        console.log('変換されたスラッグで記事が見つかりました:', article.slug);
        console.log('一口メモ数:', article.trivia?.length || 0);
        return NextResponse.json(article);
      }
    }
    
    // 4. タイトルで検索
    article = await prisma.article.findFirst({
      where: {
        title: {
          contains: decodedSlug.replace(/-/g, ' '),
          mode: 'insensitive',
        },
      },
      include: includeConfig,
    });
    
    if (article) {
      console.log('タイトルで記事が見つかりました:', article.slug);
      console.log('一口メモ数:', article.trivia?.length || 0);
      return NextResponse.json(article);
    }
    
    // 記事が見つからない場合
    console.log('記事が見つかりませんでした');
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
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
    // デバッグ用にすべてのスラッグ形式を出力
    const rawSlug = params.slug;
    const decodedSlug = decodeURIComponent(params.slug);
    
    console.log('記事更新API: 処理開始');
    console.log('- 元のスラッグ:', rawSlug);
    console.log('- デコードされたスラッグ:', decodedSlug);
    
    // 記事を様々な方法で検索
    let existingArticle = null;
    
    // 1. 完全一致
    existingArticle = await prisma.article.findUnique({
      where: { slug: decodedSlug },
    });
    
    if (existingArticle) {
      console.log('完全一致で記事が見つかりました:', existingArticle.slug);
    } else {
      // 2. 大文字小文字を無視した一致
      const articlesIgnoreCase = await prisma.article.findMany({
        where: {
          slug: {
            equals: decodedSlug,
            mode: 'insensitive',
          },
        },
      });
      
      if (articlesIgnoreCase.length > 0) {
        existingArticle = articlesIgnoreCase[0];
        console.log('大文字小文字を無視して記事が見つかりました:', existingArticle.slug);
      } else {
        // 3. スラッグ内のハイフンとスペースを置き換えた一致
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
          });
          
          if (foundArticle) {
            existingArticle = foundArticle;
            console.log('変換されたスラッグで記事が見つかりました:', existingArticle.slug);
            break;
          }
        }
        
        // 4. タイトルで検索
        if (!existingArticle) {
          const foundArticle = await prisma.article.findFirst({
            where: {
              title: {
                contains: decodedSlug.replace(/-/g, ' '),
                mode: 'insensitive',
              },
            },
          });
          
          if (foundArticle) {
            existingArticle = foundArticle;
            console.log('タイトルで記事が見つかりました:', existingArticle.slug);
          }
        }
      }
    }
    
    if (!existingArticle) {
      console.log('記事が見つかりませんでした');
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
    const { title, slug, summary, description, content, category, published, images } = await req.json();
    console.log('受信データ（抜粋）:', { title, slug, category, published });
    
    // 新しいスラッグが別の記事と重複していないか確認
    if (slug !== existingArticle.slug) {
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
        description: description || '',
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
    
    // 🔧 更新した記事を返す（一口メモ付き）
    const updatedArticle = await prisma.article.findUnique({
      where: { id: article.id },
      include: {
        images: true,
        // 🆕 一口メモも含める
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
    // デバッグ用にすべてのスラッグ形式を出力
    const rawSlug = params.slug;
    const decodedSlug = decodeURIComponent(params.slug);
    
    console.log('記事削除API: 処理開始');
    console.log('- 元のスラッグ:', rawSlug);
    console.log('- デコードされたスラッグ:', decodedSlug);
    
    // 記事を様々な方法で検索
    let existingArticle = null;
    
    // 1. 完全一致
    existingArticle = await prisma.article.findUnique({
      where: { slug: decodedSlug },
    });
    
    if (existingArticle) {
      console.log('完全一致で記事が見つかりました:', existingArticle.slug);
    } else {
      // 2. 大文字小文字を無視した一致
      const articlesIgnoreCase = await prisma.article.findMany({
        where: {
          slug: {
            equals: decodedSlug,
            mode: 'insensitive',
          },
        },
      });
      
      if (articlesIgnoreCase.length > 0) {
        existingArticle = articlesIgnoreCase[0];
        console.log('大文字小文字を無視して記事が見つかりました:', existingArticle.slug);
      } else {
        // 3. スラッグ内のハイフンとスペースを置き換えた一致
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
          });
          
          if (foundArticle) {
            existingArticle = foundArticle;
            console.log('変換されたスラッグで記事が見つかりました:', existingArticle.slug);
            break;
          }
        }
        
        // 4. タイトルで検索
        if (!existingArticle) {
          const foundArticle = await prisma.article.findFirst({
            where: {
              title: {
                contains: decodedSlug.replace(/-/g, ' '),
                mode: 'insensitive',
              },
            },
          });
          
          if (foundArticle) {
            existingArticle = foundArticle;
            console.log('タイトルで記事が見つかりました:', existingArticle.slug);
          }
        }
      }
    }
    
    if (!existingArticle) {
      console.log('記事が見つかりませんでした');
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
    
    // 🔧 一口メモも削除するように修正
    await prisma.$transaction(async (tx) => {
      // 関連する画像を削除
      await tx.image.deleteMany({
        where: { articleId: existingArticle.id },
      });
      
      // 🆕 関連する一口メモを削除
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
    console.error('記事削除エラー:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}