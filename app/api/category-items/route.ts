import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  try {
    const whereClause: {
      category?: string;
      title?: { contains: string; mode: 'insensitive' };
    } = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    const items = await prisma.categoryItem.findMany({
      where: whereClause,
      include: { 
        images: true,
        trivia: {
          orderBy: { displayOrder: 'asc' }
        }
      } as any,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: 'カテゴリ項目の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      seoDescription,
      category, 
      imageUrl, 
      imageAltText,
      published = false,
      content
    } = body;
    
    // カテゴリ項目作成
    const categoryItem = await prisma.categoryItem.create({
      data: {
        title,
        slug,
        summary: seoDescription, // SEO用の短い説明文
        description,  // 詳細説明
        content: content || description || '', // contentは必須なので代入
        category,
        published
      }
    });

    // 画像がある場合は追加
    if (imageUrl) {
      await prisma.categoryItemImage.create({
        data: {
          categoryItemId: categoryItem.id,
          url: imageUrl,
          altText: imageAltText,
          isFeatured: true
        }
      });
    }
    
    // 作成した項目を画像付きで取得
    const itemWithImages = await prisma.categoryItem.findUnique({
      where: { id: categoryItem.id },
      include: { 
        images: true,
        trivia: {
          orderBy: { displayOrder: 'asc' }
        }
      } as any
    });
    
    return NextResponse.json(itemWithImages);
  } catch (error) {
    console.error('カテゴリ項目作成エラー:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'カテゴリ項目の作成に失敗しました' 
      },
      { status: 500 }
    );
  }
}