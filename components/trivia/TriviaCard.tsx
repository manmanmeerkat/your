// "use client";

// import React from "react";
// import { TriviaMarkdown } from "./TriviaMarkdown";
// import type { DisplayTrivia } from "./ContentWithTrivia";

// interface TriviaCardProps {
//   trivia: DisplayTrivia;
//   index: number;
// }

// const TriviaCard: React.FC<TriviaCardProps> = ({ trivia }) => {
//   const displayContent = trivia.contentEn || trivia.content;

//   return (
//     <div className="my-2 mx-auto max-w-4xl flex justify-center">
//       <div className="relative bg-gradient-to-br from-[#000b00] via-[#302833] to-[#000b00] border border-[#a59aca] rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group w-full max-w-2xl">
//         {/* 四隅の角飾り */}
//         <div className="absolute top-3 left-3 w-2 h-2 border-l border-t border-[#f1bf99] rounded-sm opacity-70" />
//         <div className="absolute top-3 right-3 w-2 h-2 border-r border-t border-[#f1bf99] rounded-sm opacity-70" />
//         <div className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-[#f1bf99] rounded-sm opacity-70" />
//         <div className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-[#f1bf99] rounded-sm opacity-70" />

//         <div className="relative py-2 pb-8 text-center">
//           {/* タイトル */}
//           <div className="relative z-10 text-center">
//             <h4 className="flex items-center justify-center gap-1 py-2 px-10 bg-[#302833] mx-auto w-fit border-l-4 border-[#a59aca]">
//               <span className="text-2xl font-bold text-[#f3f3f2] font-serif tracking-widest">
//                 Trivia
//               </span>
//             </h4>
//           </div>

//           {/* Markdown コンテンツ */}
//           <div className="trivia-markdown-content text-center py-6 mt-4 pb-2 px-8">
//             <TriviaMarkdown content={displayContent} />
//           </div>

//           {/* 補足（日本語版の表示） */}
//           {trivia.contentEn && trivia.content !== trivia.contentEn && (
//             <details className="mt-3 border-t border-gray-600 pt-3 text-center">
//               <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
//                 日本語版を表示
//               </summary>
//               <div className="mt-2 text-xs text-gray-400 border-l-2 border-gray-600 pl-3 text-center">
//                 <TriviaMarkdown content={trivia.content} />
//               </div>
//             </details>
//           )}

//           {/* タグ表示 */}
//           {trivia.tags && trivia.tags.length > 0 && (
//             <div className="mt-4 flex flex-wrap gap-1 justify-center">
//               {trivia.tags.slice(0, 3).map((tag, tagIndex) => (
//                 <span
//                   key={tagIndex}
//                   className="text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full border border-gray-600"
//                 >
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TriviaCard;

"use client";

import React from "react";
import { TriviaMarkdown } from "./TriviaMarkdown";
import type { DisplayTrivia } from "./ContentWithTrivia";

interface TriviaCardProps {
  trivia: DisplayTrivia;
  index: number;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ trivia }) => {
  const displayContent = trivia.contentEn || trivia.content;

  return (
    <section className="my-8 mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div
        className={[
          "relative overflow-hidden rounded-2xl",
          // 目立つ枠（少し太く・暖色）
          "border-2 border-[#c96a5d]/35",
          // 温かい紙っぽいグラデ（黒〜茶〜琥珀）
          "bg-gradient-to-br from-[#2a1f1a] via-[#1a1411] to-[#120d0b]",
          // 影は“ふわっ”と（硬すぎない）
          "shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
        ].join(" ")}
      >
        {/* ふわっとした暖かい光（休憩感） */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#e9c58a]/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-64 w-64 rounded-full bg-[#c96a5d]/10 blur-3xl" />

        {/* 上の飾り線：他の見出しと同じ“存在感” */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e9c58a]/55 to-transparent" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="mx-auto w-fit">
            {/* “札”っぽいラベル（ピルより温かい） */}
            <div
              className={[
                "inline-flex items-center gap-2",
                "rounded-md px-4 py-2",
                "bg-[#2b221e]/70",
                "border border-[#e9c58a]/35",
                "shadow-[0_8px_20px_rgba(0,0,0,0.35)]",
              ].join(" ")}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#e9c58a]/80" aria-hidden="true" />
                <span className="text-base font-semibold text-[#f5ede3] tracking-[0.18em] uppercase">
                  Trivia
                </span>
            </div>
          </div>

          {/* 小休憩の説明を“少しだけ”大きくして温かく */}
          <p className="mt-3 text-center text-sm text-white/70">
            A small break — a little side note
          </p>
        </div>

        {/* Body */}
        <div className="relative px-6 pb-6">
          {/* “紙面”ブロック：黒すぎない・読みやすい */}
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-5">
            <TriviaMarkdown content={displayContent} />
          </div>

          {/* 日本語版 */}
          {trivia.contentEn && trivia.content !== trivia.contentEn && (
            <details className="mt-5 rounded-xl border border-[#e9c58a]/20 bg-[#2b221e]/40 px-5 py-4">
              <summary className="cursor-pointer select-none text-sm text-white/70 hover:text-white/85">
                Show Japanese version
              </summary>
              <div className="mt-3 border-l-2 border-[#e9c58a]/25 pl-4">
                <TriviaMarkdown content={trivia.content} />
              </div>
            </details>
          )}

          {/* Tags：灰色→暖色寄り */}
          {trivia.tags && trivia.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2 justify-center">
              {trivia.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[12px] tracking-[0.06em] text-[#f5ede3]/80
                             bg-[#2b221e]/60 border border-[#c96a5d]/25
                             rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 下の飾り線 */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#c96a5d]/45 to-transparent" />
      </div>
    </section>
  );
};


export default TriviaCard;
