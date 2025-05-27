import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

interface BulkReplaceResult {
  articleId: string;
  title: string;
  slug: string;
  originalContent: string;
  newContent: string;
  changeCount: number;
}

interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  category?: string;
  publishedOnly?: boolean;
  includeContent?: boolean;
}

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
    const { 
      action, 
      query, 
      articleId, 
      type = 'article',
      // 一括置換用の新しいパラメータ
      replaceTerm,
      options = {}
    } = await request.json();

    // 既存の機能：マッチ表示
    if (action === 'highlight' || !action) {
      return await handleHighlight(query, articleId, type);
    }
    
    // 新機能：一括検索
    if (action === 'bulk-search') {
      return await handleBulkSearch(query, options);
    }
    
    // 新機能：一括置換プレビュー
    if (action === 'bulk-preview') {
      return await handleBulkPreview(query, replaceTerm, options);
    }
    
    // 新機能：一括置換実行
    if (action === 'bulk-replace') {
      return await handleBulkReplace(query, replaceTerm, options);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

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

// 既存のハイライト機能
async function handleHighlight(query: string, articleId: string, type: string) {
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
}

// 新機能：一括検索
async function handleBulkSearch(
  searchTerm: string, 
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    category?: string;
    publishedOnly?: boolean;
    includeContent?: boolean;
  }
) {
  const searchData = await getBulkSearchData(searchTerm, options);
  return NextResponse.json(searchData);
}

// 新機能：一括置換プレビュー
async function handleBulkPreview(
  searchTerm: string,
  replaceTerm: string,
  options: SearchOptions
) {
  const previewData = await getBulkPreviewData(searchTerm, replaceTerm, options);
  return NextResponse.json(previewData);
}

// 新機能：一括置換実行
async function handleBulkReplace(
  searchTerm: string,
  replaceTerm: string,
  options: SearchOptions
) {
  const previewData = await getBulkPreviewData(searchTerm, replaceTerm, options);
  const changes: BulkReplaceResult[] = [];

  // トランザクションで一括更新
  await prisma.$transaction(async (tx) => {
    for (const result of previewData.results) {
      if (result.newContent && result.originalContent !== result.newContent) {
        // 更新実行
        await tx.article.update({
          where: { id: result.id },
          data: { 
            content: result.newContent,
            updatedAt: new Date()
          }
        });

        changes.push({
          articleId: result.id,
          title: result.title,
          slug: result.slug,
          originalContent: result.originalContent,
          newContent: result.newContent,
          changeCount: 1 // 最初のマッチのみなので常に1
        });
      }
    }

    // 置換履歴をログに記録
    console.log(`Bulk replace completed: ${changes.length} articles updated`);
    console.log(`Search term: "${searchTerm}" -> Replace term: "${replaceTerm}"`);
    console.log('Affected articles:', changes.map(c => ({ id: c.articleId, title: c.title })));
  });

  return NextResponse.json({
    success: true,
    message: `${changes.length} articles updated successfully (first match only)`,
    affectedArticles: changes.length,
    totalChanges: changes.length, // 最初のマッチのみなので記事数と同じ
    changes: changes.map(change => ({
      articleId: change.articleId,
      title: change.title,
      slug: change.slug,
      changeCount: change.changeCount,
      // 確認用の詳細情報を追加
      editUrl: `/admin/articles/${change.slug}`, // 編集リンク
      previewUrl: `/articles/${change.slug}` // プレビューリンク
    })),
    searchTerm,
    replaceTerm,
    timestamp: new Date().toISOString()
  });
}

