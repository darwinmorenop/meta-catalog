import { ProductCompleteEntity } from "../../view/product.complete.entity";

export interface ProductStoreCompleteRpcEntity extends ProductCompleteEntity {
    is_favorite: boolean;
    is_price_tracked: boolean;
    is_stock_notified: boolean;
    is_in_custom_list: boolean;
    cart_quantity: number;
}