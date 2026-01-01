// app/api/category-items/[slug]/route.ts - 完全修正版
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const categoryItem = await prisma.categoryItem.findUnique({
      where: { slug: params.slug },
      include: { 
        images: true,
        trivia: {
          orderBy: { displayOrder: 'asc' }
        }
      } as any
    });

    if (!categoryItem) {
      return NextResponse.json(
        { error: 'カテゴリ項目が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(categoryItem);
  } catch (error) {
    console.error('カテゴリ項目取得エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリ項目の取得に失敗しました' },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      content,
      category, 
      published,
      updateImages,
      images
    } = body;

    console.log('📥 カテゴリ項目更新リクエスト:', {
      slug: params.slug,
      newSlug: slug,
      hasImages: !!images,
      updateImages,
      imagesArray: images,
    });

    // カテゴリ項目の基本情報を更新
    const categoryItem = await prisma.categoryItem.update({
      where: { slug: params.slug },
      data: {
        title,
        slug,
        description: description || '',
        content: content || '',
        category,
        published,
      } as any,
    });

    console.log('✅ カテゴリ項目基本情報更新完了:', categoryItem.id);

    // フィーチャー画像の処理
    if (updateImages === true && images && Array.isArray(images) && images.length > 0) {
      console.log('🖼️ フィーチャー画像更新処理開始');

      // フィーチャー画像のみを処理
      const featuredImage = images[0]; // 最初の画像をフィーチャー画像として扱う

      if (featuredImage) {
        // 既存のフィーチャー画像を削除
        await prisma.categoryItemImage.deleteMany({
          where: { 
            categoryItemId: categoryItem.id,
            isFeatured: true,
          }
        } as any);

        console.log('🗑️ 既存フィーチャー画像を削除');

        // 新しい画像か既存画像かを判定
        if (featuredImage.id) {
          // 既存画像を更新（代替テキストのみ変更）
          try {
            await prisma.categoryItemImage.update({
              where: { id: featuredImage.id },
              data: {
                altText: featuredImage.altText || '',
                isFeatured: true,
              }
            } as any);
            console.log('🔄 既存フィーチャー画像を更新:', featuredImage.id);
          } catch (updateError) {
            // 画像が見つからない場合は新規作成
            console.log('⚠️ 既存画像が見つからないため新規作成');
            await prisma.categoryItemImage.create({
              data: {
                categoryItemId: categoryItem.id,
                url: featuredImage.url,
                altText: featuredImage.altText || '',
                isFeatured: true,
              }
            } as any);
          }
        } else if (featuredImage.url) {
          // 新規画像を作成
          await prisma.categoryItemImage.create({
            data: {
              categoryItemId: categoryItem.id,
              url: featuredImage.url,
              altText: featuredImage.altText || '',
              isFeatured: true,
            }
          } as any);
          console.log('➕ 新規フィーチャー画像を作成');
        }
      }
    } else {
      console.log('📷 フィーチャー画像の変更なし (updateImages:', updateImages, ')');
    }

    // 更新後のデータを取得
    const updatedItem = await prisma.categoryItem.findUnique({
      where: { id: categoryItem.id },
      include: { 
        images: true,
        trivia: {
          orderBy: { displayOrder: 'asc' }
        }
      } as any
    });

    console.log('✅ カテゴリ項目更新完了:', {
      id: updatedItem?.id,
      imagesCount: updatedItem?.images?.length || 0,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('💥 カテゴリ項目更新エラー:', error);
    return NextResponse.json(
      { 
        error: 'カテゴリ項目の更新に失敗しました', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}