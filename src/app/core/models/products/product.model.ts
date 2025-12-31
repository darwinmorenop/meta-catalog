import { ProductPricing } from "./product.pricing.model";
import { ProductAttributes } from "./product.attributes.model";
import { ProductStockInfo } from "./product.stock.info.model";
import { ProductMedia } from "./product.media.model";
import { ProductStatusEnum } from "./product.status.enum";
import { ProductCategory } from "./product.category.model";

export interface Product {
  id: number;
  created_at: Date;
  updated_at: Date;
  sku: string; // stock keeping unit
  ean: string; // European Article Number
  name: string;
  status: ProductStatusEnum;
  brand: string;
  category: ProductCategory;
  attributes: ProductAttributes;
  pricing: ProductPricing;
  stock: ProductStockInfo;
  media: ProductMedia[];
}