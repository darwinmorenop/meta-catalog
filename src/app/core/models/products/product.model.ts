import { ProductPricing } from "src/app/core/models/products/product.pricing.model";
import { ProductAttributes } from "src/app/core/models/products/product.attributes.model";
import { ProductStockInfo } from "src/app/core/models/products/product.stock.info.model";
import { ProductMedia } from "src/app/core/models/products/media/product.media.model";
import { ProductStatusEnum } from "src/app/core/models/products/product.status.enum";
import { ProductCategory } from "src/app/core/models/products/product.category.model";

export interface Product {
  id: number;
  created_at: Date;
  updated_at: Date;
  sku: string; // stock keeping unit
  ean: string; // European Article Number
  name: string;
  description?: string;
  summary?: string;
  status: ProductStatusEnum;
  brand: string;
  brand_id: number;
  category: ProductCategory;
  attributes: ProductAttributes;
  pricing: ProductPricing;
  stock: ProductStockInfo;
  media: ProductMedia[];
}