// lib/cachePolicy.ts
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
export const IS_NON_PROD = IS_DEV || IS_PREVIEW;

/**
 * Page-level (App Router) cache controls
 */
export const PAGE_DYNAMIC: "force-dynamic" | "force-static" =
  IS_NON_PROD ? "force-dynamic" : "force-static";

export const PAGE_REVALIDATE: 0 | false =
  IS_NON_PROD ? 0 : false;

export const PAGE_FETCH_CACHE: "force-no-store" | "auto" =
  IS_NON_PROD ? "force-no-store" : "auto";

/**
 * fetch() init presets
 */
export const FETCH_CACHE = {
  pageData: IS_NON_PROD
    ? ({ cache: "no-store" } as const)
    : ({ cache: "force-cache" } as const),
};

/**
 * Optional TTL presets
 */
export const TTL = {
  oneHour: 60 * 60,
  oneDay: 60 * 60 * 24,
};