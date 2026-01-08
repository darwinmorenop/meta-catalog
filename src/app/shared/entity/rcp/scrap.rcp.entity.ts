export interface ScrapRcpInsertEntity {
    name: string,
    description: string,
    summary: string,
    manufacturer_ref: string,
    url_source: string,
    url: string,
    scrap_id: number,
    original_price: number,
    sale_price: number,
    stock_status: number
}

export interface ScrapRcpEntity{
    p_scrap_client: string,
    p_scrap_id: number,
    p_sources: ScrapRcpInsertEntity[]
}

export interface ScrapRcpResponseEntity{
    success: boolean,
    scrap_id: number,
    total_processed:number
}