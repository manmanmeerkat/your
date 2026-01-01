# Your Secret Japan - プロジェクト概要とファイル構造

## プロジェクト概要

**Your Secret Japan** は、日本の文化、神話、祭り、習慣などについて情報を提供する多言語対応のウェブサイトです。Next.js 14 の App Router を使用して構築されており、モダンな UI とレスポンシブデザインを特徴としています。

### 主な目的

- 日本の文化、神話、祭り、習慣に関する情報の提供
- 英語圏の読者向けに日本の伝統文化を紹介
- 管理者向けのコンテンツ管理システム（CMS）の提供
- SEO 最適化とパフォーマンス重視の設計

### 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS、カスタム CSS（和風デザイン）
- **データベース**: PostgreSQL (Prisma ORM)
- **認証**: Supabase Auth
- **画像ストレージ**: Supabase Storage
- **デプロイ**: Vercel
- **フォント**: Noto Serif JP（Google Fonts）
- **Markdown 処理**: marked、react-markdown、rehype プラグイン
- **UI コンポーネント**: Radix UI、shadcn/ui
- **その他**: Google Tag Manager、next-sitemap

---

## 詳細なファイル構造

```
your-secret-japan/
│
├── app/                                    # Next.js App Router のメインディレクトリ
│   ├── about/                              # サイトについてページ
│   │   └── page.tsx
│   │
│   ├── admin/                              # 管理者用ダッシュボード
│   │   ├── AdminDashboard.tsx              # ダッシュボードメインコンポーネント
│   │   ├── AdminDashboardContent.tsx       # ダッシュボードコンテンツ
│   │   ├── layout.tsx                      # 管理画面レイアウト
│   │   ├── page.tsx                        # 管理画面トップページ
│   │   ├── login/                          # ログインページ
│   │   │   ├── page.tsx
│   │   │   └── (その他のログイン関連ファイル)
│   │   ├── articles/                       # 記事管理
│   │   │   └── (記事管理関連ファイル)
│   │   ├── category-item/                  # カテゴリーアイテム管理
│   │   │   └── (カテゴリーアイテム管理関連ファイル)
│   │   └── messages/                       # お問い合わせメッセージ管理
│   │       └── (メッセージ管理関連ファイル)
│   │
│   ├── all-articles/                       # 全記事一覧ページ
│   │   ├── page.tsx
│   │   └── AllArticlesContent.tsx
│   │
│   ├── api/                                # API ルート
│   │   ├── article-counts/                 # 記事数カウントAPI
│   │   │   └── route.ts
│   │   ├── articles/                       # 記事関連API
│   │   │   ├── route.ts                    # 記事一覧・作成API
│   │   │   ├── [slug]/route.ts             # 個別記事API
│   │   │   └── public/[slug]/route.ts      # 公開記事API
│   │   ├── categories/                     # カテゴリーAPI
│   │   │   └── route.ts
│   │   ├── category-items/                 # カテゴリーアイテムAPI
│   │   │   ├── route.ts                    # カテゴリーアイテム一覧・作成API
│   │   │   ├── [slug]/route.ts             # 個別カテゴリーアイテムAPI
│   │   │   └── related/route.ts            # 関連アイテムAPI
│   │   ├── contact/                        # お問い合わせAPI
│   │   │   ├── route.ts                    # お問い合わせ作成・一覧API
│   │   │   └── [id]/                       # 個別お問い合わせ管理
│   │   │       ├── route.ts
│   │   │       └── status/route.ts         # ステータス更新API
│   │   ├── fix-slugs/                      # スラッグ修正API
│   │   │   └── route.ts
│   │   ├── images/                         # 画像関連API
│   │   │   └── route.ts
│   │   ├── revalidate/                     # キャッシュ再検証API
│   │   │   └── route.ts
│   │   ├── search/                         # 検索API
│   │   │   └── route.ts
│   │   ├── trivia/                         # トリビアAPI
│   │   │   ├── route.ts                    # トリビア一覧・作成API
│   │   │   ├── [triviaId]/route.ts         # 個別トリビアAPI
│   │   │   └── article/[articleId]/route.ts # 記事に紐づくトリビアAPI
│   │   ├── upload/                         # ファイルアップロードAPI
│   │   │   └── route.ts
│   │   └── warmup/                         # ウォームアップAPI（パフォーマンス最適化）
│   │       └── route.ts
│   │
│   ├── articles/                           # 記事表示ページ
│   │   └── [slug]/
│   │       └── page.tsx                    # 動的ルート：個別記事ページ
│   │
│   ├── category-item/                      # カテゴリーアイテム表示ページ
│   │   └── [slug]/
│   │       └── page.tsx                    # 動的ルート：個別カテゴリーアイテムページ
│   │
│   ├── contact/                            # お問い合わせページ
│   │   └── page.tsx
│   │
│   ├── culture/                            # 文化カテゴリーページ
│   │   └── page.tsx
│   │
│   ├── customs/                            # 習慣カテゴリーページ
│   │   └── page.tsx
│   │
│   ├── festivals/                          # 祭りカテゴリーページ
│   │   └── page.tsx
│   │
│   ├── mythology/                          # 神話カテゴリーページ
│   │   └── page.tsx
│   │
│   ├── privacy-policy/                     # プライバシーポリシーページ
│   │   └── page.tsx
│   │
│   ├── hooks/                              # カスタムフック
│   │   ├── useActiveHeading.ts             # アクティブな見出し追跡フック
│   │   ├── usePaginationOptimization.ts    # ページネーション最適化フック
│   │   └── useToc.ts                       # 目次（Table of Contents）フック
│   │
│   ├── styles/                             # スタイルファイル
│   │   ├── admin-overrides.css             # 管理画面用スタイル上書き
│   │   └── japanese-style-modern.css       # 和風モダンスタイル
│   │
│   ├── utils/                              # ユーティリティ関数
│   │   ├── encoding.ts                     # エンコーディング関連
│   │   ├── headingId.ts                    # 見出しID生成
│   │   ├── markdownPreprocess.ts           # Markdown前処理
│   │   └── simpleMarkdownRenderer.tsx      # シンプルMarkdownレンダラー
│   │
│   ├── globals.css                         # グローバルスタイル
│   ├── layout.tsx                          # ルートレイアウト
│   └── page.tsx                            # トップページ（ホーム）
│
├── components/                             # 再利用可能なコンポーネント
│   ├── admin/                              # 管理画面用コンポーネント
│   │   └── ArticleImageManager.tsx         # 記事画像管理コンポーネント
│   │
│   ├── allArticlesComponents/              # 全記事一覧関連コンポーネント
│   │   ├── allArticlesCategoryFilter/      # カテゴリーフィルター
│   │   │   └── AllArticlesCategoryFilter.tsx
│   │   ├── allArticlesHeroSection/         # ヒーローセクション
│   │   │   └── AllArticlesHeroSection.tsx
│   │   ├── AllArticlesPaginationWrapper.tsx # ページネーションラッパー
│   │   └── getAllArticlesData/             # データ取得関数
│   │       └── GetAllArticlesData.ts
│   │
│   ├── articleCard/                        # 記事カードコンポーネント
│   │   └── articleCard.tsx
│   │
│   ├── articlePageComponents/              # 記事ページ関連コンポーネント
│   │   ├── articleDetailLayout/            # 記事詳細レイアウト
│   │   │   └── ArticleDetaiLayout.tsx
│   │   ├── articleSeo/                     # SEO関連
│   │   │   └── articleSeo.ts
│   │   ├── categoryArticlePage/            # カテゴリー記事ページ
│   │   │   └── categoryItemClient/
│   │   │       └── CategoryItemClient.tsx
│   │   ├── getArticleBySlug/               # スラッグで記事取得
│   │   │   └── getArticleBySlug.ts
│   │   ├── normalArticle/                  # 通常記事
│   │   │   └── normalArticleClientPage/
│   │   │       └── NormalArticleClientPage.tsx
│   │   └── sidebar/                        # サイドバー
│   │       └── RelatedArticles.tsx         # 関連記事
│   │
│   ├── backToHomeBtn/                      # ホームへ戻るボタン
│   │   └── BackToHomeBtn.tsx
│   │
│   ├── backToTopBtn/                       # トップへ戻るボタン
│   │   └── BackToTopBtn.tsx
│   │
│   ├── breadcrumb/                         # パンくずリスト
│   │   ├── Breadcrumb.tsx
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── JapaneseBreadcrumb.tsx
│   │   └── useBreadcrumb.ts
│   │
│   ├── categoryPageComponents/             # カテゴリーページ関連コンポーネント
│   │   ├── categoryArticlesSection/        # 記事セクション
│   │   │   └── CategoryArticleSection.tsx
│   │   ├── categoryArticlesSkeleton/       # スケルトンローディング
│   │   │   └── CategoryArticlesSkeleton.tsx
│   │   ├── categoryHeroSection/            # ヒーローセクション
│   │   │   └── CategoryHeroSection.tsx
│   │   ├── categoryHeroSection.tsx/        # ヒーローセクション（別実装）
│   │   │   └── CategoryHeroSection.tsx
│   │   └── categoryPageLayout/             # カテゴリーページレイアウト
│   │       └── CategoryPageLayout.tsx
│   │
│   ├── cultureComponents/                  # 文化関連コンポーネント
│   │   ├── getCultureData/                 # データ取得
│   │   │   └── GetCultureData.ts
│   │   └── mastersCultureSection/          # 文化マスターセクション
│   │       └── MastersCultureSection.tsx
│   │
│   ├── customsComponents/                  # 習慣関連コンポーネント
│   │   ├── getCustomsData/                 # データ取得
│   │   │   └── GetCustomsData.ts
│   │   └── wayOfLifeSection/               # ライフスタイルセクション
│   │       └── WayOfLifeSection.tsx
│   │
│   ├── debug/                              # デバッグ用コンポーネント
│   │   ├── FloatingButtonDebugger.tsx      # フローティングボタンデバッガー
│   │   └── ScrollDebugger.tsx              # スクロールデバッガー
│   │
│   ├── festivalsComponents/                # 祭り関連コンポーネント
│   │   ├── getFestivalsData/               # データ取得
│   │   │   └── GetFestivalsData.ts
│   │   ├── seasonalFestivalsSection/       # 季節の祭りセクション
│   │   │   └── SeasonalFestivalsSection.tsx
│   │   └── threeBigFestivalsSection/       # 三大祭りセクション
│   │       └── ThreeBigFestivalsSection.tsx
│   │
│   ├── getInTouch/                         # お問い合わせフォーム
│   │   ├── contactCard/                    # お問い合わせカード
│   │   │   └── ContactCard.tsx
│   │   ├── contactForm/                    # お問い合わせフォーム
│   │   │   ├── ContactForm.tsx
│   │   │   └── formGroup/
│   │   │       └── FormGroup.tsx
│   │   ├── GetInTouch.tsx                  # メインコンポーネント
│   │   └── simpleContact/                  # シンプルお問い合わせ
│   │       └── SimpleContact.tsx
│   │
│   ├── japanese-style/                     # 和風デザインコンポーネント
│   │   └── FloatingButtons.tsx             # フローティングボタン
│   │
│   ├── layout/                             # レイアウトコンポーネント
│   │   ├── footer.tsx                      # フッター
│   │   └── header/                         # ヘッダー
│   │       ├── header.tsx                  # メインヘッダー
│   │       └── headerParts/
│   │           ├── MobileMenuOverlay.tsx   # モバイルメニューオーバーレイ
│   │           └── NavLinkItem.tsx         # ナビゲーションリンクアイテム
│   │
│   ├── loaders/                            # ローディングコンポーネント
│   │   └── ArticlesLoader.tsx              # 記事ローディング表示
│   │
│   ├── mythologyComponents/                # 神話関連コンポーネント
│   │   ├── getMythologyData/               # データ取得
│   │   │   └── GetMythologyData.tsx
│   │   └── japaneseGodsSection/            # 日本の神々セクション
│   │       ├── gotsGallerySkeleton/        # ギャラリースケルトン
│   │       │   └── GotsGallerySkeleton.tsx
│   │       ├── gotsGalleryWrapper/         # ギャラリーラッパー
│   │       │   ├── desktopUI/              # デスクトップUI
│   │       │   │   └── DesktopUI.tsx
│   │       │   ├── getGodsItem/            # 神々アイテム取得
│   │       │   │   └── GetGodsItem.tsx
│   │       │   ├── getGodsSlug/            # スラッグ取得
│   │       │   │   └── GetGodsSlug.ts
│   │       │   ├── gotsGalleryDetail/      # ギャラリー詳細
│   │       │   │   └── GodsGalleryDetail.tsx
│   │       │   ├── GotsGalleryWrapper.tsx  # メインラッパー
│   │       │   └── mobileScrollUI/         # モバイルスクロールUI
│   │       │       └── MobileScrollUI.tsx
│   │       └── JapaneseGodsSection.tsx     # メインセクション
│   │
│   ├── pagination/                         # ページネーション
│   │   ├── pagination-wrapper.tsx          # ラッパー
│   │   ├── pagination.css                  # スタイル
│   │   └── Pagination.tsx                  # メインコンポーネント
│   │
│   ├── privacyPolicyComponents/            # プライバシーポリシー関連
│   │   └── BackToContactLink.tsx           # お問い合わせへのリンク
│   │
│   ├── redBubble/                          # RedBubble関連
│   │   └── RedBubble.tsx                   # RedBubble商品表示
│   │
│   ├── scroll/                             # スクロール関連
│   │   └── ScrollHandler.tsx               # スクロールハンドラー
│   │
│   ├── sectionTitle/                       # セクションタイトル
│   │   └── SectionTitle.tsx
│   │
│   ├── test-performance/                   # パフォーマンステスト
│   │   └── page.tsx
│   │
│   ├── top/                                # トップページ関連コンポーネント
│   │   ├── categoriesSection/              # カテゴリーセクション
│   │   │   └── CategoriesSection.tsx
│   │   ├── categoryCard/                   # カテゴリーカード
│   │   │   └── categoryCard.tsx
│   │   ├── heroSection/                    # ヒーローセクション
│   │   │   └── HeroSection.tsx
│   │   ├── latestArticlesSection/          # 最新記事セクション
│   │   │   └── LatestArticlesSection.tsx
│   │   └── slider/                         # スライダー
│   │       └── Slider.tsx
│   │
│   ├── trivia/                             # トリビア関連
│   │   ├── ContentWithTrivia.tsx           # トリビア付きコンテンツ
│   │   ├── TriviaCard.tsx                  # トリビアカード
│   │   └── TriviaMarkdown.tsx              # トリビアMarkdown
│   │
│   ├── ui/                                 # 基本UIコンポーネント（shadcn/ui）
│   │   ├── avatar.tsx                      # アバター
│   │   ├── badge.tsx                       # バッジ
│   │   ├── button.tsx                      # ボタン
│   │   ├── card.tsx                        # カード
│   │   ├── checkbox.tsx                    # チェックボックス
│   │   ├── improved-pagination.tsx         # 改善されたページネーション
│   │   ├── input.tsx                       # 入力フィールド
│   │   ├── label.tsx                       # ラベル
│   │   ├── optimizedImage.tsx              # 最適化された画像
│   │   ├── select.tsx                      # セレクトボックス
│   │   ├── tableOfContents.tsx             # 目次
│   │   ├── textarea.tsx                    # テキストエリア
│   │   ├── toast.tsx                       # トースト通知
│   │   └── use-toast.tsx                   # トーストフック
│   │
│   └── whiteLine/                          # 白線デザイン
│       └── whiteLine.tsx
│
├── constants/                              # 定数定義
│   └── constants.ts                        # ナビゲーション、カテゴリー、画像などの定数
│
├── lib/                                    # ライブラリ・ユーティリティ関数
│   ├── articlePage/                        # 記事ページ関連
│   │   ├── toDisplayDocFromArticle.ts      # 記事から表示ドキュメント変換
│   │   └── toDisplayDocFromCategoryItem.ts # カテゴリーアイテムから表示ドキュメント変換
│   ├── auth-helper.ts                      # 認証ヘルパー関数
│   ├── auth.ts                             # 認証設定
│   ├── categoryPage/                       # カテゴリーページ関連
│   │   ├── articlesApi.ts                  # 記事API関数
│   │   ├── articlesSectionConfig.ts        # 記事セクション設定
│   │   └── heroSectionConfig.ts            # ヒーローセクション設定
│   ├── markdown.ts                         # Markdown処理ユーティリティ
│   ├── MarkedRenderer.ts                   # Markedレンダラー
│   ├── prisma.ts                           # Prismaクライアント設定
│   ├── sidebar/                            # サイドバー関連
│   │   └── getRelatedArticles.ts           # 関連記事取得
│   ├── simpleMarkdownRenderer.tsx          # シンプルMarkdownレンダラー
│   ├── supabase/                           # Supabase関連
│   │   ├── client.ts                       # クライアントサイドSupabaseクライアント
│   │   └── server.ts                       # サーバーサイドSupabaseクライアント
│   └── utils.ts                            # 汎用ユーティリティ関数
│
├── prisma/                                 # Prisma データベーススキーマ
│   ├── schema.prisma                       # データベーススキーマ定義
│   └── prisma.ts                           # Prismaクライアント（生成されたファイルへの参照）
│
├── public/                                 # 静的ファイル
│   ├── images/                             # 画像ファイル（115ファイル）
│   │   ├── category-img/                   # カテゴリー画像
│   │   ├── culture/                        # 文化関連画像
│   │   ├── gods/                           # 神々の画像
│   │   ├── icon/                           # アイコン
│   │   ├── redbubble/                      # RedBubble商品画像
│   │   ├── season/                         # 季節画像
│   │   ├── slide/                          # スライド画像
│   │   ├── three-festivals/                # 三大祭り画像
│   │   └── way-of-life/                    # ライフスタイル画像
│   ├── android-chrome-192x192.png          # Android用アイコン
│   ├── android-chrome-512x512.png          # Android用アイコン（大）
│   ├── apple-touch-icon.png                # Apple用タッチアイコン
│   ├── favicon-16x16.png                   # ファビコン
│   ├── favicon-32x32.png                   # ファビコン
│   ├── favicon.ico                         # ファビコン
│   ├── ogp-image.png                       # OGP画像
│   ├── robots.txt                          # 検索エンジン向けrobotsファイル
│   ├── sitemap-0.xml                       # サイトマップ（自動生成）
│   ├── sitemap-articles.xml                # 記事サイトマップ（自動生成）
│   └── sitemap.xml                         # メインサイトマップ（自動生成）
│
├── scripts/                                # ビルドスクリプト・ユーティリティ
│   ├── generateArticleSitemap.ts           # 記事サイトマップ生成スクリプト
│   ├── migrate-images-to-supabase.mjs      # Supabaseへの画像マイグレーション
│   ├── test-articles.mjs                   # 記事テストスクリプト
│   ├── test-prisma.mts                     # Prismaテストスクリプト
│   ├── update-article-content-images.mjs   # 記事コンテンツ画像更新
│   └── update-image-urls.mjs               # 画像URL更新
│
├── types/                                  # TypeScript型定義
│   ├── global.d.ts                         # グローバル型定義
│   ├── slugDisplay.ts                      # スラッグ表示関連型
│   └── types.ts                            # 共通型定義
│
├── .gitignore                              # Git除外ファイル
├── components.json                         # shadcn/uiコンポーネント設定
├── eslint.config.mjs                       # ESLint設定
├── EXPLAIN_IMAGES.md                       # 画像説明ドキュメント
├── EXPLAIN_IMAGES.md.backup                # 画像説明ドキュメント（バックアップ）
├── middleware.ts                           # Next.jsミドルウェア（認証保護）
├── next.config.js                          # Next.js設定
├── next-env.d.ts                           # Next.js型定義（自動生成）
├── next-sitemap.config.js                  # サイトマップ生成設定
├── package.json                            # プロジェクト依存関係とスクリプト
├── package-lock.json                       # 依存関係ロックファイル
├── postcss.config.js                       # PostCSS設定
├── PROJECT_DOCUMENTATION.md                # プロジェクトドキュメント
├── PROJECT_STRUCTURE.md                    # プロジェクト構造ドキュメント
├── README.md                               # プロジェクトREADME
├── SUPABASE_STORAGE_SETUP.md               # Supabaseストレージセットアップガイド
├── tailwind.config.js                      # Tailwind CSS設定
├── tsconfig.json                           # TypeScript設定
├── tsconfig.sitemap.json                   # サイトマップ生成用TypeScript設定
└── vercel.json                             # Vercelデプロイ設定
```

