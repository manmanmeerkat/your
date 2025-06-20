//types/types.ts

// 🔗 既存の型定義
export type linksType = {
    img?: string;
    href: string;
    label: string;
};

// 🔧 記事型を一口メモ対応に拡張
export type articleType = {
    id: string;
    slug: string;
    title: string;
    category: "mythology" | "culture" | "festivals" | "customs";
    content: string;
    summary?: string;
    createdAt: Date;
    updatedAt: Date;
    images?: {
      url: string;
      altText?: string;
    }[];
    trivia?: ArticleTrivia[];  // 🆕 一口メモを追加
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

// 🆕 ========== 一口メモ関連の型定義 ==========

// 📝 一口メモの基本型
export type ArticleTrivia = {
    id: string;
    title: string;
    content: string;
    contentEn?: string | null;
    category: TriviaCategoryType;
    tags: string[];
    iconEmoji?: string | null;
    colorTheme?: TriviaColorThemeType | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    articleId: string;
};

// 🎯 一口メモのカテゴリー定数と型
export const TRIVIA_CATEGORIES = {
    SHRINE: 'shrine',
    ANIME: 'anime',
    FOOD: 'food',
    CULTURE: 'culture',
    HISTORY: 'history',
    NATURE: 'nature',
    FESTIVAL: 'festival',
    MYTHOLOGY: 'mythology',
    CUSTOMS: 'customs',
    DEFAULT: 'default',
} as const;

export type TriviaCategoryType = typeof TRIVIA_CATEGORIES[keyof typeof TRIVIA_CATEGORIES];

// 🎨 一口メモのカラーテーマ定数と型
export const TRIVIA_COLOR_THEMES = {
    SHRINE: 'shrine',
    ANIME: 'anime', 
    FOOD: 'food',
    CULTURE: 'culture',
    HISTORY: 'history',
    NATURE: 'nature',
    FESTIVAL: 'festival',
    MYTHOLOGY: 'mythology',
    CUSTOMS: 'customs',
    DEFAULT: 'default',
} as const;

export type TriviaColorThemeType = typeof TRIVIA_COLOR_THEMES[keyof typeof TRIVIA_COLOR_THEMES];

// 📊 一口メモ作成用の型
export type CreateTriviaData = {
    title: string;
    content: string;
    contentEn?: string;
    category: TriviaCategoryType;
    tags?: string[];
    iconEmoji?: string;
    colorTheme?: TriviaColorThemeType;
    displayOrder?: number;
    isActive?: boolean;
};

// ✏️ 一口メモ更新用の型
export type UpdateTriviaData = Partial<CreateTriviaData> & {
    id: string;
};

// 🔍 一口メモフィルター用の型
export type TriviaFilterOptions = {
    category?: TriviaCategoryType;
    tags?: string[];
    isActive?: boolean;
    articleId?: string;
};

// 📋 一口メモ表示用のプロパティ型
export type TriviaDisplayProps = {
    triviaList: ArticleTrivia[];
    showEnglish?: boolean;
    allowToggle?: boolean;
    maxItems?: number;
    className?: string;
};

// 🎪 一口メモ管理画面用の型
export type TriviaManagementData = {
    trivia: ArticleTrivia;
    isEditing: boolean;
    isDragging?: boolean;
};

// 📝 目次アイテム型（既存のTableOfContentsで使用）
export type TocItem = {
    id: string;
    text: string;
    level: number;
};

// 🎭 一口メモのアイコン定数
export const TRIVIA_ICONS = {
    SHRINE: '⛩️',
    ANIME: '🎌',
    FOOD: '🍱', 
    CULTURE: '🎎',
    HISTORY: '📚',
    NATURE: '🌸',
    FESTIVAL: '🎊',
    MYTHOLOGY: '🐉',
    CUSTOMS: '🎋',
    DEFAULT: '💡',
} as const;

export type TriviaIconType = typeof TRIVIA_ICONS[keyof typeof TRIVIA_ICONS];

// 🌍 一口メモの言語設定型
export type TriviaLanguage = 'ja' | 'en';

// 📊 一口メモの統計情報型
export type TriviaStats = {
    totalCount: number;
    activeCount: number;
    categoryCounts: Record<TriviaCategoryType, number>;
    tagCounts: Record<string, number>;
    languageSupport: {
        japaneseOnly: number;
        bilingual: number;
        total: number;
    };
};

// 🔧 一口メモのソート設定型
export type TriviaSortOptions = {
    field: 'displayOrder' | 'createdAt' | 'updatedAt' | 'title';
    direction: 'asc' | 'desc';
};

// 💾 一口メモのバックアップ型
export type TriviaBackup = {
    exportDate: string;
    version: string;
    articlesCount: number;
    triviaCount: number;
    data: {
        articleId: string;
        articleTitle: string;
        trivia: ArticleTrivia[];
    }[];
};