# Your Secret Japan プロジェクト構造

## プロジェクト概要

このプロジェクトは、日本の文化、神話、祭り、習慣などについての情報を提供するウェブアプリケーションです。Next.js を使用して構築されており、モダンな UI とレスポンシブなデザインを特徴としています。

## 詳細なディレクトリ構造

### ルートディレクトリ

- `.next/` - Next.js のビルド出力ディレクトリ
- `.git/` - Git リポジトリ設定
- `.vercel/` - Vercel デプロイ設定
- `app/` - アプリケーションのメインコード
- `components/` - 再利用可能な UI コンポーネント
- `public/` - 静的ファイル（画像など）
- `lib/` - ユーティリティ関数やヘルパー
- `types/` - TypeScript 型定義
- `prisma/` - データベーススキーマとマイグレーション
- `constants/` - 定数定義
- `scripts/` - ビルドスクリプトやその他のスクリプト
- `node_modules/` - 依存パッケージ

### アプリケーション構造（app/）

- `api/` - API ルート
- `articles/` - 記事関連のページ
- `category-item/` - カテゴリーアイテム関連のページ
- `mythology/` - 神話関連のページ
- `festivals/` - 祭り関連のページ
- `customs/` - 習慣関連のページ
- `culture/` - 文化関連のページ
- `admin/` - 管理者用ページ
- `contact/` - お問い合わせページ
- `about/` - サイトについてのページ
- `privacy-policy/` - プライバシーポリシーページ
- `all-articles/` - 全記事一覧ページ
- `styles/` - スタイル関連ファイル
- `utils/` - ユーティリティ関数
- `globals.css` - グローバルスタイル

### コンポーネント構造（components/）

- `articleClientPage/` - 記事クライアントページコンポーネント
- `japanese-style/` - 和風デザインコンポーネント
- `redBubble/` - 赤いバブルデザインコンポーネント
- `layout/` - レイアウト関連コンポーネント
- `gods/` - 神様関連コンポーネント
- `articleCard/` - 記事カードコンポーネント
- `top/` - トップページコンポーネント
- `loaders/` - ローディングコンポーネント
- `backToHomeBtn/` - ホームに戻るボタン
- `ui/` - 基本 UI コンポーネント
- `getInTouch/` - お問い合わせフォーム
- `pagination/` - ページネーションコンポーネント
- `backToTopBtn/` - トップに戻るボタン
- `whiteLine/` - 白線デザインコンポーネント

### ライブラリ構造（lib/）

- `MarkedRenderer.ts` - Markdown レンダラー
- `markdown.ts` - Markdown 処理ユーティリティ
- `prisma.js` - Prisma クライアント設定
- `prisma.ts` - Prisma 型定義
- `supabase/` - Supabase 関連設定
- `utils.ts` - 汎用ユーティリティ関数
- `auth-helper.ts` - 認証ヘルパー関数
- `auth.ts` - 認証関連設定

## 主要設定ファイル

- `package.json` - プロジェクトの依存関係とスクリプト
- `tsconfig.json` - TypeScript 設定
- `next.config.js` - Next.js 設定
- `tailwind.config.js` - Tailwind CSS 設定
- `prisma/schema.prisma` - データベーススキーマ
- `middleware.ts` - ミドルウェア設定
- `vercel.json` - Vercel 設定
- `eslint.config.mjs` - ESLint 設定
- `postcss.config.js` - PostCSS 設定
- `next-sitemap.config.js` - サイトマップ設定

## 技術スタック

- フレームワーク: Next.js
- 言語: TypeScript
- スタイリング: Tailwind CSS
- データベース: Prisma
- 認証: Supabase
- デプロイ: Vercel

## 開発環境のセットアップ

1. 依存関係のインストール:

```bash
npm install
```

2. データベースのセットアップ:

```bash
npx prisma generate
npx prisma db push
```

3. 開発サーバーの起動:

```bash
npm run dev
```

## ビルドとデプロイ

- 本番ビルド: `npm run build`
- デプロイ: Vercel への自動デプロイが設定されています
