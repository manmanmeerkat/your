import type { linksType } from "@/types/types";
import type { slideImgType } from "@/types/types";
import type { categoryItemType } from "@/types/types";
import type { categoryImgType } from "@/types/types";
import type { seasonFestivalsType } from "@/types/types";
import type { threeFestivalsType } from "@/types/types";
import type { wayOfLifeType } from "@/types/types";
import type { SNSLinkType } from "@/types/types";
import type { categoriesType } from "@/types/types";
import type { godType } from "@/types/types";
import type { redbubbleType } from "@/types/types";

export const NAVI_LINKS: linksType[] = [
    { href: '/mythology', label: 'Mythology' },
    { href: '/culture', label: 'Culture' },
    { href: '/festivals', label: 'Festivals' },
    { href: '/customs', label: 'Customs' },
    { href: '/about', label: 'About' }
];

export const MOBILE_NAVI_LINKS: linksType[]  = [
   { label: "Home", href: "/" },
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
  // { img: "/images/icon/redbubble.png", label: "REDBUBBLE", href: "https://www.redbubble.com/people/manmanmeerkat/shop?asc=u" },
  { img: "/images/icon/pinterest.png", label: "Pinterest", href: "https://jp.pinterest.com/enokidesign/" },
  // { img: "/images/icon/x-black.png", label: "X", href: "https://x.com/youraccount" },
  // { img: "/images/icon/x-white.png", label: "X", href: "https://x.com/youraccount" },
];

export const SLIDE_IMAGES: slideImgType[] = [
    { img: "/images/slide/mythology.webp"},
    { img: "/images/slide/fuji.webp"},
    { img: "/images/slide/kimono.webp"},
    { img: "/images/slide/ninja.webp"},
    { img: "/images/slide/carp.webp"}
];

export const CATEGORY_ITEMS: categoryItemType[] = [
  {
      href: "/mythology",
      title: "Japanese Mythology",
      img: "/images/category-img/mythology.jpg",
      description: "Meet the gods, legends, and sacred stories that shaped Japan’s imagination.",
  },
  {
    href: "/culture",
    title: "Japanese Culture",
    img: "/images/category-img/culture.jpg",
    description: "Discover traditions and everyday beauty—from tea ceremony to kimono and crafts.",
  },
  {
      href: "/festivals",
      title: "Japanese Festivals",
      img: "/images/category-img/festival.jpg",
      description: "Step into seasonal celebrations, local rituals, and moments filled with light, sound, and tradition.",
    },
  {
    href: "/customs",
    title: "Japanese Customs",
    img: "/images/category-img/custom.jpg",
    description: "Learn simple manners and gestures that reveal Japan’s quiet kindness—like bowing and “itadakimasu.”",
  }
];

