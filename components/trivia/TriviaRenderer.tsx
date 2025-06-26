// // components/trivia/TriviaRenderer.tsx - 修正版
// "use client";
// import React from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";

// // 一口メモの型定義
// type ArticleTrivia = {
//   id: string;
//   title: string;
//   content: string;
//   contentEn?: string | null;
//   category: string;
//   tags: string[];
//   iconEmoji?: string | null;
//   colorTheme?: string | null;
//   displayOrder: number;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// };

// // マークダウンレンダリング用コンポーネント
// const TriviaMarkdown: React.FC<{ content: string }> = ({ content }) => {
//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm]}
//       rehypePlugins={[rehypeRaw]}
//       components={{
//         // 段落のスタイル
//         p: ({ children, ...props }) => (
//           <p
//             className="text-gray-200 leading-relaxed text-base font-normal mb-3 last:mb-0"
//             style={{
//               fontFamily:
//                 '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
//               letterSpacing: "0.025em",
//               lineHeight: "1.7",
//             }}
//             {...props}
//           >
//             {children}
//           </p>
//         ),

//         // 太字のスタイル
//         strong: ({ children, ...props }) => {
//           const text = Array.isArray(children)
//             ? children.join("")
//             : String(children || "");

//           // 日本語の重要キーワードは黄色でハイライト
//           if (/^(重要|ポイント|特に|注目)$/.test(text)) {
//             return (
//               <strong
//                 className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded"
//                 {...props}
//               >
//                 {children}
//               </strong>
//             );
//           }

//           return (
//             <strong className="text-white font-bold" {...props}>
//               {children}
//             </strong>
//           );
//         },

//         // 斜体のスタイル
//         em: ({ children, ...props }) => (
//           <em className="text-gray-300 italic" {...props}>
//             {children}
//           </em>
//         ),

//         // リンクのスタイル
//         a: ({ children, href, ...props }) => (
//           <a
//             href={href}
//             className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
//             target={href?.startsWith("http") ? "_blank" : undefined}
//             rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
//             {...props}
//           >
//             {children}
//           </a>
//         ),

//         // インラインコードのスタイル
//         code: ({ children, className, ...props }) => {
//           const match = /language-(\w+)/.exec(className || "");

//           if (!match) {
//             // インラインコード
//             return (
//               <code
//                 className="bg-gray-700 text-yellow-300 px-2 py-1 rounded text-sm font-mono"
//                 {...props}
//               >
//                 {children}
//               </code>
//             );
//           }

//           // コードブロック
//           return (
//             <code
//               className="block bg-gray-800 text-yellow-300 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre"
//               {...props}
//             >
//               {children}
//             </code>
//           );
//         },

//         // コードブロックのスタイル
//         pre: ({ children, ...props }) => (
//           <pre
//             className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-4 overflow-x-auto"
//             {...props}
//           >
//             {children}
//           </pre>
//         ),

//         // リストのスタイル
//         ul: ({ children, ...props }) => (
//           <ul
//             className="list-disc list-inside text-gray-200 space-y-1 my-3 pl-4"
//             {...props}
//           >
//             {children}
//           </ul>
//         ),

//         ol: ({ children, ...props }) => (
//           <ol
//             className="list-decimal list-inside text-gray-200 space-y-1 my-3 pl-4"
//             {...props}
//           >
//             {children}
//           </ol>
//         ),

//         li: ({ children, ...props }) => (
//           <li className="text-gray-200 leading-relaxed" {...props}>
//             {children}
//           </li>
//         ),

//         // 引用のスタイル
//         blockquote: ({ children, ...props }) => (
//           <blockquote
//             className="border-l-4 border-yellow-400 bg-gray-800/50 pl-4 py-2 my-4 italic text-gray-300"
//             {...props}
//           >
//             {children}
//           </blockquote>
//         ),

//         // 見出しのスタイル
//         h1: ({ children, ...props }) => (
//           <h1
//             className="text-xl font-bold text-yellow-400 mb-3 mt-4 first:mt-0"
//             {...props}
//           >
//             {children}
//           </h1>
//         ),

//         h2: ({ children, ...props }) => (
//           <h2
//             className="text-lg font-semibold text-yellow-300 mb-2 mt-3 first:mt-0"
//             {...props}
//           >
//             {children}
//           </h2>
//         ),

