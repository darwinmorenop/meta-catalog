export enum ProductAttributesGender {
    MALE = 'male',
    FEMALE = 'female',
    UNISEX = 'unisex',
}
export enum ProductAttributesUnit {
    ML = 'ml',
    GR = 'gr',
    OZ = 'oz',
}
export interface ProductAttributesClaims {
    is_vegan: boolean;
    is_cruelty_free: boolean;
    is_refillable: boolean;
}
export interface ProductAttributesNotes {
    top: string[];
    heart: string[];
    base: string[];
}
export interface ProductAttributes {
    // Perfume
    olfactory_family?: string;
    notes?: ProductAttributesNotes;
    details?: ProductDetails;
    // Skincare
    skin_type?: string;
    // General
    gender: ProductAttributesGender;
    format: string;
    size: number;
    unit: ProductAttributesUnit;
    claims: ProductAttributesClaims;
    inci: string[];
    pao: string;
}

export interface ProductDetailsContentBlock {
  type: 'paragraph' | 'question' | 'section' | 'feature' | 'step' | 'key_value' | 'ingredient' | 'info';
  text: string;
  title?: string;
  items?: ProductDetailsContentBlock[];
}
export interface ProductDetails {
  description: ProductDetailsContentBlock[];
  benefits: ProductDetailsContentBlock[];
  ingredients_commercial: ProductDetailsContentBlock[];
  ingredients_modal: string[];
  usage: ProductDetailsContentBlock[];
  images: string[];
  videos: string[];
}