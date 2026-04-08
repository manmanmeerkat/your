"use client";

import React from "react";
import type { TocItem } from "@/app/utils/toc";

type Props = {
  items: TocItem[];
  activeId: string;
};

export function TableOfContents({ items, activeId }: Props) {
  const initialVisibleItems = 5;
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const shouldShowViewMore = items.length > initialVisibleItems;
  const visible = expanded ? items : items.slice(0, initialVisibleItems);

  return (
    <section
      aria-label="Table of contents"
      className="mx-6 mb-8 rounded-xl border border-white/10 bg-white/[0.03]"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="
          flex w-full items-center justify-between
          px-4 py-3 text-left
          text-[0.95rem] font-medium tracking-[0.08em]
          text-[#f5ede3]
          transition-colors duration-200
          hover:bg-white/[0.04]
        "
      >
        <span>Contents</span>
        <span
          className={`
            transition-transform duration-200 hover:bg-white/5
            ${open ? "rotate-90" : ""}
          `}
        >
          ›
        </span>
      </button>

      {open && (
        <nav className="flex flex-col gap-1 px-3 pb-3">
          {visible.map((item) => {
            const isActive = activeId === item.id;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  window.setTimeout(() => {
                    history.replaceState(
                      null,
                      "",
                      window.location.pathname + window.location.search
                    );
                  }, 50);
                }}
                className={[
                  "block rounded-lg transition-colors duration-200",
                  item.level === 1 ? "px-3 py-2 text-[0.95rem] font-medium" : "px-6 py-2 text-[0.9rem]",
                  isActive
                    ? "bg-white/8 text-[#e9c58a]"
                    : "text-white/80 hover:bg-white/5 hover:text-[#e9c58a]",
                ].join(" ")}
              >
                {item.text}
              </a>
            );
          })}

          {shouldShowViewMore && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              type="button"
              className="
                mt-2 rounded-lg px-3 py-2
                text-[0.88rem] text-white/70
                transition-colors duration-200
                hover:bg-white/5 hover:text-white
              "
            >
              {expanded ? "Show less" : "Show all"}
            </button>
          )}
        </nav>
      )}
    </section>
  );
}