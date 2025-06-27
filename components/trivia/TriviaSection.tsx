// "use client";

// import React from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw"; // HTMLタグ処理用

// // 型定義
// interface ArticleTrivia {
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
// }

// interface TriviaSectionProps {
//   triviaList: ArticleTrivia[];
// }

// const kanjiNumbers = [
//   "一",
//   "二",
//   "三",
//   "四",
//   "五",
//   "六",
//   "七",
//   "八",
//   "九",
//   "十",
// ];

// // 一口メモ用のマークダウンコンポーネント設定
// const TriviaMarkdown: React.FC<{ content: string }> = ({ content }) => {
//   return (
//     <ReactMarkdown
//       remarkPlugins={[remarkGfm]}
//       rehypePlugins={[rehypeRaw]} // HTMLタグを処理
//       components={{
//         // 段落のスタイル
//         p: (props) => (
//           <p
//             className="text-gray-200 leading-relaxed text-base sm:text-lg font-normal mb-3 last:mb-0"
//             style={{
//               fontFamily:
//                 '"Inter", "Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
//               letterSpacing: "0.025em",
//               lineHeight: "1.8",
//             }}
//           >
//             {props.children}
//           </p>
//         ),

//         // 太字のスタイル
//         strong: (props) => {
//           const text = Array.isArray(props.children)
//             ? props.children.join("")
//             : String(props.children || "");

//           // 日本語の重要キーワードは黄色でハイライト
//           if (/^(重要|ポイント|特に|注目)$/.test(text)) {
//             return (
//               <strong className="text-yellow-400 font-bold bg-yellow-400/10 px-1 rounded">
//                 {props.children}
//               </strong>
//             );
//           }

//           // 通常の太字は白色でボールド
//           return (
//             <strong className="text-white font-bold">{props.children}</strong>
//           );
//         },

//         // 斜体のスタイル
//         em: (props) => (
//           <em className="text-gray-300 italic">{props.children}</em>
//         ),

//         // リンクのスタイル
//         a: (props) => (
//           <a
//             href={props.href}
//             className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
//             target={props.href?.startsWith("http") ? "_blank" : undefined}
//             rel={
//               props.href?.startsWith("http") ? "noopener noreferrer" : undefined
//             }
//           >
//             {props.children}
//           </a>
//         ),

//         // インラインコードのスタイル
//         code: (props) => {
//           const { inline } = props as { inline?: boolean };
//           if (inline) {
//             return (
//               <code className="bg-gray-700 text-yellow-300 px-2 py-1 rounded text-sm font-mono">
//                 {props.children}
//               </code>
//             );
//           }
//           return (
//             <code className="block bg-gray-800 text-yellow-300 p-3 rounded text-sm font-mono overflow-x-auto">
//               {props.children}
//             </code>
//           );
//         },

//         // コードブロックのスタイル
//         pre: (props) => (
//           <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-4 overflow-x-auto">
//             {props.children}
//           </pre>
//         ),

//         // リストのスタイル
//         ul: (props) => (
//           <ul className="list-disc list-inside text-gray-200 space-y-1 my-3">
//             {props.children}
//           </ul>
//         ),

//         ol: (props) => (
//           <ol className="list-decimal list-inside text-gray-200 space-y-1 my-3">
//             {props.children}
//           </ol>
//         ),

//         li: (props) => (
//           <li className="text-gray-200 leading-relaxed">{props.children}</li>
//         ),

//         // 引用のスタイル
//         blockquote: (props) => (
//           <blockquote className="border-l-4 border-yellow-400 bg-gray-800/50 pl-4 py-2 my-4 italic text-gray-300">
//             {props.children}
//           </blockquote>
//         ),

//         // 見出しのスタイル（一口メモ内では小さめに）
//         h1: (props) => (
//           <h1 className="text-xl font-bold text-yellow-400 mb-3 mt-4 first:mt-0">
//             {props.children}
//           </h1>
//         ),

//         h2: (props) => (
//           <h2 className="text-lg font-semibold text-yellow-300 mb-2 mt-3 first:mt-0">
//             {props.children}
//           </h2>
//         ),

//         h3: (props) => (
//           <h3 className="text-base font-semibold text-gray-200 mb-2 mt-3 first:mt-0">
//             {props.children}
//           </h3>
//         ),

//         // 水平線
//         hr: () => <hr className="border-gray-600 my-4" />,

