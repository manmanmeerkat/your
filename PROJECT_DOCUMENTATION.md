# Your Secret Japan - プロジェクトドキュメント

## プロジェクト概要

Your Secret Japan は、日本の文化、風習、祭り、神話などを紹介するウェブサイトです。Next.js、TypeScript、Tailwind CSS、Prisma を使用して構築されています。

## 現在のファイル構造

```
your-secret-japan/
├── app/                          # Next.jsアプリケーション
│   ├── about/                    # サイトについて
│   │   └── page.tsx             # ページコンポーネント
│   │
│   ├── admin/                    # 管理画面
│   │   ├── AdminDashboardContent.tsx # ダッシュボードコンテンツ
│   │   ├── AdminDashboard.tsx    # ダッシュボード
│   │   ├── layout.tsx           # 管理画面レイアウト
│   │   ├── page.tsx             # 管理画面メイン
│   │   ├── category-item/       # カテゴリー管理
│   │   ├── messages/           # メッセージ管理
│   │   ├── articles/           # 記事管理
│   │   └── login/              # ログイン
│   │
│   ├── all-articles/            # 全記事一覧
│   ├── api/                      # APIルート
│   │   ├── contact/             # お問い合わせAPI
│   │   │   ├── route.ts         # お問い合わせルート
│   │   │   └── [id]/            # 個別お問い合わせ
│   │   ├── search/              # 検索API
│   │   │   └── route.ts         # 検索ルート
│   │   ├── articles/            # 記事API
│   │   ├── warmup/              # ウォームアップAPI
│   │   ├── article-counts/      # 記事数カウントAPI
│   │   ├── category-items/      # カテゴリーアイテムAPI
│   │   ├── categories/          # カテゴリーAPI
│   │   ├── fix-slugs/           # スラッグ修正API
│   │   └── upload/              # アップロードAPI
│   │
│   ├── articles/                 # 記事ページ
│   ├── category-item/           # カテゴリー別アイテム
│   ├── contact/                 # お問い合わせ
│   ├── culture/                 # 文化
│   ├── customs/                 # 風習
│   ├── festivals/               # 祭り
│   ├── mythology/               # 神話
│   ├── privacy-policy/          # プライバシーポリシー
│   ├── test-performance/        # パフォーマンステスト
│   ├── hooks/                   # カスタムフック
│   │   └── usePaginationOptimization.ts # ページネーション最適化フック
│   │
│   ├── utils/                   # ユーティリティ
│   │   └── simpleMarkdownRenderer.ts # シンプルMarkdownレンダラー
│   │
│   ├── styles/                  # スタイル
│   │   ├── japanese-style-modern.css # 和風モダンスタイル
│   │   └── admin-overrides.css  # 管理画面用スタイル上書き
│   │
│   ├── globals.css              # グローバルスタイル
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # トップページ
│
├── components/                   # 再利用可能なコンポーネント
│   ├── AllArticlesCategoryFilter.tsx # カテゴリーフィルター
│   ├── AllArticlesContent.tsx    # 記事一覧コンテンツ
│   ├── AllArticlesPaginationWrapper.tsx # ページネーションラッパー
│   ├── ArticlesDataProvider.tsx  # 記事データプロバイダー
│   ├── background-slideshow.tsx  # 背景スライドショー
│   ├── pagination-wrapper.tsx    # ページネーションラッパー
│   │
│   ├── articleCard/             # 記事カード
│   │   └── articleCard.tsx      # 記事カードコンポーネント
│   │
│   ├── articleClientPage/       # 記事クライアントページ
│   │   └── ArticleClientPage.tsx # 記事表示コンポーネント
│   │
│   ├── backToHomeBtn/           # ホームへ戻るボタン
│   │   └── BackToHomeBtn.tsx    # ホームへ戻るボタンコンポーネント
│   │
│   ├── backToTopBtn/            # トップへ戻るボタン
│   │   └── BackToTopBtn.tsx     # トップへ戻るボタンコンポーネント
│   │
│   ├── debug/                   # デバッグ用
│   │   ├── ScrollDebugger.tsx   # スクロールデバッガー
│   │   └── FloatingButtonDebugger.tsx # フローティングボタンデバッガー
│   │
│   ├── getInTouch/              # お問い合わせフォーム
│   │   ├── GetInTouch.tsx       # お問い合わせメインコンポーネント
│   │   ├── simpleContact/       # シンプルお問い合わせ
│   │   ├── contactForm/         # お問い合わせフォーム
│   │   └── contactCard/         # お問い合わせカード
│   │
│   ├── gods/                    # 神々関連
│   │   └── GodsGallery.tsx      # 神々のギャラリー表示
│   │
│   ├── japanese-style/          # 和風デザイン
│   │   ├── FloatingButtons.tsx  # フローティングボタン
│   │   └── TableOfContents.tsx  # 目次表示
│   │
│   ├── layout/                  # レイアウト
│   │   ├── header.tsx           # ヘッダーコンポーネント
│   │   └── footer.tsx           # フッターコンポーネント
│   │
│   ├── loaders/                 # ローディング
│   │   └── ArticlesLoader.tsx   # 記事ローディング表示
│   │
│   ├── pagination/              # ページネーション
│   ├── redBubble/               # 赤いバブルデザイン
│   ├── scroll/                  # スクロール関連
│   ├── sidebar/                 # サイドバー
│   ├── top/                     # トップページ用
│   │
│   ├── ui/                      # UI基本コンポーネント
│   │   ├── avatar.tsx           # アバター
│   │   ├── button.tsx           # ボタン
│   │   ├── card.tsx             # カード
│   │   ├── checkbox.tsx         # チェックボックス
│   │   ├── improved-pagination.tsx # 改善されたページネーション
│   │   ├── input.tsx            # 入力フィールド
│   │   ├── label.tsx            # ラベル
│   │   ├── select.tsx           # セレクトボックス
│   │   ├── textarea.tsx         # テキストエリア
│   │   ├── toast.tsx            # トースト通知
│   │   └── use-toast.tsx        # トーストフック
│   │
│   └── whiteLine/               # 白線デザイン
│
├── prisma/                      # データベース関連
│   ├── schema.prisma           # データベーススキーマ
│   └── migrations/             # マイグレーションファイル
│
├── public/                      # 静的ファイル
│   └── images/                 # 画像ファイル
│
├── scripts/                     # ビルドスクリプト
│   └── generateArticleSitemap.ts # サイトマップ生成
│
├── types/                       # TypeScript型定義
│   └── index.ts                # 型定義ファイル
│
├── lib/                         # ユーティリティ関数
│   └── prisma.ts               # Prismaクライアント
│
├── constants/                   # 定数定義
│   └── categoryConfig.ts       # カテゴリー設定
│
├── src/                         # ソースコード
│
├── next.config.js              # Next.js設定
├── tailwind.config.js          # Tailwind設定
├── package.json                # 依存関係
├── tsconfig.json               # TypeScript設定
├── tsconfig.sitemap.json       # サイトマップ生成用TS設定
├── vercel.json                 # Vercel設定
├── eslint.config.mjs           # ESLint設定
├── postcss.config.js           # PostCSS設定
├── postcss.config.mjs          # PostCSS設定（ESM）
├── components.json             # コンポーネント設定
├── next-sitemap.config.js      # サイトマップ設定
├── middleware.ts               # ミドルウェア
└── next-env.d.ts              # Next.js型定義
```

