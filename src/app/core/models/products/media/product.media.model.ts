export enum ProductMediaType {
    IMAGE = 'image',
    VIDEO = 'video',
}
export interface ProductMedia {
    id: number;
    product_id: number;
    url: string;
    type: ProductMediaType;
    is_main: boolean;
    display_order: number;
    alt_text: string;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}