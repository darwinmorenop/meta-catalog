import { ProductScrap } from "src/app/core/models/products/scrap/product.scrap.model";

export interface ProductScrapSyncOptions {
    syncStatus: boolean;
    syncPrices: boolean;
    syncStock: boolean;
    syncProperties: boolean;
}

export interface ProductScrapSyncPendingChange {
  productId?: number;
  manufacturerRef: string;
  productName: string;
  saved: boolean;
  type: 'CREATE' | 'UPDATE' | 'ARCHIVE';
  fields: { field: string; oldValue: any; newValue: any }[];
  originalScrap: ProductScrap;
}