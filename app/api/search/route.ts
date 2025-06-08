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

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  matchCount: number;
  matches?: Array<{
    index: number;
    before: string;
    match: string;
    after: string;
    fullContext: string;
  }>;
  firstMatchIsLinked?: boolean;
  status?: 'ready' | 'already_linked';
  linkedText?: string;
}

interface DebugInfo {
  reason: 'no_match_found' | 'inside_markdown_link' | 'not_in_link';
  searchTerm?: string;
  contentLength?: number;
  linkFullMatch?: string;
  matchContext?: string;
}

interface PreviewResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  matchCount: number;
  matches?: Array<{
    index: number;
    before: string;
    match: string;
    after: string;
    fullContext: string;
  }>;
  firstMatchIsLinked?: boolean;
  status?: 'ready' | 'already_linked';
  linkedText?: string;
  originalContent: string;
  newContent: string;
  preview?: {
    originalLength: number;
    newLength: number;
    changeCount: number;
    alreadyLinked?: boolean;
    linkedText?: string;
    message?: string;
    matchDetails?: {
      originalText: string;
      replacementText: string;
      position: number;
      beforeContext: string;
      afterContext: string;
      fullContext: string;
    };
  };
}

// 🔧 改良されたマークダウンリンク判定関数
function findMarkdownLinks(content: string): Array<{
  start: number;
  end: number;
  linkText: string;
  url: string;
  fullMatch: string;
}> {
  const links = [];
  // より厳密なマークダウンリンクパターン
  const markdownLinkPattern = /\[([^\[\]]*?)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownLinkPattern.exec(content)) !== null) {
    links.push({
      start: match.index,
      end: match.index + match[0].length,
      linkText: match[1],
      url: match[2],
      fullMatch: match[0]
    });
    
    // 無限ループ防止
    if (match.index === markdownLinkPattern.lastIndex) {
      markdownLinkPattern.lastIndex++;
    }
  }
  
  return links;
}

// 🔧 改良された位置判定関数
function isInsideMarkdownLink(content: string, position: number): {
  isInside: boolean;
  linkInfo?: {
    linkText: string;
    url: string;
    fullMatch: string;
  };
} {
  const links = findMarkdownLinks(content);
  
  for (const link of links) {
    if (position >= link.start && position < link.end) {
      return {
        isInside: true,
        linkInfo: {
          linkText: link.linkText,
          url: link.url,
          fullMatch: link.fullMatch
        }
      };
    }
  }
  
  return { isInside: false };
}

// 🔧 改良された最初のマッチのリンク状態チェック
function checkFirstMatchLinkStatus(
  content: string,
  searchTerm: string,
  options: { caseSensitive?: boolean; wholeWord?: boolean }
): {
  isLinked: boolean;
  matchPosition?: number;
  linkText?: string;
  linkUrl?: string;
  debugInfo?: DebugInfo;
} {
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

  // 最初のマッチを検索
  const match = searchPattern.exec(content);
  
  if (!match || match.index === undefined) {
    return { 
      isLinked: false,
      debugInfo: { 
        reason: 'no_match_found',
        searchTerm,
        contentLength: content.length 
      }
    };
  }

  const matchPosition = match.index;
  
  // デバッグ用：マッチした内容の前後を取得
  const contextBefore = content.substring(Math.max(0, matchPosition - 20), matchPosition);
  const contextAfter = content.substring(matchPosition + match[0].length, Math.min(content.length, matchPosition + match[0].length + 20));
  
  console.log(`🔍 Debug - First match found:`, {
    searchTerm,
    matchPosition,
    matchedText: match[0],
    contextBefore,
    contextAfter,
    fullContext: contextBefore + `[${match[0]}]` + contextAfter
  });

  // マークダウンリンク内かチェック
  const linkCheck = isInsideMarkdownLink(content, matchPosition);
  
  console.log(`🔗 Debug - Link check result:`, {
    isInside: linkCheck.isInside,
    linkInfo: linkCheck.linkInfo
  });
  
  if (linkCheck.isInside && linkCheck.linkInfo) {
    return {
      isLinked: true,
      matchPosition,
      linkText: linkCheck.linkInfo.linkText,
      linkUrl: linkCheck.linkInfo.url,
      debugInfo: {
        reason: 'inside_markdown_link',
        linkFullMatch: linkCheck.linkInfo.fullMatch,
        matchContext: contextBefore + `[${match[0]}]` + contextAfter
      }
    };
  }
  
  return { 
    isLinked: false, 
    matchPosition,
    debugInfo: {
      reason: 'not_in_link',
      matchContext: contextBefore + `[${match[0]}]` + contextAfter
    }
  };
}

