"use client";

import React from "react";

interface TriviaPlaceholderProps {
  index: number;
}

const kanjiNumbers = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
];

export const TriviaPlaceholder: React.FC<TriviaPlaceholderProps> = ({ index }) => {
  return (
    <div className="my-8 mx-auto max-w-4xl">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        <div className="relative p-6 sm:p-8">
          {/* 丸数字 */}
          <div className="absolute top-4 left-4">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 shadow-sm flex items-center justify-center">
              <span className="text-xs font-bold text-gray-300 tracking-wider font-serif">
                {kanjiNumbers[index] || (index + 1).toString()}
              </span>
            </div>
          </div>

          {/* 飾り引用とローディング */}
          <div className="mt-4 pr-12 relative">
            <div className="absolute -left-3 -top-1 text-3xl text-gray-600 leading-none select-none opacity-50 font-serif">
              「
            </div>

            <div className="relative z-10 pr-4">
              <h4 className="text-base font-semibold text-yellow-400 mb-3 font-serif">
                Trivia
              </h4>

              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>

            <div className="absolute -right-1 -bottom-3 text-3xl text-gray-600 leading-none select-none opacity-50 font-serif">
              」
            </div>
          </div>

          {/* 下部飾り */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-500" />
              <div className="w-8 h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600" />
              <div className="w-1 h-1 rounded-full bg-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
