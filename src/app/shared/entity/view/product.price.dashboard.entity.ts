import { PriceHistoryEntity } from "src/app/shared/entity/price.history.entity";

export interface ProductDashboardPriceEntity {
    product_id: number;
    product_main_image: string;
    product_name: string;
    product_sku: string;
    product_ean: string | null;
    product_status: string;
    category_id: number;
    category_name: string;
    price_list: PriceHistoryEntity[];
    total_price_count: number;
}