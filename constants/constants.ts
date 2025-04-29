import type { linksType } from "@/types/types";
import type { slideImgType } from "@/types/types";
import type { categoryItemType } from "@/types/types";
import type { categoryImgType } from "@/types/types";
import type { seasonFestivalsType } from "@/types/types";
import type { threeFestivalsType } from "@/types/types";
import type { wayOfLifeType } from "@/types/types";
import type { SNSLinkType } from "@/types/types";
import type { categoriesType } from "@/types/types";

export const NAVI_LINKS: linksType[] = [
    { href: '/mythology', label: 'Mythology' },
    { href: '/culture', label: 'Culture' },
    { href: '/festivals', label: 'Festivals' },
    { href: '/customs', label: 'Customs' },
    { href: '/about', label: 'About' }
];

export const CATEGORY_LINKS: linksType[] = [
    { href: '/mythology', label: 'Mythology' },
    { href: '/culture', label: 'Culture' },
    { href: '/festivals', label: 'Festivals' },
    { href: '/customs', label: 'Customs' }
];

export const INFO_LINKS: linksType[] = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/contact', label: 'Contact Us' } 
];

export const SNS_LINKS: SNSLinkType[] = [
  { img: "/images/icon/redbubble.png", label: "REDBUBBLE", href: "https://www.redbubble.com/people/manmanmeerkat/shop?asc=u" },
  { img: "/images/icon/pinterest.png", label: "Pinterest", href: "https://jp.pinterest.com/enokidesign/" },
  // { img: "/images/icon/x-black.png", label: "X", href: "https://x.com/youraccount" },
  // { img: "/images/icon/x-white.png", label: "X", href: "https://x.com/youraccount" },
];

export const SLIDE_IMAGES: slideImgType[] = [
    { img: "/images/slide/mythology.jpg"},
    { img: "/images/slide/fuji.jpg"},
    { img: "/images/slide/kimono.jpg"},
    { img: "/images/slide/ninja.jpg"},
    { img: "/images/slide/carp.jpg"}
];

export const CATEGORY_ITEMS: categoryItemType[] = [
  {
      href: "/mythology",
      title: "Japanese Mythology",
      img: "/images/category-img/mythology.jpg",
      description: "Stories and gods from Japanese mythology, such as Amaterasu Omikami, Susanoo, and Yamata no Orochi.",
  },
  {
    href: "/culture",
    title: "Japanese Culture",
    img: "/images/category-img/culture.jpg",
    description: "Unique Japanese culture and its background, such as tea ceremony, flower arranging, and kimono.",
  },
  {
      href: "/festivals",
      title: "Japanese Festivals",
      img: "/images/category-img/festival.jpg",
      description: "Traditional festivals across the country, such as the Gion Festival and the Nebuta Festival, and their origins.",
    },
  {
    href: "/customs",
    title: "Japanese Customs",
    img: "/images/category-img/custom.jpg",
    description: "Simple customs and everyday manners in Japan, like bowing, removing shoes, and saying “itadakimasu.”",
  }
];

export const JAPANESE_GODS: categoryImgType[] = [
    {
      name: "Izanagi no Mikoto",
      img: "/images/gods/izanagi.png",
    },
    {
      name: "Izanami no Mikoto",
      img: "/images/gods/izanami.png",
    },
    {
      name: "Susanoo no Mikoto",
      img: "/images/gods/susanoo.png",
    },
    {
      name: "Amaterasu Oomikami",
      img: "/images/gods/amaterasu.png",
    },
    {
      name: "Tsukuyomi no Mikoto",
      img: "/images/gods/tsukuyomi.png",
    },
    {
      name: "Okuninushi no Mikoto",
      img: "/images/gods/okuninushi.png",
    },
    {
      name: "Iwanaga-hime",
      img: "/images/gods/iwanaga.png",
    },
    {
      name: "Konohanasakuya-hime",
      img: "/images/gods/konohana.png",
    },
    {
      name: "Ninigi no Mikoto",
      img: "/images/gods/ninigi.png",
    },
  ];
  
  export const CULTURE_CATEGORIES: categoryImgType[] = [
  {
    name: "Tea Ceremony",
    img: "/images/culture/Tea-Ceremony.png",
  },
  {
    name: "Flower Arrangement",
    img: "/images/culture/Flower-Arrangement.png",
  },
  {
    name: "Calligraphy",
    img: "/images/culture/Calligraphy.png",
  },
  {
    name: "Traditional Arts",
    img: "/images/culture/Traditional-Arts.png",
  },
  {
    name: "Ceramic Art",
    img: "/images/culture/Ceramic-Art.png",
  },
  {
    name: "Japanese Food",
    img: "/images/culture/Japanese-Food.png",
  },
];

export const SEASONAL_FESTIVALS: seasonFestivalsType[] = [
  {
    season: "Spring",
    label: "Spring Festivals",
    example1: "Sakura Festival",
    example2: "Aoi Festival",
    img: "/images/season/spring.png",
  },
  {
    season: "Summer",
    label: "Summer Festivals",
    example1: "Gion Festival",
    example2: "Fireworks Festival",
    img: "/images/season/summer.png",
  },
  {
    season: "Autumn",
    label: "Autumn Festivals",
    example1: "Jidai Festival",
    example2: "Harvest Festival",
    img: "/images/season/autumn.png",
  },
  {
    season: "Winter",
    label: "Winter Festivals",
    example1: "Sapporo Snow Festival",
    example2: "Namahage Sedo Festival",
    img: "/images/season/winter.png",
  },
];

export const THREE_BIG_FESTIVALS: threeFestivalsType[] = [
  {
    title: "Gion Festival (Kyoto)",
    img: "/images/three-festivals/gion.jpg",
    alt: "Gion Festival",
    text:
      "The Gion Festival is held every July in Kyoto. With a history of over 1,000 years, it features spectacular “Yamaboko” floats that parade through the city streets. During the month-long celebration, visitors can also enjoy traditional music, street food, and vibrant nighttime festivities.",
  },
  {
    title: "Tenjin Festival (Osaka)",
    img: "/images/three-festivals/tenjin.jpg",
    alt: "Tenjin Festival",
    text:
      "The Tenjin Festival in Osaka, held every July, is a vibrant celebration featuring parades, river boats, and fireworks. One of its highlights is the “Funatogyo,” a river procession with portable shrines, followed by a spectacular fireworks display.",
  },
  {
    title: "Kanda Festival (Tokyo)",
    img: "/images/three-festivals/kanda.jpg",
    alt: "Kanda Festival",
    text:
      "The Kanda Festival, held in mid-May during odd-numbered years in Tokyo, traces its roots back to the Edo period. More than 100 portable shrines (mikoshi) parade through the streets of central Tokyo in celebration of prosperity and good fortune.",
  },
];

export const WAY_OF_LIFE: wayOfLifeType[] = [
  {
    label: "Manners & Etiquette",
    img: "/images/way-of-life/manner.png",
  },
  {
    label: "Life Events & Ceremonies",
    img: "/images/way-of-life/life-event.png",
  },
  {
    label: "Seasonal Traditions",
    img: "/images/way-of-life/seasonal.png",
  },
  {
    label: "Traditions & Beliefs",
    img: "/images/way-of-life/belief.png",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  mythology: "Mythology",
  culture: "Culture",
  festivals: "Festivals",
  customs: "Customs",
};

export const CATEGORIES: categoriesType[] = [
  { id: "culture", name: "Culture" },
  { id: "mythology", name: "Mythology" },
  { id: "customs", name: "Customs" },
  { id: "festivals", name: "Festivals" },
];
