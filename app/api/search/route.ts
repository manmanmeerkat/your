import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // 'article', 'categoryitem', 'all'

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchQuery = query.trim();
    const results = [];

    // 記事を検索
    if (type === 'article' || type === 'all') {
      const articles = await prisma.article.findMany({
        where: {
          OR: [
            {
              content: {
                contains: searchQuery,
                mode: 'insensitive' // 大文字小文字を区別しない
              }
            },
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              summary: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          summary: true,
          published: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      results.push(...articles.map(article => ({
        ...article,
        type: 'article'
      })));
    }

    // カテゴリーアイテムを検索
    if (type === 'categoryitem' || type === 'all') {
      const categoryItems = await prisma.categoryItem.findMany({
        where: {
          OR: [
            {
              content: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              summary: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          summary: true,
          published: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      results.push(...categoryItems.map(item => ({
        ...item,
        type: 'categoryitem'
      })));
    }

    // 結果を作成日時でソート
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      query: searchQuery,
      total: results.length,
      results
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// コンテンツ内の検索結果をハイライト表示用のプレビューを生成
export async function POST(request: NextRequest) {
  try {
    const { query, articleId, type = 'article' } = await request.json();

    if (!query || !articleId) {
      return NextResponse.json({ error: 'Query and articleId are required' }, { status: 400 });
    }

    let content = '';
    
    if (type === 'article') {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { content: true }
      });
      content = article?.content || '';
    } else if (type === 'categoryitem') {
      const categoryItem = await prisma.categoryItem.findUnique({
        where: { id: articleId },
        select: { content: true }
      });
      content = categoryItem?.content || '';
    }

    // 検索クエリが含まれる部分を抽出（前後50文字）
    const searchRegex = new RegExp(query, 'gi');
    const matches = [];
    let match;

    while ((match = searchRegex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50);
      const end = Math.min(content.length, match.index + query.length + 50);
      const snippet = content.substring(start, end);
      
      matches.push({
        snippet: snippet,
        position: match.index,
        highlighted: snippet.replace(
          new RegExp(query, 'gi'),
          `<mark>$&</mark>`
        )
      });

      // 同じ位置で無限ループを防ぐ
      if (match.index === searchRegex.lastIndex) {
        searchRegex.lastIndex++;
      }
    }

    return NextResponse.json({
      matches: matches.slice(0, 3) // 最大3つのマッチまで
    });

  } catch (error) {
    console.error('Content search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}