---

## データベーススキーマ（Prisma）

### 主要なモデル

1. **Article** - 記事

   - タイトル、スラッグ、コンテンツ、カテゴリー、公開状態など
   - 画像（Image）との 1 対多リレーション
   - トリビア（ArticleTrivia）との 1 対多リレーション

2. **CategoryItem** - カテゴリーアイテム

   - 記事と同様の構造だが、カテゴリー別のアイテム管理用
   - 画像（CategoryItemImage）との 1 対多リレーション
   - トリビア（CategoryItemTrivia）との 1 対多リレーション

3. **Image** - 記事画像

   - 記事に紐づく画像情報

4. **CategoryItemImage** - カテゴリーアイテム画像

   - カテゴリーアイテムに紐づく画像情報

5. **ArticleTrivia** - 記事トリビア

   - 記事に紐づくトリビア情報（タイトル、コンテンツ、カテゴリーなど）

6. **CategoryItemTrivia** - カテゴリーアイテムトリビア

   - カテゴリーアイテムに紐づくトリビア情報

7. **ContactMessage** - お問い合わせメッセージ
   - 名前、メール、件名、メッセージ、ステータスなど

---

## 主要な機能

### 1. コンテンツ管理

- **記事管理**: 記事の作成、編集、削除、公開状態の管理
- **カテゴリーアイテム管理**: カテゴリー別のアイテム管理
- **画像管理**: Supabase Storage を使用した画像のアップロードと管理
- **トリビア管理**: 記事やアイテムに紐づくトリビア情報の管理

