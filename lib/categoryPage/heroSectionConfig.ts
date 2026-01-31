export type CategoryKey = "mythology" | "culture" | "festivals" | "customs";

export type HeroConfig = {
  imageSrc: string;
  imageAlt: string;

  title: string;
  tagline: string;
  paragraphs: string[];

  blurDataURL?: string;
};

export const HERO_CONFIG: Record<CategoryKey, HeroConfig> = {
  mythology: {
    imageSrc: "/images/category-top/mythology.webp",
    imageAlt: "Japanese Mythology",
    title: "Japanese Mythology",
    tagline: "Where gods, nature, and humanity share the same world.",
    paragraphs: [
      "Welcome to the world of Japanese mythology, where gods, nature, and humanity exist side by side.",
      "From the creation of the islands to the birth of the sun goddess and the emergence of Japan itself, these ancient stories have shaped the Japanese sense of beauty, fear, and reverence for the unseen.",
    ],
    blurDataURL: "data:image/jpeg;base64,/9j/...",
  },

  culture: {
    imageSrc: "/images/category-top/culture.webp",
    imageAlt: "Japanese Culture",
    title: "Japanese Culture",
    tagline: "Traditions shaped by belief, art, and everyday life.",
    paragraphs: [
      "Welcome to Japanese culture, where refined arts, seasonal customs, and daily life are woven into a quiet and enduring beauty.",
      "From ancient beliefs and artistic traditions to everyday life and modern expressions, Japanese culture reveals an enduring sense of harmony, meaning, and quiet elegance.",
    ],
    blurDataURL: "data:image/jpeg;base64,/9j/...",
  },

  festivals: {
    imageSrc: "/images/category-top/festival.webp",
    imageAlt: "Japanese Festivals",
    title: "Japanese Festivals",
    tagline: "Traditions of the seasons, community, and sacred celebration.",
    paragraphs: [
      "Welcome to Japanese festivals, where seasonal rhythms and local traditions bring communities together.",
      "From famous celebrations like Gion Matsuri to small shrine events, matsuri honor deities, mark the turning of the year, and express a shared sense of gratitude, joy, and continuity.",
    ],
    blurDataURL: "data:image/jpeg;base64,/9j/...",
  },

  customs: {
    imageSrc: "/images/category-top/custom.webp",
    imageAlt: "Japanese Customs",
    title: "Japanese Customs",
    tagline: "Manners and rituals shaped by respect and harmony.",
    paragraphs: [
      "Welcome to Japanese customs, where everyday gestures reflect care, respect, and social harmony.",
      "From bowing and gift-giving to seasonal etiquette and shared routines, these practices reveal how trust and warmth are built in everyday life.",
    ],
    blurDataURL: "data:image/jpeg;base64,/9j/...",
  },
};