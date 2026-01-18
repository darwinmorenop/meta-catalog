export interface ProductScrapEntity {
    product_id: number,
    product_manufacturer_ref: string,
    product_main_image: string,
    product_name: string,
    product_status: "archived" | "active",
    product_description: string,
    product_summary: string,
    source_id: number,
    source_is_active: boolean,
    source_status: "updated" | "created" | "archived",
    source_stock: number,
    source_original_price: number,
    source_sale_price: number,
    source_url: string,
    source_url_source: string,
    source_scrap_id: number,
    source_scrap_client: string,
    source_scraped_at: Date,
    campaign_name: string,
}

export interface ProductSourceDetail {
  id: number;
  url: string;
  url_source: string;
  original_price: number;
  sale_price: number;
  stock_status: number;
  scraped_at: string;
  status: "updated" | "created" | "archived";
  is_active: boolean;
  code: string;
  campaign_id: number;
  campaign_name: string;
  scrap_id: number;
  scrap_config: any;
  scrap_created_at: string;
}

export interface ProductWithSourcesEntity {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_manufacturer_ref: string;
  product_status: "archived" | "active",
  product_main_image: string;
  sources: ProductSourceDetail[];
}