import { ProductScrapSyncOptions } from "src/app/core/models/products/scrap/product.scrap.sync.model";

export interface ScrapSummaryEntry {
  scrap_id: number;
  client: string;
  created_at: string;
  campaign_id: number;
  campaign_name: string;
  campaign_description: string;
  total_general: number;
  total_updated: number;
  total_created: number;
  total_archived: number;
  config: ProductScrapSyncOptions;
}

export interface ScrapItemDetailed {
  product_source_id: number,
  scrap_id: number,
  client: string,
  scrap_date: Date,
  campaign_name: string,
  product_name: string,
  manufacturer_ref: string,
  sku: string,
  code: string,
  original_price: number,
  sale_price: number,
  stock_status: number,
  item_status: number,
  url_source: string,
  final_url: string,
  is_active: boolean,
  updated_at: Date
}