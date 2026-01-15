export interface ProductDashboardMediaItemEntity {
    id: number;
    url: string;
    type: 'image' | 'video';
    is_main: boolean;
    display_order: number;
}

export interface ProductDashboardMediaEntity {
    product_id: number;
    product_name: string;
    product_sku: string;
    product_ean: string | null;
    product_status: string;
    category_id: number;
    category_name: string;
    media_gallery: ProductDashboardMediaItemEntity[]; // Array de objetos agrupados
    total_media_count: number;
}