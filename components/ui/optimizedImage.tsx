"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
};

export function OptimizedImage({
  src,
  alt,
  className = "",
  priority = false,
  width = 800,
  height = 400,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const ratio = width / height;

  if (hasError) {
    return (
      <div
        className="rounded-lg shadow-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500"
        style={{ aspectRatio: String(ratio) }}
      >
        <div className="text-center space-y-2 p-6">
          <div className="text-sm italic">This image is taking a little rest.</div>
          <div className="text-xs text-gray-400">Please check back in a moment.</div>
        </div>
      </div>
    );
  }

  // ✅ LCP候補（priority）は即表示。遅延もフェードも無し。
  const shouldFade = !priority;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-lg ${className}`}
      style={{ aspectRatio: String(ratio) }}
    >
      {/* ✅ priority のときはスケルトンも出さない（LCPを邪魔しない） */}
      {!priority && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="text-gray-400 text-xs">Loading…</div>
        </div>
      )}

      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 900px"
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        className={[
          "object-cover",
          shouldFade ? "transition-opacity duration-200" : "",
          shouldFade ? (isLoaded ? "opacity-100" : "opacity-0") : "opacity-100",
        ].join(" ")}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}