export const JAPANESE_GODS: godType[] = [
    {
      name: "Izanagi no Mikoto",
      img: "/images/gods/izanagi.png",
      gender: "male"
    },
    {
      name: "Izanami no Mikoto",
      img: "/images/gods/izanami.png",
      gender: "female"
    },
    {
      name: "Susanoo no Mikoto",
      img: "/images/gods/susanoo.png",
      gender: "male"
    },
    {
      name: "Amaterasu Ōmikami",
      img: "/images/gods/amaterasu.png",
      gender: "female"
    },
    {
      name: "Tsukuyomi no Mikoto",
      img: "/images/gods/tsukuyomi.png",
      gender: "male"
    },
    {
      name: "Ōkuninushi no Mikoto",
      img: "/images/gods/okuninushi.png",
      gender: "male"
    },
    {
      name: "Iwanaga-hime",
      img: "/images/gods/iwanaga.png",
      gender: "female"
    },
    {
      name: "Konohanasakuya-hime",
      img: "/images/gods/konohana.png",
      gender: "female"
    },
    {
      name: "Ninigi no Mikoto",
      img: "/images/gods/ninigi.png",
      gender: "male"
    },
    {
      name: "Kagutsuchi no Mikoto",
      img: "/images/gods/kagutsuchi.png",
      gender: "male"
    },
    {
      name: "Ōyamatsumi no Kami",
      img: "/images/gods/oyamatsumi.png",
      gender: "male"
    },
    {
      name: "Takemikazuchi no Kami",
      img: "/images/gods/takemikazuchi.png",
      gender: "male"
    },
    {
      name: "Yagami-hime",
      img: "/images/gods/yagami.png",
      gender: "female"
    },
    // {
    //   name: "Omoikane no Kami",
    //   img: "/images/gods/omoikane.png",
    //   gender: "male"
    // },
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

export const CATEGORY_CONFIG: Record<string, { path: string; label: string }> = {
  "about-japanese-gods": { path: "/mythology", label: "About Japanese Gods" },
  "japanese-culture-category": { path: "/culture", label: "Japanese Culture Category" },
  "seasonal-festivals": { path: "/festivals", label: "Seasonal Festivals" },
  "japanese-way-of-life": { path: "/customs", label: "Japanese Way of Life" },
};

export const REDBUBBLE_LISTS: redbubbleType[] = [
  { 
    title: "Noble Akita in a Scenic Landscape - Japanese Animal Art",
    img: "/images/redbubble/rb-akita.jpg",
    link: "https://www.redbubble.com/shop/ap/170284007" 
  },
  { 
    title: "Japanese Autumn leaves - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-autumn.jpg",
    link: "https://www.redbubble.com/shop/ap/168277992" 
  },
  { 
    title: "Winter Serenity & Plum Blossoms - Japanese Seazon Art",
    img: "/images/redbubble/rb-bird.jpg",
    link: "https://www.redbubble.com/shop/ap/169215961" 
  },
  { 
    title: "Elegant Kimono Beauty with Lute - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-biwa.jpg",
    link: "https://www.redbubble.com/shop/ap/168607133" 
  },
  { 
    title: "Graceful Koi & Waves -Japanese Timeless Art",
    img: "/images/redbubble/rb-carp.jpg",
    link: "https://www.redbubble.com/shop/ap/168177946" 
  },
  { 
    title: "Majestic Japanese Castle in Spring - Japanese Heritage Art",
    img: "/images/redbubble/rb-castle.jpg",
    link: "https://www.redbubble.com/shop/ap/169591351" 
  },
  { 
    title: "Elegant Chrysanthemums in Autumn Breeze - Japanese Floral Art",
    img: "/images/redbubble/rb-chrysanthemum.jpg",
    link: "https://www.redbubble.com/shop/ap/170403213" 
  },
  { 
    title: "Elegant Japanese Crane & Waves - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-crane.jpg",
    link: "https://www.redbubble.com/shop/ap/168091447" 
  },
  { 
    title: "Traditional Daruma & Torii - Timeless Japanese Art",
    img: "/images/redbubble/rb-daruma.jpg",
    link: "https://www.redbubble.com/shop/ap/168190797" 
  },
  { 
    title: "Golden Sunset Countryside - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-dragonfly.jpg",
    link: "https://www.redbubble.com/shop/ap/168406526" 
  },
  { 
    title: "Japanese Bonfire Night - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-bonfire.jpg",
    link: "https://www.redbubble.com/shop/ap/168331723" 
  },
  { 
    title: "Mystical Japanese Moonlit Night - Japanese Nature Art",
    img: "/images/redbubble/rb-fullmoon.jpg",
    link: "https://www.redbubble.com/shop/ap/169355468" 
  },
  { 
    title: "Elegant Tea Ceremony & Geisha - Japanese Culture Art",
    img: "/images/redbubble/rb-greentea.jpg",
    link: "https://www.redbubble.com/shop/ap/169194842" 
  },
  { 
    title: "Sunrise Over Mount Fuji - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-happyfuji.jpg",
    link: "https://www.redbubble.com/shop/ap/168281331" 
  },
  { 
    title: "Japanese Temple in the Rain - Timeless Japanese Art",
    img: "/images/redbubble/rb-hydrangea.jpg",
    link: "https://www.redbubble.com/shop/ap/168430405" 
  },
  { 
    title: "Tranquil Jizo in Autumn - Japanese Buddhist Art",
    img: "/images/redbubble/rb-jizo.jpg",
    link: "https://www.redbubble.com/shop/ap/168330195" 
  },
  { 
    title: "Princess Kaguya’s Ascent to the Moon - Japanese Folklore Art",
    img: "/images/redbubble/rb-kaguya.jpg",
    link: "https://www.redbubble.com/shop/ap/168737670" 
  },
  { 
    title: "Chrysanthemums in Moonlit Garden - Japanese Landscape Art",
    img: "/images/redbubble/rb-kiku.jpg",
    link: "https://www.redbubble.com/shop/ap/170089781" 
  },
  { 
    title: "Japanese Temple & Osmanthus Blossoms - Japanese Flower Art",
    img: "/images/redbubble/rb-kinmokusei.jpg",
    link: "https://www.redbubble.com/shop/ap/168605565" 
  },
  { 
    title: "Traditional Kite Flying - Japanese Culture Art",
    img: "/images/redbubble/rb-kite.jpg",
    link: "https://www.redbubble.com/shop/ap/168594639" 
  },
  { 
    title: "Geisha Dance Under Autumn Lanterns - Japanese Seasonal Art",
    img: "/images/redbubble/rb-kyoto.jpg",
    link: "https://www.redbubble.com/shop/ap/168752973" 
  },
  { 
    title: "Sakura Night & Lantern Glow - Timeless Japanese Art",
    img: "/images/redbubble/rb-lantern.jpg",
    link: "https://www.redbubble.com/shop/ap/168236881" 
  },
  { 
    title: "Blooming Lilies in Tranquil Garden - Japanese Nature Art",
    img: "/images/redbubble/rb-lily.jpg",
    link: "https://www.redbubble.com/shop/ap/168687853" 
  },
  { 
    title: "Maiko in Kyoto - Japanese Timeless Art",
    img: "/images/redbubble/rb-maiko.jpg",
    link: "https://www.redbubble.com/shop/ap/168236072" 
  },
  { 
    title: "Mount Fuji and Autumn Maple Leaves - Japanese Landscape Art",
    img: "/images/redbubble/rb-maplefuji.jpg",
    link: "https://www.redbubble.com/shop/ap/168714070" 
  },
  { 
    title: "Falling Japanese Maple Leaves Pattern - Japanese Nature Art",
    img: "/images/redbubble/rb-maplepattern.jpg",
    link: "https://www.redbubble.com/shop/ap/170141485" 
  },
  { 
    title: "Enchanting Autumn Mountainscape - Japanese Landscape Art",
    img: "/images/redbubble/rb-momiji.jpg",
    link: "https://www.redbubble.com/shop/ap/170308347" 
  },
  { 
    title: "Snow Monkey in Moonlit Hot Spring - Japanese Animal Art",
    img: "/images/redbubble/rb-monkey.jpg",
    link: "https://www.redbubble.com/shop/ap/170556994" 
  },
  { 
    title: "Morning Glories in a Japanese Garden - Japanese Art",
    img: "/images/redbubble/rb-morningglory.jpg",
    link: "https://www.redbubble.com/shop/ap/168355191" 
  },
  { 
    title: "Spirits & Mythical Beasts of Japan - Japanese Mythology Art",
    img: "/images/redbubble/rb-mythology.jpg",
    link: "https://www.redbubble.com/shop/ap/169146974" 
  },
  { 
    title: "Stealthy Ninja Warriors in a Bamboo Forest - Japanese Ninja Art",
    img: "/images/redbubble/rb-ninja.jpg",
    link: "https://www.redbubble.com/shop/ap/170308474" 
  },
  { 
    title: "Moonlit Noh Theater Dreamscape - Japanese Culture Art",
    img: "/images/redbubble/rb-noh.jpg",
    link: "https://www.redbubble.com/shop/ap/170456998" 
  },
  { 
    title: "Japanese Folktale - The Grateful Crane - Japanese Folktale Art",
    img: "/images/redbubble/rb-ongaeshi.jpg",
    link: "https://www.redbubble.com/shop/ap/168542216" 
  },
  { 
    title: "Tranquil Autumn at a Japanese Temple - Japanese Zen Art",
    img: "/images/redbubble/rb-pagoda.jpg",
    link: "https://www.redbubble.com/shop/ap/169525578" 
  },
  { 
    title: "Japanese Sakura Bridge & Torii - Japanese Sakura Art",
    img: "/images/redbubble/rb-sakura.jpg",
    link: "https://www.redbubble.com/shop/ap/168273029" 
  },
  { 
    title: "Enchanting Cherry Blossom Garden - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-sakurafubuki.jpg",
    link: "https://www.redbubble.com/shop/ap/168664166" 
  },
  { 
    title: "Elegant Folding Fans Pattern - Japanese Sensu Ukiyo-e Art",
    img: "/images/redbubble/rb-sensu.jpg",
    link: "https://www.redbubble.com/shop/ap/170595444" 
  },
  { 
    title: "Joyful Snowball Fight- Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-snow.jpg",
    link: "https://www.redbubble.com/shop/ap/168664336" 
  },
  { 
    title: "Serene Ink Landscape with Red Sun - Japanese Sumi-e Art",
    img: "/images/redbubble/rb-suibokuga.jpg",
    link: "https://www.redbubble.com/shop/ap/170403332" 
  },
  { 
    title: "Mystical Misty Landscape - Japanese Sumi-e Art",
    img: "/images/redbubble/rb-sumie.jpg",
    link: "https://www.redbubble.com/shop/ap/168574668" 
  },
  { 
    title: "Sunset Over Serene Lake with Blossoms - Japanese Landscape Art",
    img: "/images/redbubble/rb-sunset.jpg",
    link: "https://www.redbubble.com/shop/ap/168687702" 
  },
  { 
    title: "Ukiyo-e Sunset Over the Sea - Traditional Japanese Art",
    img: "/images/redbubble/rb-sunsetship.jpg",
    link: "https://www.redbubble.com/shop/ap/168430001" 
  },
  { 
    title: "Golden Fields of Autumn - Japanese Landscape Art",
    img: "/images/redbubble/rb-susuki.jpg",
    link: "https://www.redbubble.com/shop/ap/170260059" 
  },
  { 
    title: "Moonlit Fire Festival by the Lake - Japanese Festival Art",
    img: "/images/redbubble/rb-takibi.jpg",
    link: "https://www.redbubble.com/shop/ap/169838369" 
  },
  { 
    title: "Enchanting Tanabata Festival by the River - Japanese Festival Art",
    img: "/images/redbubble/rb-tanabata.jpg",
    link: "https://www.redbubble.com/shop/ap/169523025" 
  },
  { 
    title: "Fisherman & Line-caught Tuna - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-tuna.jpg",
    link: "https://www.redbubble.com/shop/ap/168502183" 
  },
  { 
    title: "Tranquil Riverside Scene - Japanese Ukiyo-e Art",
    img: "/images/redbubble/rb-willow.jpg",
    link: "https://www.redbubble.com/shop/ap/168605329" 
  },
  { 
    title: "Tranquil Wisteria Morning Glow - Japanese Landscape Art",
    img: "/images/redbubble/rb-wisteria.jpg",
    link: "https://www.redbubble.com/shop/ap/170427950" 
  },
  { 
    title: "Sakura and Waves in Spring - Japanese Sakura Art",
    img: "/images/redbubble/rb-yaezakura.jpg",
    link: "https://www.redbubble.com/shop/ap/169121939" 
  },
  { 
    title: "Zen Meditation in Autumn Serenity - Japanese Buddhist Art",
    img: "/images/redbubble/rb-zen.jpg",
    link: "https://www.redbubble.com/shop/ap/168381319" 
  },
];