import { Product } from "./product.model";

export interface ProductStore extends Product {
  is_favorite: boolean;
  is_price_tracked: boolean;
  is_stock_notified: boolean;
  is_in_custom_list: boolean;
  cart_quantity: number;
}