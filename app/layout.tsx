import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import BackToTopButton from "@/components/backToTopBtn/BackToTopBtn";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your Secret Japan - 日本の文化・神話・伝統",
  description: "日本の文化、風習、神話、伝統をわかりやすく紹介するサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-18 bg-slate-950">{children}</main>
          <BackToTopButton/>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