### 2. 認証・認可

- **Supabase Auth**: 管理者向けの認証システム
- **ミドルウェア保護**: `/admin` 配下のページと API の認証保護

### 3. コンテンツ表示

- **動的ルーティング**: スラッグベースの記事・アイテムページ
- **Markdown レンダリング**: 記事コンテンツの Markdown 表示
- **関連記事**: サイドバーに表示される関連記事
- **目次（TOC）**: 記事の見出しから自動生成される目次

### 4. SEO 最適化

- **メタデータ**: 各ページの適切なメタタグ設定
- **サイトマップ**: 自動生成されるサイトマップ
- **OGP 画像**: ソーシャルメディア向けの OGP 画像設定

### 5. パフォーマンス最適化

- **画像最適化**: Next.js Image 最適化の設定
- **キャッシュ戦略**: 開発環境と本番環境で異なるキャッシュ設定
- **ウォームアップ API**: パフォーマンス向上のためのウォームアップ

### 6. UI/UX

- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **和風デザイン**: 日本文化に特化したデザイン要素
- **ページネーション**: 記事一覧のページネーション
- **検索機能**: 記事の検索機能

---

## 開発・ビルド・デプロイ

### 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npx prisma generate
npx prisma db push

# 開発サーバーの起動
npm run dev
```

### ビルド

```bash
# 本番ビルド
npm run build

