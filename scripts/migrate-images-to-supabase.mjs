import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数の確認
console.log('🔍 環境変数確認:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '設定済み' : '未設定');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '設定済み' : '未設定');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 画像ディレクトリのパス
const imagesDir = join(__dirname, '..', 'public', 'images', 'articles');

async function migrateImages() {
  try {
    console.log('🚀 画像移行を開始します...');
    
    // 記事ディレクトリを取得
    const articleDirs = await readdir(imagesDir);
    console.log(`📁 記事ディレクトリ数: ${articleDirs.length}`);
    
    for (const articleId of articleDirs) {
      const articleDir = join(imagesDir, articleId);
      
      try {
        // 記事ディレクトリ内の画像ファイルを取得
        const files = await readdir(articleDir);
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );
        
        console.log(`📸 記事 ${articleId}: ${imageFiles.length}個の画像を処理中...`);
        
        for (const fileName of imageFiles) {
          const filePath = join(articleDir, fileName);
          
          try {
            // ファイルを読み込み
            const fileBuffer = await readFile(filePath);
            
            // Supabase Storageにアップロード
            const storagePath = `${articleId}/${fileName}`;
            
            const { error } = await supabase.storage
              .from('article-images')
              .upload(storagePath, fileBuffer, {
                contentType: getContentType(fileName),
                cacheControl: '3600',
                upsert: true // 既存ファイルを上書き
              });
            
            if (error) {
              console.error(`❌ アップロードエラー (${fileName}):`, error.message);
            } else {
              console.log(`✅ アップロード成功: ${storagePath}`);
            }
            
          } catch (fileError) {
            console.error(`❌ ファイル処理エラー (${fileName}):`, fileError.message);
          }
        }
        
      } catch (dirError) {
        console.error(`❌ ディレクトリ処理エラー (${articleId}):`, dirError.message);
      }
    }
    
    console.log('🎉 画像移行が完了しました！');
    
  } catch (error) {
    console.error('💥 移行エラー:', error);
  }
}

function getContentType(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  return contentTypes[ext] || 'image/jpeg';
}

// スクリプト実行
migrateImages(); 