//         h3: ({ children, ...props }) => (
//           <h3
//             className="text-base font-semibold text-gray-200 mb-2 mt-3 first:mt-0"
//             {...props}
//           >
//             {children}
//           </h3>
//         ),

//         // 水平線
//         hr: ({ ...props }) => (
//           <hr className="border-gray-600 my-4" {...props} />
//         ),

//         // iframe（YouTube埋め込みなど）
//         iframe: ({
//           src,
//           width,
//           height,
//           title,
//           allow,
//           allowFullScreen,
//           frameBorder,
//           ...props
//         }) => (
//           <div className="my-6 flex justify-center">
//             <div className="relative w-full max-w-2xl">
//               <iframe
//                 src={src}
//                 width={width || "100%"}
//                 height={height || "315"}
//                 title={title || "Embedded content"}
//                 frameBorder={frameBorder || "0"}
//                 allow={
//                   allow ||
//                   "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 }
//                 allowFullScreen={allowFullScreen}
//                 className="w-full rounded-lg border border-gray-600 shadow-lg"
//                 style={{
//                   aspectRatio: "16/9",
//                   minHeight: "200px",
//                   maxHeight: "400px",
//                 }}
//                 {...props}
//               />
//             </div>
//           </div>
//         ),
//       }}
//     >
//       {content}
//     </ReactMarkdown>
//   );
// };

// // 単体の一口メモコンポーネント
// export const TriviaCard: React.FC<{ trivia: ArticleTrivia; index: number }> = ({
//   trivia,
//   index,
// }) => {
//   const kanjiNumbers = [
//     "一",
//     "二",
//     "三",
//     "四",
//     "五",
//     "六",
//     "七",
//     "八",
//     "九",
//     "十",
//   ];

//   return (
//     <div className="group relative my-8">
//       <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-[#eb9b6f] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
//         {/* 上部装飾ライン */}
//         {/* <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div> */}

//         {/* 四隅の角飾り */}
//         {/* <div className="absolute top-3 left-3 w-2 h-2 border-l border-t border-gray-600 opacity-50"></div>
//         <div className="absolute top-3 right-3 w-2 h-2 border-r border-t border-gray-600 opacity-50"></div>
//         <div className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-gray-600 opacity-50"></div>
//         <div className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-gray-600 opacity-50"></div> */}

//         {/* 内容 */}
//         <div className="relative p-8 sm:p-10">
//           {/* 番号 */}
//           <div className="absolute top-6 left-6">
//             <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 shadow-sm flex items-center justify-center">
//               <span
//                 className="text-sm font-bold text-gray-300 tracking-wider"
//                 style={{
//                   fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
//                 }}
//               >
//                 {kanjiNumbers[index] || index + 1}
//               </span>
//             </div>
//           </div>

//           {/* カスタムアイコン */}
//           {trivia.iconEmoji && (
//             <div className="absolute top-6 right-6">
//               <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
//                 <img
//                   src={trivia.iconEmoji}
//                   alt=""
//                   className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
//                   onError={(e) => {
//                     e.currentTarget.style.display = "none";
//                   }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* メインテキスト */}
//           <div className="mt-6 pr-16 relative">
//             <div
//               className="absolute -left-4 -top-2 text-4xl text-gray-600 leading-none select-none opacity-50"
//               style={{
//                 fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
//               }}
//             >
//               「
//             </div>

//             <div className="relative z-10 pr-6">
//               {/* タイトル */}
//               <div className="flex items-center justify-center gap-1 py-1 px-3 rounded-md bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 mb-3">
//                 <span className="text-gray-400 text-sm font-serif">※</span>
//                 <span
//                   className="text-sm font-medium text-gray-700 font-serif"
//                   style={{ letterSpacing: "0.1em" }}
//                 >
//                   Trivia
//                 </span>
//                 <span className="text-gray-400 text-sm font-serif">※</span>
//               </div>

//               {/* マークダウンレンダリング */}
//               <div className="trivia-markdown-content">
//                 <TriviaMarkdown content={trivia.contentEn || trivia.content} />
//               </div>
//             </div>

