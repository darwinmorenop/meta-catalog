import { ProductScrapSyncOptions } from "src/app/core/models/products/scrap/product.scrap.sync.model"

export interface ScrapRcpInsertEntity {
    name: string,
    description: string,
    summary: string,
    manufacturer_ref: string,
    url_source: string,
    url: string,
    img_main: string,
    img_sec: string,
    scrap_id: number,
    original_price: number,
    sale_price: number,
    stock_status: number
}

export interface ScrapRcpUpdateEntity extends ScrapRcpInsertEntity{
    product_id: number
}

export interface ScrapRcpArchivedRequestEntity{
    p_scrap_id: number,
    p_product_ids: number[],
    p_config: ProductScrapSyncOptions
}

export interface ScrapRcpInsertRequestEntity{
    p_scrap_id: number,
    p_sources: ScrapRcpInsertEntity[],
    p_config: ProductScrapSyncOptions
}

export interface ScrapRcpUpdateRequestEntity{
    p_scrap_id: number,
    p_sources: ScrapRcpUpdateEntity[],
    p_config: ProductScrapSyncOptions
}

export interface ScrapRcpResponseEntity{
    success: boolean,
    scrap_id: number,
    total_processed:number,
    error_message?: string
}