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

export type godType = {
    name: string;
    img: string;
    gender: "male" | "female";
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

export type FormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
};
  
export type Feedback = {
    visible: boolean;
    success: boolean;
    message: string;
};

export type redbubbleType = {
    title: string;
    img: string;
    link: string;
}