"use client";
import { useEffect, useMemo, useState } from "react";
import { SLIDE_IMAGES } from "@/constants/constants";
import Image from "next/image";

export default function Slider() {
  const [current, setCurrent] = useState(0);

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

    useEffect(() => {
      const next = (current + 1) % SLIDE_IMAGES.length;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "image";
      link.href = SLIDE_IMAGES[next].img;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }, [current]);

  return (
    <div className="absolute inset-0">
      {SLIDE_IMAGES.map((img, i) => {
        const isActive = i === current;
        const isFirst = i === 0;

        return (
          <div
            key={i}
            className={[
              "absolute inset-0",
              // ✅ 初回表示(1枚目)は LCP を遅らせない（アニメ無し）
              isFirst ? "" : "transition-opacity duration-1000 ease-in-out will-change-[opacity]",
              isActive ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <Image
              src={img.img}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
              fill
              sizes="100vw"
              // ✅ 1枚目だけ最優先
              priority={isFirst}
              fetchPriority={isFirst ? "high" : "auto"}
              // ✅ 2枚目以降は急いで読み込ませない（帯域節約）
              loading={isFirst ? "eager" : "lazy"}
            />
          </div>
        );
      })}

      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
