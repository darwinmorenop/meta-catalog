export interface ProductCompleteEntity {
    // Product
    product_id: number;
    product_created_at: Date;
    product_updated_at: Date;
    product_sku: string;
    product_name: string;
    product_status: string;
    product_description: string;
    product_summary: string;
    product_ean: string;
    // Category
    category_id: number;
    category_leaf: string;
    category_full_path: string;
    // Brand
    brand_id: number,
    brand_name: string,
    // Attributes
    attribute_gender: string,
    attribute_olfactory_family: string,
    attribute_skin_type: string,
    attribute_format: string,
    attribute_size: number,
    attribute_unit: string,
    attribute_is_vegan: boolean,
    attribute_is_cruelty_free: boolean,
    attribute_is_refillable: boolean,
    attribute_pao: string,
    attribute_inci: string[],
    attribute_notes: any,
    // Pricing
    price_sale_price: number,
    price_original_price: number,
    price_currency: string,
    price_offer_start:Date,
    price_offer_end:Date,
    // Stock
    stock_available: number,
    stock_external: number,
    stock_external_updated_at:Date,
    product_min_stock_alert: number,
    // Media
    product_media: any[]
}