# ビルドプロセス：
# 1. Prismaクライアント生成
# 2. Next.jsビルド
# 3. 記事サイトマップ生成
# 4. next-sitemapによるサイトマップ生成
```

### デプロイ

- **Vercel**: 自動デプロイが設定されています
- **環境変数**: Vercel の環境変数設定が必要（DATABASE_URL、Supabase 設定など）

---

## 設定ファイルの詳細

### next.config.js

- 画像最適化の無効化（クレジット消費削減）
- Supabase Storage の画像ドメイン許可
- 開発環境でのキャッシュ無効化設定
- 本番環境での静的ファイルキャッシュ設定

### middleware.ts

- `/admin` 配下のページと API の認証チェック
- 未認証ユーザーをログインページへリダイレクト

### tsconfig.json

- TypeScript 設定
- パスエイリアス（`@/*`）
- ES2020 ターゲット

### tailwind.config.js

- Tailwind CSS 設定
- カスタムブレークポイント（xs: 377px）
- Typography プラグインの設定

---

## プロジェクトの特徴

1. **型安全性**: TypeScript による完全な型安全性
2. **コンポーネント設計**: 再利用可能なコンポーネントの階層構造
3. **パフォーマンス**: 画像最適化、キャッシュ戦略、コード分割
4. **SEO**: メタデータ、サイトマップ、構造化データ
5. **アクセシビリティ**: セマンティック HTML、適切な ARIA 属性
6. **国際化対応**: 英語でのコンテンツ提供（将来の多言語対応に備えた設計）

---

## 今後の拡張可能性

- 多言語対応（i18n）
- コメント機能
- ユーザーアカウント機能
- お気に入り機能
- ソーシャルシェア機能の拡充
- 動画コンテンツの追加
- ブログ機能の拡充

---

_最終更新: 2024 年_
