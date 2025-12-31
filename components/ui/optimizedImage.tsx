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

  // src が変わったら状態リセット
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  if (hasError) {
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center text-gray-500 flex items-center justify-center min-h-[200px]">
        <div>Failed to load image.</div>
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
        onLoadingComplete={() => setIsLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}