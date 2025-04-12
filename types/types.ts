export type linksType = {
    img?: string;
    href: string;
    label: string;
};

export type articleType = {
    id: string;
    slug: string;
    title: string;
    category: "mythology" | "culture" | "festivals" | "customs";
    content: string;
    summary?: string;
    createdAt: string;
    images?: {
      url: string;
      altText?: string;
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