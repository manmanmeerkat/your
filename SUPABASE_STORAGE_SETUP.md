# Supabase Storage 設定ガイド

## 📋 前提条件

1. Supabase プロジェクトが作成済み
2. 環境変数が設定済み
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🗂️ Storage バケットの作成

### 1. Supabase Dashboard にアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択

### 2. Storage バケットを作成

1. 左サイドバーから **Storage** をクリック
2. **New bucket** をクリック
3. 以下の設定でバケットを作成：
   - **Name**: `article-images`
   - **Public bucket**: ✅ チェック（画像を公開アクセス可能にする）
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/*`

### 3. RLS (Row Level Security) の設定

バケット作成後、以下の SQL を実行して RLS を設定：

```sql
-- バケットのRLSを有効化
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 全ユーザーが画像を閲覧可能
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

-- 認証済みユーザーのみ削除可能
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 🚀 移行手順

### 1. 既存画像を Supabase Storage に移行

```bash
# 環境変数を設定
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# 画像移行スクリプトを実行
node scripts/migrate-images-to-supabase.mjs
```

### 2. データベースの画像 URL を更新

```bash
# URL更新スクリプトを実行
node scripts/update-image-urls.mjs
```

### 3. アプリケーションを再デプロイ

```bash
# 変更をコミット
git add .
git commit -m "Migrate to Supabase Storage"

# デプロイ
git push
```

## 🔧 トラブルシューティング

### よくある問題

1. **認証エラー**

   - `SUPABASE_SERVICE_ROLE_KEY` が正しく設定されているか確認
   - サービスロールキーは `anon` キーとは異なります

2. **バケットが見つからない**

   - バケット名が `article-images` で作成されているか確認
   - バケットが公開設定になっているか確認

3. **アップロードエラー**

   - ファイルサイズが 10MB 以下か確認
   - ファイル形式が画像形式か確認

4. **画像が表示されない**
   - Next.js の `next.config.js` で Supabase ドメインが許可されているか確認
   - ブラウザのキャッシュをクリア

### ログの確認

```bash
# アプリケーションログを確認
npm run dev

# Supabase Dashboard で Storage のログを確認
```

## 📊 パフォーマンス

### 最適化のヒント

1. **画像サイズの最適化**

   - アップロード前に画像をリサイズ
   - WebP 形式の使用を推奨

2. **キャッシュ設定**

   - CDN キャッシュを活用
   - ブラウザキャッシュを適切に設定

3. **遅延読み込み**
   - 画像の遅延読み込みを実装
   - 優先度の高い画像のみ即座に読み込み

## 🔒 セキュリティ

### 推奨設定

1. **アクセス制御**

   - 認証済みユーザーのみアップロード可能
   - 全ユーザーが閲覧可能（記事画像のため）

2. **ファイル検証**

   - ファイルサイズの制限
   - ファイル形式の制限
   - マルウェアスキャン（必要に応じて）

3. **監査ログ**
   - アップロード・削除のログを記録
   - 異常なアクセスの監視

## 📞 サポート

問題が発生した場合は：

1. Supabase Dashboard のログを確認
2. アプリケーションのコンソールログを確認
3. 環境変数の設定を再確認
4. 必要に応じて Supabase サポートに問い合わせ
