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
    // 開発環境では接続を明示的に切断
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
      imageUrl, 
      imageAltText,
      updateImages,
      images
    } = body;

    console.log('リクエストボディ:', body);

    // カテゴリ項目を更新
    const categoryItem = await prisma.categoryItem.update({
      where: { slug: params.slug },
      data: {
        title,
        slug,
        description: description,
        content: content || '',
        category,
        published,
      } as any,
      include: { 
        images: true,
        trivia: {
          orderBy: { displayOrder: 'asc' }
        }
      } as any
    });

    // 画像の処理（新しい画像管理システム対応）
    if (updateImages && images && Array.isArray(images)) {
      // 既存の画像を削除
      await prisma.categoryItemImage.deleteMany({
        where: { categoryItemId: categoryItem.id }
      } as any);

      // 新しい画像を作成
      for (const imageData of images) {
        await prisma.categoryItemImage.create({
          data: {
            categoryItemId: categoryItem.id,
            url: imageData.url,
            altText: imageData.altText || '',
            isFeatured: imageData.isFeatured || false
          }
        });
      }
      console.log('画像管理システムで画像を更新しました:', images);
    }
    // 従来の画像処理（後方互換性のため）
    else if (imageUrl === null) {
      // 画像を削除
      await prisma.categoryItemImage.deleteMany({
        where: { categoryItemId: categoryItem.id }
      } as any);
      console.log('画像を削除しました');
    } 
    else if (imageUrl) {
      // 既存の画像を削除
      await prisma.categoryItemImage.deleteMany({
        where: { categoryItemId: categoryItem.id }
      } as any);

      // 新しい画像を作成
      await prisma.categoryItemImage.create({
        data: {
          categoryItemId: categoryItem.id,
          url: imageUrl,
          altText: imageAltText || '',
          isFeatured: true
        }
      } as any);
      console.log('画像を更新しました:', imageUrl);
    } 
    else {
      console.log('画像の変更はありません');
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

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('カテゴリ項目更新エラー:', error);
    return NextResponse.json(
      { error: 'カテゴリ項目の更新に失敗しました' },
      { status: 500 }
    );
  } finally {
    // 開発環境では接続を明示的に切断
    if (process.env.NODE_ENV === 'development') {
      await prisma.$disconnect();
    }
  }
}