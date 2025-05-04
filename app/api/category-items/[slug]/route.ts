import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const categoryItem = await prisma.categoryItem.findUnique({
      where: { slug: params.slug },
      include: { images: true }
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
      imageAltText 
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
      },
      include: { images: true }
    });

    // 画像の処理 (明示的なnullでない限り、画像情報を保持)
    // imageUrlがnull（明示的に画像を削除する場合）の場合は既存の画像を削除
    if (imageUrl === null) {
      // 画像を削除
      await prisma.categoryItemImage.deleteMany({
        where: { categoryItemId: categoryItem.id }
      });
      console.log('画像を削除しました');
    } 
    // imageUrlが存在する場合は画像を更新
    else if (imageUrl) {
      // 既存の画像を削除
      await prisma.categoryItemImage.deleteMany({
        where: { categoryItemId: categoryItem.id }
      });

      // 新しい画像を作成
      await prisma.categoryItemImage.create({
        data: {
          categoryItemId: categoryItem.id,
          url: imageUrl,
          altText: imageAltText || '',
          isFeatured: true
        }
      });
      console.log('画像を更新しました:', imageUrl);
    } 
    // imageUrlがundefinedの場合は画像を変更しない
    else {
      console.log('画像の変更はありません');
    }

    // 更新後のデータを取得
    const updatedItem = await prisma.categoryItem.findUnique({
      where: { id: categoryItem.id },
      include: { images: true }
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