//         // 🆕 iframeの専用処理（YouTube埋め込みなど）
//         iframe: (props) => (
//           <div className="my-6 flex justify-center">
//             <div className="relative w-full max-w-2xl">
//               <iframe
//                 src={props.src}
//                 width={props.width || "100%"}
//                 height={props.height || "315"}
//                 title={props.title || "Embedded content"}
//                 frameBorder={props.frameBorder || "0"}
//                 allow={
//                   props.allow ||
//                   "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 }
//                 allowFullScreen={props.allowFullScreen}
//                 className="w-full rounded-lg border border-gray-600 shadow-lg"
//                 style={{
//                   aspectRatio: "16/9",
//                   minHeight: "200px",
//                   maxHeight: "400px",
//                 }}
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

// const TriviaSection: React.FC<TriviaSectionProps> = ({ triviaList }) => {
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

//       {/* 和風トリビア表示 */}
//       <div className="space-y-10">
//         {triviaList.map((trivia, index) => (
//           <div key={trivia.id} className="group relative">
//             <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-[#eb9b6f] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
//               {/* 上部装飾ライン */}
//               {/* <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div> */}

//               {/* 四隅の角飾り */}
//               {/* <div className="absolute top-3 left-3 w-2 h-2 border-l border-t border-gray-600 opacity-50"></div>
//               <div className="absolute top-3 right-3 w-2 h-2 border-r border-t border-gray-600 opacity-50"></div>
//               <div className="absolute bottom-3 left-3 w-2 h-2 border-l border-b border-gray-600 opacity-50"></div>
//               <div className="absolute bottom-3 right-3 w-2 h-2 border-r border-b border-gray-600 opacity-50"></div> */}

//               {/* 内容 */}
//               <div className="relative p-8 sm:p-10">
//                 {/* 番号 */}
//                 <div className="absolute top-6 left-6">
//                   <div className="w-10 h-10 rounded-full bg-gray-800 border  shadow-sm flex items-center justify-center">
//                     <span
//                       className="text-sm font-bold text-gray-300 tracking-wider"
//                       style={{
//                         fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
//                       }}
//                     >
//                       {kanjiNumbers[index] || index + 1}
//                     </span>
//                   </div>
//                 </div>

//                 {/* カスタムアイコン */}
//                 {trivia.iconEmoji && (
//                   <div className="absolute top-6 right-6">
//                     <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 p-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
//                       <img
//                         src={trivia.iconEmoji}
//                         alt=""
//                         className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
//                         onError={(e) => {
//                           e.currentTarget.style.display = "none";
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* メインテキスト */}
//                 <div className="mt-6 pr-16 relative">
//                   <div
//                     className="absolute -left-4 -top-2 text-4xl text-gray-600 leading-none select-none opacity-50"
//                     style={{
//                       fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
//                     }}
//                   >
//                     「
//                   </div>

//                   <div className="relative z-10 pr-6">
//                     {/* タイトルを小見出し風に */}
//                     <div className="flex items-center justify-center gap-1 py-1 px-3 rounded-md bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200 mb-3">
//                       <span className="text-gray-400 text-sm font-serif">
//                         ※
//                       </span>
//                       <span
//                         className="text-sm font-medium text-gray-700 font-serif"
//                         style={{ letterSpacing: "0.1em" }}
//                       >
//                         Trivia
//                       </span>
//                       <span className="text-gray-400 text-sm font-serif">
//                         ※
//                       </span>
//                     </div>

//                     {/* マークダウンレンダリング */}
//                     <div className="trivia-markdown-content">
//                       <TriviaMarkdown
//                         content={trivia.contentEn || trivia.content}
//                       />
//                     </div>
//                   </div>

//                   <div
//                     className="absolute -right-2 -bottom-4 text-4xl text-gray-600 leading-none select-none opacity-50"
//                     style={{
//                       fontFamily: '"Noto Serif JP", "Yu Mincho", serif',
//                     }}
//                   >
//                     」
//                   </div>
//                 </div>

//                 {/* 下部飾り */}
//                 <div className="mt-8 flex justify-center">
//                   <div className="flex items-center gap-2">
//                     <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//                     <div className="w-12 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600"></div>
//                     <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* 側面装飾 */}
//               <div className="absolute left-1 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-50"></div>
//               <div className="absolute right-1 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent opacity-30"></div>

//               {/* ホバー光沢 */}
//               <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
//             </div>

//             {/* カード外側の飾り */}
//             <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
//             <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
//           </div>
//         ))}
//       </div>

//       {/* セクション終了装飾 */}
//       <div className="text-center mt-12">
//         <div className="flex items-center justify-center gap-4">
//           <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
//           <div className="flex gap-1">
//             <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//             <div className="w-1 h-1 rounded-full bg-gray-600"></div>
//             <div className="w-1 h-1 rounded-full bg-gray-500"></div>
//           </div>
//           <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TriviaSection;
