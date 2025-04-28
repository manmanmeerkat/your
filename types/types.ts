export type linksType = {
    img?: string;
    href: string;
    label: string;
};

export type articleType = {
    id: string;
    slug: string;
    title: string;
    category: string;
    content: string;
    summary: string | null;
    createdAt: Date;
    images?: {
      id: string;
      url: string;
      altText: string | null;
      isFeatured: boolean;
    }[];
}

export type slideImgType = {
    img: string;
}

export type categoryItemType = {
    href: string;
    title: string;
    img: string;
    description: string;
};

export type categoryImgType = {
    name: string;
    img: string;
}
 
export type seasonFestivalsType = {
    season: string;
    label: string;
    example1: string;
    example2: string;
    img: string;
}

export type threeFestivalsType = {
    title: string;
    img: string;
    alt: string;
    text: string;
}

export type wayOfLifeType = {
    label: string;
    img: string;
}

export type SNSLinkType = {
    img: string;
    label: string;
    href: string;
}

export type categoriesType = {
    id: string;
    name: string;
}