// 🔧 改良されたリンク外のマッチ検索
function findFirstMatchOutsideMarkdownLinks(
  content: string,
  searchTerm: string,
  options: { caseSensitive?: boolean; wholeWord?: boolean }
): { match: RegExpMatchArray; index: number } | null {
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

  let match;
  let attemptCount = 0;
  const maxAttempts = 100; // 無限ループ防止
  
  while ((match = searchPattern.exec(content)) !== null && attemptCount < maxAttempts) {
    attemptCount++;
    
    const linkCheck = isInsideMarkdownLink(content, match.index);
    console.log(`🔍 Match ${attemptCount} at position ${match.index}: inside link = ${linkCheck.isInside}`);
    
    if (!linkCheck.isInside) {
      console.log(`✅ Found first match outside link at position ${match.index}`);
      return { match, index: match.index };
    }
    
    // 無限ループ防止
    if (match.index === searchPattern.lastIndex) {
      searchPattern.lastIndex++;
    }
  }
  
  console.log(`❌ No matches found outside markdown links after ${attemptCount} attempts`);
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchQuery = query.trim();
    const results = [];

    if (type === 'article' || type === 'all') {
      const articles = await prisma.article.findMany({
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

      results.push(...articles.map(article => ({
        ...article,
        type: 'article'
      })));
    }

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

export async function POST(request: NextRequest) {
  try {
    const { 
      action, 
      query, 
      articleId, 
      type = 'article',
      replaceTerm,
      options = {}
    } = await request.json();

    if (action === 'highlight' || !action) {
      return await handleHighlight(query, articleId, type);
    }
    
    if (action === 'bulk-search') {
      return await handleBulkSearch(query, options);
    }
    
    if (action === 'bulk-preview') {
      return await handleBulkPreview(query, replaceTerm, options);
    }
    
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

  const searchRegex = new RegExp(query, 'gi');
  const matches = [];
  let match;

  while ((match = searchRegex.exec(content)) !== null) {
    const linkCheck = isInsideMarkdownLink(content, match.index);
    if (!linkCheck.isInside) {
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
    }

    if (match.index === searchRegex.lastIndex) {
      searchRegex.lastIndex++;
    }
  }

  return NextResponse.json({
    matches: matches.slice(0, 3)
  });
}

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

async function handleBulkPreview(
  searchTerm: string,
  replaceTerm: string,
  options: SearchOptions
) {
  const previewData = await getBulkPreviewData(searchTerm, replaceTerm, options);
  return NextResponse.json(previewData);
}

async function handleBulkReplace(
  searchTerm: string,
  replaceTerm: string,
  options: SearchOptions
) {
  const previewData = await getBulkPreviewData(searchTerm, replaceTerm, options);
  
  const readyToReplaceResults = previewData.results.filter(
    (result: PreviewResult) => result.status === 'ready'
  );
  
  const changes: BulkReplaceResult[] = [];

  await prisma.$transaction(async (tx) => {
    for (const result of readyToReplaceResults) {
      if (result.newContent && result.originalContent !== result.newContent) {
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
          changeCount: 1
        });
      }
    }

    console.log(`Bulk replace completed: ${changes.length} articles updated (excluding already linked)`);
    console.log(`Search term: "${searchTerm}" -> Replace term: "${replaceTerm}"`);
    console.log('Affected articles:', changes.map(c => ({ id: c.articleId, title: c.title })));
  });

  return NextResponse.json({
    success: true,
    message: `${changes.length} articles updated successfully (excluding already linked)`,
    affectedArticles: changes.length,
    totalChanges: changes.length,
    skippedArticles: previewData.results.length - readyToReplaceResults.length,
    alreadyLinkedCount: previewData.results.filter((r: PreviewResult) => r.status === 'already_linked').length,
    changes: changes.map(change => ({
      articleId: change.articleId,
      title: change.title,
      slug: change.slug,
      changeCount: change.changeCount,
      editUrl: `/admin/articles/${change.slug}`,
      previewUrl: `/articles/${change.slug}`
    })),
    searchTerm,
    replaceTerm,
    timestamp: new Date().toISOString()
  });
}

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
    const linkCheck = isInsideMarkdownLink(content, match.index);
    if (!linkCheck.isInside) {
      const start = Math.max(0, match.index - 30);
      const end = Math.min(content.length, match.index + match[0].length + 30);
      
      matches.push({
        index: match.index,
        before: content.substring(start, match.index),
        match: match[0],
        after: content.substring(match.index + match[0].length, end),
        fullContext: content.substring(start, end)
      });
    }

    if (match.index === searchPattern.lastIndex) {
      searchPattern.lastIndex++;
    }
  }

  return matches;
}

