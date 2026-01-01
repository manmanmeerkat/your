// app/layout.tsx - 修正版
import "./globals.css";
import "./styles/japanese-style-modern.css";
import "highlight.js/styles/github-dark.css";
import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import { Toaster } from "sonner";
import Header from "../components/layout/header/header";
import Footer from "../components/layout/footer";
import BackToTopButton from "@/components/backToTopBtn/BackToTopBtn";
import Script from "next/script";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Your Secret Japan — Stories, Culture, and Quiet Traditions",
  description:
    "Your Secret Japan is a quiet place to explore Japanese mythology, culture, customs, and seasonal traditions through stories, reflections, and timeless perspectives.",
  metadataBase: new URL("https://www.yoursecretjapan.com"),

  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  openGraph: {
    title: "Your Secret Japan — Stories, Culture, and Quiet Traditions",
    description:
      "A quiet place to explore Japanese mythology, culture, customs, and seasonal traditions through stories and timeless perspectives.",
    url: "https://www.yoursecretjapan.com",
    siteName: "Your Secret Japan",
    images: [
      {
        url: "/ogp-image.png",
        width: 1200,
        height: 630,
        alt: "Torii gate and Mount Fuji — Your Secret Japan",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Your Secret Japan — Stories, Culture, and Quiet Traditions",
    description:
      "Explore Japanese mythology, culture, customs, and seasonal traditions through stories and gentle reflections.",
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
        <Script id="gtm-init" strategy="afterInteractive">
          {`
         (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
         new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
         j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
         'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
         })(window,document,'script','dataLayer','GTM-MZDHPBHT');
       `}
        </Script>
      </head>
      <body className={notoSerifJP.className}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MZDHPBHT"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <div className="flex flex-col min-h-screen bg-[#2b1e1c] text-[#f3f3f2]">
          <Header />
          <main className="flex-grow pt-18">{children}</main>
          <BackToTopButton />
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
