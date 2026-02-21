"use client";

import { useMemo, useState } from "react";

type Props = {
  videoId: string;
  title?: string;
  className?: string;
  aspectRatio?: `${number}/${number}`;
};

function thumbUrl(videoId: string) {
  // まずは軽いhqでOK（必要ならmaxresにしてもいい）
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export default function LiteYouTube({
  videoId,
  title = "YouTube video",
  className,
  aspectRatio = "16/9",
}: Props) {
  const [active, setActive] = useState(false);

  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId]);

  if (active) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio,
          overflow: "hidden",
          borderRadius: 12,
        }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Play video: ${title}`}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio,
        borderRadius: 12,
        overflow: "hidden",
        border: "0",
        padding: 0,
        cursor: "pointer",
        background: "#000",
        display: "block",
      }}
    >
      <img
        src={thumbUrl(videoId)}
        alt={title}
        loading="lazy"
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.92,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 72,
          height: 72,
          borderRadius: 9999,
          background: "rgba(0,0,0,0.55)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          style={{
            width: 0,
            height: 0,
            borderLeft: "18px solid white",
            borderTop: "12px solid transparent",
            borderBottom: "12px solid transparent",
            marginLeft: 4,
          }}
        />
      </span>
    </button>
  );
}