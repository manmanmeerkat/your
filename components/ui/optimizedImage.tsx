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
  className,
  priority = false,
  width = 800,
  height = 400,
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(true);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setShouldShowLoader(true);
    const timer = setTimeout(() => setShouldShowLoader(false), 100);
    return () => clearTimeout(timer);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setShouldShowLoader(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    setShouldShowLoader(false);
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
      {shouldShowLoader && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-lg flex items-center justify-center z-10 min-h-[200px]">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        className={`transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } max-w-full h-auto rounded-lg shadow-lg ${className || ""}`}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
