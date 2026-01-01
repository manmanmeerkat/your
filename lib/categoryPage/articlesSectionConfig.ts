import type { CategoryKey } from "./heroSectionConfig"; // すでにCategoryKeyを持ってるならそれをimport

export type ArticlesCopy = {
  sectionId: string;          // scroll target id
  sectionTitle: string;       // SectionTitle
  descriptionLines: string[]; // 2行でも3行でもOK
  emptyText: string;          // 記事0件時
  loadingText: string;        // skeleton時の文言
  basePath: string;           // pagination base
};

export const ARTICLES_COPY: Record<CategoryKey, ArticlesCopy> = {
  mythology: {
    sectionId: "mythology-stories",
    sectionTitle: "Japanese mythological stories",
    descriptionLines: [
      "Legends of gods, heroes, and sacred places.",
      "Would you like to explore Japan’s myths, legends, and timeless stories?",
    ],
    emptyText: "Articles will be added here soon.",
    loadingText: "Loading stories…",
    basePath: "/mythology",
  },
  culture: {
    sectionId: "culture-articles",
    sectionTitle: "The charm of Japanese culture",
    descriptionLines: [
        "Traditions of belief, craft, and everyday beauty.",
        "Would you like to explore the cultural practices that shape Japan today?"
    ],
    emptyText: "Articles will be added here soon.",
    loadingText: "Loading articles…",
    basePath: "/culture",
  },
  festivals: {
    sectionId: "festivals-articles",
    sectionTitle: "Festivals around Japan",
    descriptionLines: [
        "Seasonal celebrations, shrine traditions, and local pride.",
        "Would you like to discover the origins and traditions of matsuri,",
        "and experience their spirit of celebration as if you were there?",
    ],
    emptyText: "Articles will be added here soon.",
    loadingText: "Loading articles…",
    basePath: "/festivals",
  },
  customs: {
    sectionId: "customs-articles",
    sectionTitle: "Discover Japanese customs",
    descriptionLines: [
        "Manners, seasonal etiquette, and everyday rituals.",
        "Would you like to explore how these traditions continue in daily life today?",
    ],
    emptyText: "Articles will be added here soon.",
    loadingText: "Loading articles…",
    basePath: "/customs",
  },
};
