export interface MediaRcpOrderRequestEntity {
    p_product_id: number,
    p_media_items: MediaRcpOrderItemEntity[]
}

export interface MediaRcpOrderItemEntity {
    id: number,
    display_order: number,
    is_main: boolean
}

export interface MediaRcpOrderResponseEntity {
    success: boolean,
    updated_count: number
}