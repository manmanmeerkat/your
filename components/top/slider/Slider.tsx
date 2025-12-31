"use client";
import { useEffect, useMemo, useState } from "react";
import { SLIDE_IMAGES } from "@/constants/constants";
import Image from "next/image";

export default function Slider() {
  const [current, setCurrent] = useState(0);

  // OS設定（動きを減らす）を尊重
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % SLIDE_IMAGES.length);
      }, 5000);
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="absolute inset-0">
      {SLIDE_IMAGES.map((img, i) => (
        <div
          key={i}
          className={[
            "absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity]",
            i === current ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <Image
            src={img.img}
            alt=""                 // 背景なので空でOK（読み上げ不要）
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            fill
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Overlayはここで1枚だけ（調整しやすい・暗くなりすぎ防止） */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}