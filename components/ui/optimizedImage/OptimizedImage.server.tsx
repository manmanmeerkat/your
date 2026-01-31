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
  width = 800,
  height = 400,
  sizes = "(max-width: 768px) 100vw, 900px",
}: Props) {
  const ratio = width / height;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-lg ${className}`}
      style={{ aspectRatio: String(ratio) }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        className="object-cover"
      />
    </div>
  );
}
