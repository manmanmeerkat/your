import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

// Supabaseクライアントは現在使用していませんが、将来的に必要になる可能性があります

console.log('🔄 記事本文内の画像パス更新を開始します...');

async function updateArticleContentImages() {
  try {
    // すべての記事を取得
    const articles = await prisma.articles.findMany({
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    console.log(`📊 更新対象記事数: ${articles.length}`);

    let updatedCount = 0;

    for (const article of articles) {
      let content = article.content;
      let hasChanges = false;

      // ローカルパスの画像を検索
      const localImageRegex = /!\[([^\]]*)\]\(\/images\/articles\/([^)]+)\)/g;
      const matches = [...content.matchAll(localImageRegex)];

      if (matches.length > 0) {
        console.log(`🔍 記事 "${article.title}" で ${matches.length} 個のローカル画像を発見`);
        
        for (const match of matches) {
          const [fullMatch, alt, imagePath] = match;
          const imageFileName = imagePath.split('/').pop();
          
          // 画像テーブルから対応するSupabase URLを検索
          const imageRecord = await prisma.images.findFirst({
            where: {
              article_id: article.id,
              url: {
                contains: imageFileName
              }
            }
          });

          if (imageRecord && imageRecord.url.includes('supabase.co')) {
            console.log(`✅ 更新: ${imageFileName} -> ${imageRecord.url}`);
            content = content.replace(fullMatch, `![${alt}](${imageRecord.url})`);
            hasChanges = true;
          } else {
            console.log(`⚠️ 対応する画像が見つかりません: ${imageFileName}`);
          }
        }
      }

      // 変更があった場合は記事を更新
      if (hasChanges) {
        await prisma.articles.update({
          where: { id: article.id },
          data: { content }
        });
        updatedCount++;
        console.log(`💾 記事 "${article.title}" を更新しました`);
      }
    }

    console.log(`🎉 記事本文の更新が完了しました！`);
    console.log(`📈 更新された記事数: ${updatedCount}`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
updateArticleContentImages(); 