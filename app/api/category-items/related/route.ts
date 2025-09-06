import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Prismaクライアントのパス

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // 同じカテゴリの他の記事を取得（現在の記事を除外）
    const whereClause: {
      category: string;
      published: boolean;
      id?: { not: string };
    } = {
      category: category,
      published: true
    };
    
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }
    
    const relatedItems = await prisma.categoryItem.findMany({
      where: whereClause,
      include: {
        images: {
          where: {
            isFeatured: true
          },
          take: 1
        }
      },
      take: limit,
      orderBy: { 
        createdAt: 'desc' 
      }
    });

    return NextResponse.json({ items: relatedItems });
  } catch (error) {
    console.error('Error fetching related items:', error);
    return NextResponse.json({ error: 'Failed to fetch related items' }, { status: 500 });
  }
}