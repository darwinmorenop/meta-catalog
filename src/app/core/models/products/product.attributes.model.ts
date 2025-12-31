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