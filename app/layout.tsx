import "./globals.css";
import "./styles/japanese-style-modern.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import { Toaster } from "sonner";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import BackToTopButton from "@/components/backToTopBtn/BackToTopBtn";
import Script from "next/script";

// 🚀 フォント最適化
const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // ✅ 既に最適
  preload: true, // 🚀 プリロード追加
  fallback: ["serif"], // 🚀 フォールバック追加
});

export const metadata: Metadata = {
  title: "Your Secret Japan -Explore Japan's hidden charms-",
  description:
    "Explore the world of Japanese mythology, festivals, culture, traditions, and customs. Your Secret Japan offers authentic insights and timeless stories to help you discover the true spirit of Japan.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Your Secret Japan -Explore Japan's hidden charms-",
    description:
      "Explore the world of Japanese mythology, festivals, culture, traditions, and customs. Your Secret Japan offers authentic insights and timeless stories to help you discover the true spirit of Japan.",
    url: "https://your-website.com",
    siteName: "Your Secret Japan",
    images: [
      {
        url: "/ogp-image.png",
        width: 1200,
        height: 630,
        alt: "Your Secret Japan - Torii and Mt. Fuji",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Secret Japan -Explore Japan's hidden charms-",
    description:
      "Explore the world of Japanese mythology, festivals, culture, traditions, and customs. Your Secret Japan offers authentic insights and timeless stories to help you discover the true spirit of Japan.",
    images: ["/ogp-image.png"],
    creator: "@your_twitter_id",
  },
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 🚀 DNS プリフェッチとプリロード最適化 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* 🚀 重要リソースのプリロード */}
        <link rel="preload" href="/ogp-image.png" as="image" type="image/png" />

        {/* 🚀 クリティカルCSSのインライン化ヒント */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* クリティカルCSS - ヘッダー部分のみ */
            .fixed { position: fixed !important; }
            .top-0 { top: 0px !important; }
            .left-0 { left: 0px !important; }
            .right-0 { right: 0px !important; }
            .z-50 { z-index: 50 !important; }
            .transition-all { transition-property: all !important; }
            .duration-75 { transition-duration: 75ms !important; }
          `,
          }}
        />

        {/* 🚀 Google Tag Manager - 最適化版 */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MZDHPBHT');
            `,
          }}
        />
      </head>
      <body
        className={notoSerifJP.className}
        style={{
          // 🚀 初期レンダリング最適化
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {/* GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZDHPBHT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <div
          className="flex flex-col min-h-screen bg-[#2b1e1c] text-[#f3f3f2]"
          style={{
            // 🚀 GPU層最適化
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          <Header />
          <main
            className="flex-grow pt-18"
            style={{
              // 🚀 メインコンテンツ最適化
              contain: "layout style",
              willChange: "contents",
            }}
          >
            {children}
          </main>
          <BackToTopButton />
          <Footer />
        </div>

        {/* 🚀 Toaster最適化 */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1a1a1a",
              color: "#f3f3f2",
              border: "1px solid #df7163",
            },
          }}
        />
      </body>
    </html>
  );
}
