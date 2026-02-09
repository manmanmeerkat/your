// components/ui/optimizedImage/OptimizedImage.server.tsx
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
};

export function OptimizedImageServer({
  src,
  alt,
  className = "",
  priority = false,
  width = 400,
  height = 400,
  sizes = "(max-width: 768px) 100vw, 400px",
}: Props) {
  return (
    <div
      className={`relative w-full aspect-square overflow-hidden ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}