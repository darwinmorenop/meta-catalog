export interface ProductScrap {
    code: string;
    totalStock: number;
    name: string;
    description: string;
    details?: ProductScrapDetails;
    summary: string;
    salePrice: number;
    originalPrice: number;
    url: string;
    urlBase: string;
    urlSource: string;
    imageUrl: string;
    secondImageUrl: string;
    productCommercialCode: string;
}

export interface ProductScrapDetails {
    description: ContentBlock[];
    benefits: ContentBlock[];
    ingredients_commercial: ContentBlock[];
    ingredients_modal: ContentBlock[];
    usage: ContentBlock[];
    images: string[];
}

export enum BlockType {
    PARAGRAPH = "paragraph",
    QUESTION = "question",
    SECTION = "section",
    FEATURE = "feature",
    STEP = "step",
    INGREDIENT = "ingredient",
    INFO = "info",
    KEY_VALUE = "key_value"
}

export interface ContentBlock {
    type: BlockType;
    text: string;
    title?: string;
}