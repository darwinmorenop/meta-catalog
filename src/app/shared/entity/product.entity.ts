export interface ProductEntity {
    id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    description: string;
    summary: string;
    sku: string;
    category_id: number;
    brand_id: number;
    ean: string;
    status: string;
    manufacturer_ref: string;
}