// ヘルパー関数：マッチ箇所を検索
function findMatches(
  content: string,
  searchTerm: string,
  options: { caseSensitive?: boolean; wholeWord?: boolean }
) {
  const { caseSensitive = false, wholeWord = false } = options;
  const flags = caseSensitive ? 'g' : 'gi';
  
  let searchPattern: RegExp;
  if (wholeWord) {
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    searchPattern = new RegExp(`\\b${escapedTerm}\\b`, flags);
  } else {
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    searchPattern = new RegExp(escapedTerm, flags);
  }

  const matches = [];
  let match;

  while ((match = searchPattern.exec(content)) !== null) {
    const start = Math.max(0, match.index - 30);
    const end = Math.min(content.length, match.index + match[0].length + 30);
    
    matches.push({
      index: match.index,
      before: content.substring(start, match.index),
      match: match[0],
      after: content.substring(match.index + match[0].length, end),
      fullContext: content.substring(start, end)
    });

    // 無限ループ防止
    if (match.index === searchPattern.lastIndex) {
      searchPattern.lastIndex++;
    }
  }

  return matches;
}

// ヘルパー関数：一括検索データを直接取得
async function getBulkSearchData(
  searchTerm: string,
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    category?: string;
    publishedOnly?: boolean;
    includeContent?: boolean;
  }
) {
  const { 
    caseSensitive = false, 
    wholeWord = false, 
    category, 
    publishedOnly = false,
    includeContent = false
  } = options;

  // データベース検索条件を構築
  const whereCondition: {
    content: {
      contains: string;
      mode: 'default' | 'insensitive';
    };
    category?: string;
    published?: boolean;
  } = {
    content: {
      contains: searchTerm,
      mode: caseSensitive ? 'default' : 'insensitive'
    }
  };

  if (category) {
    whereCondition.category = category;
  }

  if (publishedOnly) {
    whereCondition.published = true;
  }

  const articles = await prisma.article.findMany({
    where: whereCondition,
    select: {
      id: true,
      title: true,
      slug: true,
      content: includeContent,
      category: true,
      published: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const results = [];

  for (const article of articles) {
    if (includeContent && article.content) {
      const matches = findMatches(article.content, searchTerm, { caseSensitive, wholeWord });
      
      if (matches.length > 0) {
        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category,
          published: article.published,
          matchCount: matches.length,
          matches: matches.slice(0, 5) // 最大5つのマッチまで表示
        });
      }
    } else {
      results.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        published: article.published,
        matchCount: 0
      });
    }
  }

  return {
    searchTerm,
    options,
    total: results.length,
    totalMatches: results.reduce((sum, result) => sum + (result.matchCount || 0), 0),
    results
  };
}

// ヘルパー関数：一括プレビューデータを直接取得
async function getBulkPreviewData(
  searchTerm: string,
  replaceTerm: string,
  options: SearchOptions
) {
  const searchData = await getBulkSearchData(searchTerm, { ...options, includeContent: true });
  const resultsWithPreview = [];

  for (const result of searchData.results) {
    // 実際のコンテンツを取得
    const article = await prisma.article.findUnique({
      where: { id: result.id },
      select: { content: true }
    });

    if (article?.content) {
      const flags = options.caseSensitive ? '' : 'i';
      let searchPattern: RegExp;

      if (options.wholeWord) {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(`\\b${escapedTerm}\\b`, flags);
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedTerm, flags);
      }

      const match = article.content.match(searchPattern);
      if (match) {
        const newContent = article.content.replace(searchPattern, replaceTerm);
        const changeCount = 1;

        const matchIndex = match.index || 0;
        const beforeContext = article.content.substring(Math.max(0, matchIndex - 50), matchIndex);
        const afterContext = article.content.substring(matchIndex + match[0].length, Math.min(article.content.length, matchIndex + match[0].length + 50));

        resultsWithPreview.push({
          ...result,
          originalContent: article.content,
          newContent,
          preview: {
            originalLength: article.content.length,
            newLength: newContent.length,
            changeCount,
            matchDetails: {
              originalText: match[0],
              replacementText: replaceTerm,
              position: matchIndex,
              beforeContext,
              afterContext,
              fullContext: beforeContext + `[[${match[0]}]]` + afterContext
            }
          }
        });
      }
    }
  }

  return {
    searchTerm,
    replaceTerm,
    options,
    total: resultsWithPreview.length,
    totalChanges: resultsWithPreview.length,
    results: resultsWithPreview
  };
}