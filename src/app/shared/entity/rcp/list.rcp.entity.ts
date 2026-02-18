import { ListItemTrackingTypeEnum } from "../list.entity"

export interface ListRcpUpsertRequestEntity {
    p_list_id?: string,
    p_owner_id?: string,
    p_name?: string,
    p_description?: string,
    p_slug?: string,
    p_is_private?: boolean,
    p_products?: ListItemRcpEntity[] 
}

export interface ListItemRcpEntity {
    product_id: number,
    target_price?: number,
    tracking_type?: ListItemTrackingTypeEnum,
}

export interface ListRcpCopyRequestEntity {
    p_source_list_id: string,
    p_new_owner_id: string,
    p_new_name?: string
}

export interface ListItemRcpUpsertRequestEntity {
    p_list_id: string,
    p_product_id: number,
    p_target_price?: number,
    p_tracking_type: ListItemTrackingTypeEnum,
}
