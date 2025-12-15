
export interface Settings {
    primaryColor: string;
    tone: 'Thân thiện' | 'Chuyên nghiệp' | 'Thuyết phục' | 'Vui vẻ';
    ctaLinks: {
        product_page: string;
        category_page: string;
        pdf: string;
        hotline: string;
        zalo: string;
        messenger: string;
        booking: string;
        voucher: string;
        blog: string;
    };
    tracking: {
        page_slug: string;
        utm_source: string;
        utm_medium: string;
        utm_campaign: string;
    };
}

// Represents the settings that are saved in a reusable profile.
export type BrandSettings = {
    primaryColor: string;
    tone: Settings['tone'];
};

export interface CtaVariant {
    variantName: 'A' | 'B';
    htmlBlock: string;
    previewExplanation: string;
}

export interface AbTestPair {
    position: string;
    reasoning: string;
    variants: [CtaVariant, CtaVariant];
}

export interface AiFullStrategyResponse {
    sharedCss: string;
    overallStrategy: string;
    analysis: { title: string; content: string; }[];
    risksAndRecommendations: string;
    abTestPairs: AbTestPair[];
}

export interface Profile {
    name: string;
    settings: BrandSettings;
}
