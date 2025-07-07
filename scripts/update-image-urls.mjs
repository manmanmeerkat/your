import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateImageUrls() {
  try {
    console.log('🔄 画像URLの更新を開始します...');
    
    // すべての画像を取得
    const images = await prisma.image.findMany({
      select: {
        id: true,
        url: true,
        articleId: true,
      },
    });
    
    console.log(`📊 更新対象画像数: ${images.length}`);
    
    for (const image of images) {
      try {
        // ローカルパスかどうかチェック
        if (image.url.startsWith('/images/articles/')) {
          // パスからファイル名を抽出
          const pathParts = image.url.split('/');
          const fileName = pathParts[pathParts.length - 1];
          const articleId = pathParts[pathParts.length - 2];
          
          // Supabase StorageのURLを生成
          const { data: { publicUrl } } = supabase.storage
            .from('article-images')
            .getPublicUrl(`${articleId}/${fileName}`);
          
          // データベースを更新
          await prisma.image.update({
            where: { id: image.id },
            data: { url: publicUrl },
          });
          
          console.log(`✅ URL更新: ${image.url} → ${publicUrl}`);
        } else {
          console.log(`⏭️ スキップ: ${image.url} (既にSupabase URL)`);
        }
        
      } catch (updateError) {
        console.error(`❌ 更新エラー (${image.id}):`, updateError.message);
      }
    }
    
    console.log('🎉 画像URLの更新が完了しました！');
    
  } catch (error) {
    console.error('💥 更新エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
updateImageUrls(); 