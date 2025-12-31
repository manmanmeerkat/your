"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  priority = true,
  width = 800,
  height = 400,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // src が変わったら状態リセット + 保険タイマー
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsLoaded(true); // ← 最終保険
    }, 1200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  if (hasError) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center text-gray-500 flex items-center justify-center min-h-[200px]">
        <div>This image is taking a little rest.</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center z-10 min-h-[200px]">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}

      <Image
        key={src}
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        priority={priority}
        className={[
          "transition-opacity duration-500 max-w-full h-auto rounded-lg shadow-lg",
          isLoaded ? "opacity-100" : "opacity-0",
          className,
        ].join(" ")}
        onLoad={() => setIsLoaded(true)}
        onLoadingComplete={() => setIsLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}