### 現在の構成の特徴

1. **アプリケーション構造**

   - Next.js の App Router を使用
   - 機能ごとのディレクトリ分割
   - クライアント/サーバーコンポーネントの分離
   - 管理画面の詳細な機能分割
   - 充実した API エンドポイント
     - お問い合わせ管理
     - 検索機能
     - 記事管理
     - カテゴリー管理
     - アップロード機能
     - パフォーマンス最適化（ウォームアップ）
   - カスタムフックによる機能拡張
   - ユーティリティ関数の集約
   - 和風デザインのスタイル管理

2. **コンポーネント構成**

   - 機能別のコンポーネント分割
   - 再利用可能な UI コンポーネント
   - 和風デザイン要素の分離
   - 記事関連の複雑なコンポーネント構造
   - 豊富な UI 基本コンポーネント
   - デバッグ機能の充実
   - お問い合わせ機能の多様な実装
   - 神々のギャラリー表示
   - 和風デザイン要素の実装
   - レイアウトコンポーネントの分離

3. **データベース管理**

   - Prisma による型安全なデータベース操作
   - マイグレーション管理

4. **設定ファイル**

   - 各種設定の分離
   - 環境別の設定管理
   - ビルド最適化設定

5. **型定義**

   - TypeScript による型安全性
   - 共通型定義の集中管理

6. **ビルド・デプロイ**
   - Vercel 向けの最適化
   - サイトマップ自動生成
   - パフォーマンス最適化
