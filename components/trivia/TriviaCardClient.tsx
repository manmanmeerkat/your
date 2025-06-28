"use client";

import dynamic from "next/dynamic";

// TriviaCard は use client コンポーネント
export const TriviaCardClient = dynamic(() => import("./TriviaCard"), {
  ssr: false,
});