import { ProductScrap } from "src/app/core/models/products/scrap/product.scrap.model";

export enum ScrapCategory {
  PERFUMES = 'perfumes',
  TRATAMIENTO_FACIAL = 'tratamiento-facial',
  JOYERIA = 'joyeria'
}

export interface ProductScrapSyncOptions {
    syncStatus: boolean;
    syncPrices: boolean;
    syncStock: boolean;
    syncProperties: boolean;
    syncDetails: boolean;
    categories?: ScrapCategory[];
}

export interface ProductScrapSyncPendingChange {
  productId?: number;
  manufacturer_ref: string;
  product_name: string;
  saved: boolean;
  type: 'CREATE' | 'UPDATE' | 'ARCHIVE';
  fields: { field: string; oldValue: any; newValue: any }[];
  original_scrap: ProductScrap;
}