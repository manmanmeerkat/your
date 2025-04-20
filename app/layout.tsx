import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import BackToTopButton from "@/components/backToTopBtn/BackToTopBtn";

const inter = Inter({ subsets: ["latin"] });

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
  themeColor: "#020617",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-slate-950">
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