// 🔧 改良された検索データ取得（デバッグログ付き）
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

  console.log(`🚀 Starting bulk search for term: "${searchTerm}"`);

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
      content: true, // 常にコンテンツを取得
      category: true,
      published: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  console.log(`📊 Found ${articles.length} articles containing the search term`);

  const results: SearchResult[] = [];
  let readyCount = 0;
  let alreadyLinkedCount = 0;

  for (const article of articles) {
    if (article.content) {
      console.log(`\n🔍 Analyzing article: "${article.title}" (${article.id})`);
      
      // 最初のマッチのリンク状態をチェック
      const linkStatus = checkFirstMatchLinkStatus(
        article.content, 
        searchTerm, 
        { caseSensitive, wholeWord }
      );

      const matches = findMatches(article.content, searchTerm, { caseSensitive, wholeWord });
      
      console.log(`   📊 Link status: ${linkStatus.isLinked ? 'LINKED' : 'NOT_LINKED'}`);
      console.log(`   📊 Total matches outside links: ${matches.length}`);
      
      if (matches.length > 0 || linkStatus.isLinked) {
        const status = linkStatus.isLinked ? 'already_linked' : 'ready';
        
        if (status === 'ready') {
          readyCount++;
        } else {
          alreadyLinkedCount++;
        }

        results.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category,
          published: article.published,
          matchCount: matches.length,
          matches: includeContent ? matches.slice(0, 5) : undefined,
          firstMatchIsLinked: linkStatus.isLinked,
          status,
          linkedText: linkStatus.linkText
        });
        
        console.log(`   ✅ Added to results with status: ${status}`);
      } else {
        console.log(`   ❌ No valid matches found`);
      }
    }
  }

  console.log(`\n📈 Final results: ${results.length} total, ${readyCount} ready, ${alreadyLinkedCount} already linked`);

  return {
    searchTerm,
    options,
    total: results.length,
    totalMatches: results.reduce((sum, result) => sum + (result.matchCount || 0), 0),
    readyCount,
    alreadyLinkedCount,
    results
  };
}

async function getBulkPreviewData(
  searchTerm: string,
  replaceTerm: string,
  options: SearchOptions
) {
  const searchData = await getBulkSearchData(searchTerm, { ...options, includeContent: true });
  const resultsWithPreview = [];

  for (const result of searchData.results) {
    const article = await prisma.article.findUnique({
      where: { id: result.id },
      select: { content: true }
    });

    if (article?.content) {
      console.log(`\n🎭 Preview for article: "${result.title}"`);
      
      // 既にリンク済みの場合
      if (result.status === 'already_linked') {
        console.log(`   🔗 Article already linked, adding to skip list`);
        resultsWithPreview.push({
          ...result,
          originalContent: article.content,
          newContent: article.content,
          preview: {
            originalLength: article.content.length,
            newLength: article.content.length,
            changeCount: 0,
            alreadyLinked: true,
            linkedText: result.linkedText,
            message: `最初のマッチ「${searchTerm}」は既にリンク内にあります`
          }
        });
      } else {
        // 置換可能な場合
        const firstMatch = findFirstMatchOutsideMarkdownLinks(
          article.content, 
          searchTerm, 
          { 
            caseSensitive: options.caseSensitive, 
            wholeWord: options.wholeWord 
          }
        );

        if (firstMatch) {
          console.log(`   ✏️ Found replaceable match at position ${firstMatch.index}`);
          const beforeMatch = article.content.substring(0, firstMatch.index);
          const afterMatch = article.content.substring(firstMatch.index + firstMatch.match[0].length);
          const newContent = beforeMatch + replaceTerm + afterMatch;

          const matchIndex = firstMatch.index;
          const beforeContext = article.content.substring(Math.max(0, matchIndex - 50), matchIndex);
          const afterContext = article.content.substring(
            matchIndex + firstMatch.match[0].length, 
            Math.min(article.content.length, matchIndex + firstMatch.match[0].length + 50)
          );

          resultsWithPreview.push({
            ...result,
            originalContent: article.content,
            newContent,
            preview: {
              originalLength: article.content.length,
              newLength: newContent.length,
              changeCount: 1,
              matchDetails: {
                originalText: firstMatch.match[0],
                replacementText: replaceTerm,
                position: matchIndex,
                beforeContext,
                afterContext,
                fullContext: beforeContext + `[[${firstMatch.match[0]}]]` + afterContext
              }
            }
          });
        } else {
          console.log(`   ❌ No replaceable match found (this shouldn't happen)`);
        }
      }
    }
  }

  return {
    searchTerm,
    replaceTerm,
    options,
    total: resultsWithPreview.length,
    totalChanges: resultsWithPreview.filter((r: PreviewResult) => r.preview && r.preview.changeCount > 0).length,
    readyCount: resultsWithPreview.filter((r: PreviewResult) => r.status === 'ready').length,
    alreadyLinkedCount: resultsWithPreview.filter((r: PreviewResult) => r.status === 'already_linked').length,
    results: resultsWithPreview
  };
}