//             <div
//               className="absolute -right-2 -bottom-4 text-4xl text-gray-600 leading-none select-none opacity-50"
//               style={{
//                 fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
//               }}
//             >
//               」
//             </div>
//           </div>

//           {/* 下部飾り */}
//           {/* <div className="mt-8 flex justify-center">
//             <div className="flex items-center gap-2">
//               <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//               <div className="w-12 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"></div>
//               <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//             </div>
//           </div> */}
//         </div>

//         {/* 側面装飾 */}
//         <div className="absolute left-1 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-50"></div>
//         <div className="absolute right-1 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-30"></div>

//         {/* ホバー光沢 */}
//         <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
//       </div>

//       {/* カード外側の飾り */}
//       {/* <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
//       <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div> */}
//     </div>
//   );
// };

// // 一口メモ処理ユーティリティ（クライアントサイド用）
// export const processTriviaContent = (
//   content: string,
//   triviaList?: ArticleTrivia[]
// ): string => {
//   if (!triviaList || triviaList.length === 0) return content;

//   return content.replace(/:::trivia\[([^\]]+)\]/g, (match, identifier) => {
//     let trivia: ArticleTrivia | undefined;
//     let index = 0;

//     if (isNaN(Number(identifier))) {
//       // ID検索
//       trivia = triviaList.find((t) => t.id === identifier);
//       index = triviaList.findIndex((t) => t.id === identifier);
//     } else {
//       // インデックス検索
//       const triviaIndex = parseInt(identifier, 10);
//       trivia = triviaList[triviaIndex];
//       index = triviaIndex;
//     }

//     if (!trivia) {
//       return `\n\n**[一口メモ "${identifier}" が見つかりません]**\n\n`;
//     }

//     // Reactコンポーネントとして表示するためのマーカー
//     return `\n\n<div class="trivia-placeholder" data-trivia-id="${trivia.id}" data-trivia-index="${index}"></div>\n\n`;
//   });
// };

// // クライアントサイドでの一口メモレンダリング
// export const renderTriviaCards = (triviaList?: ArticleTrivia[]) => {
//   if (typeof window === "undefined" || !triviaList) return;

//   // React 18のcreateRootを使用
//   import("react-dom/client")
//     .then((ReactDOMClient) => {
//       const placeholders = document.querySelectorAll(".trivia-placeholder");

//       placeholders.forEach((placeholder) => {
//         const triviaId = placeholder.getAttribute("data-trivia-id");
//         const triviaIndex = parseInt(
//           placeholder.getAttribute("data-trivia-index") || "0"
//         );

//         const trivia = triviaList.find((t) => t.id === triviaId);
//         if (trivia) {
//           const root = ReactDOMClient.createRoot(placeholder);
//           root.render(
//             React.createElement(TriviaCard, { trivia, index: triviaIndex })
//           );
//         }
//       });
//     })
//     .catch((error) => {
//       console.warn("Failed to render trivia cards:", error);
//     });
// };

// // メインの一口メモセクションコンポーネント
// const TriviaSection: React.FC<{ triviaList: ArticleTrivia[] }> = ({
//   triviaList,
// }) => {
//   if (!triviaList || triviaList.length === 0) return null;

//   return (
//     <div className="trivia-section my-16 bg-black text-gray-100 px-4 sm:px-8">
//       {/* セクションヘッダー */}
//       {/* <div className="text-center mb-12">
//         <div className="flex items-center justify-center gap-6">
//           <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
//           <div className="relative">
//             <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-600 to-gray-400 shadow-sm"></div>
//             <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full border border-gray-600 opacity-40"></div>
//           </div>
//           <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
//         </div>
//       </div> */}

//       {/* 一口メモカード表示 */}
//       <div className="space-y-10">
//         {triviaList
//           .filter((trivia) => trivia.isActive)
//           .sort((a, b) => a.displayOrder - b.displayOrder)
//           .map((trivia, index) => (
//             <TriviaCard key={trivia.id} trivia={trivia} index={index} />
//           ))}
//       </div>

//       {/* セクション終了装飾 */}
//       {/* <div className="text-center mt-12">
//         <div className="flex items-center justify-center gap-4">
//           <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
//           <div className="flex gap-1">
//             <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//             <div className="w-1 h-1 rounded-full bg-gray-600"></div>
//             <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//           </div>
//           <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default TriviaSection;
