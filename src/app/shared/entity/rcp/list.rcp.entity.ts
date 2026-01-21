import { ListItemTrackingTypeEnum } from "../list.entity"

export interface ListRcpUpsertRequestEntity {
    p_list_id?: string,
    p_owner_id?: number,
    p_name?: string,
    p_description?: string,
    p_slug?: string,
    p_is_private?: boolean,
    p_products?: ListItemRcpUpsertRequestEntity[] 
}

export interface ListItemRcpUpsertRequestEntity {
    product_id: number,
    target_price?: number,
    tracking_type?: ListItemTrackingTypeEnum,
}

export interface ListRcpCopyRequestEntity {
    p_source_list_id: string,
    p_new_owner_id: number,
    p_new_name?: string
}
