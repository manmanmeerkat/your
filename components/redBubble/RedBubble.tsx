"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Redbubble() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.redbubble.com/assets/external_portfolio.js";
    script.type = "text/javascript";
    script.async = true;

    script.onload = () => {
      // 画面幅に応じて列数を設定
      const isMobile = window.innerWidth < 640;
      const columns = isMobile ? 2 : 5;

      setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          (window as any).RBExternalPortfolio &&
          document.getElementById("rb-xzfcxvzx")
        ) {
          try {
            new (window as any).RBExternalPortfolio(
              "www.redbubble.com",
              "manmanmeerkat",
              2, // 表示アイテム数（お好みで）
              columns
            ).renderIframe();
          } catch (err) {
            console.error("Render failed:", err);
          }
        }
      }, 100);

      setTimeout(() => {
        const iframe = document.querySelector("#rb-xzfcxvzx iframe") as HTMLIFrameElement;
        if (iframe) {
          iframe.style.margin = "0 auto";
          iframe.style.display = "block";
          iframe.style.maxWidth = "100%";
          iframe.style.width = "930px";
        }
      }, 300);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="py-16 bg-slate-950">
        <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Our Redbubble Products</h2>
            <p className="text-center text-lg mb-8 max-w-2xl mx-auto text-white">
            Discover unique items inspired by the beauty and spirit of Japan—from ancient traditions to everyday wonders. <br />
            Bring a little piece of Japan into your life.
            </p>
            <div className="flex justify-center overflow-x-auto">
            <div id="rb-xzfcxvzx" className="inline-block" />
            </div>
        </div>
        <div className="mt-12">
            <div className="max-w-xs sm:max-w-md mx-auto px-4 text-center">
                <Link
                href="https://www.redbubble.com/people/manmanmeerkat/shop?asc=u"
                passHref
                >
                <Button
                    size="lg"
                    className="
                    font-normal
                    border border-rose-700 bg-rose-700 text-white
                    hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                    shadow hover:shadow-lg
                    whitespace-normal sm:whitespace-nowrap
                    w-full
                    "
                >
                    Explore the full collection on Redbubble ≫
                </Button>
                </Link>
            </div>
        </div>
    </div>
  );
}