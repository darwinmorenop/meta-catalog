export enum ProductMediaType {
    IMAGE = 'image',
    VIDEO = 'video',
}
export interface ProductMedia {
    id: string;
    product_id: string;
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