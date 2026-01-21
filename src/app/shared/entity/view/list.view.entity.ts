import { ListItemTrackingTypeEnum, ListSlugEnum } from "../list.entity";
export interface ListViewEntity {
    id: string;
    owner_id: number;
    name: string;
    description: string;
    slug: ListSlugEnum;
    is_private: boolean;
    created_at: Date;
    updated_at: Date;
    owner_image: string;
    owner_last_name: string;
    owner_first_name: string;
    owner_full_name: string;
    items_count: number;
}
export interface ListItemViewEntity {
    item_id: number;
    list_id: number;
    list_name: string;
    list_slug: string;
    list_description: string;
    list_is_private: boolean;
    owner_id: number;
    owner_image: string;
    owner_last_name: string;
    owner_first_name: string;
    owner_full_name: string;
    product_id: number;
    product_name: string;
    product_main_image: string;
    original_price: number;
    sale_price: number;
    price_at_addition: number;
    target_price: number;
    added_at: Date;
    created_at: Date;
    updated_at: Date;
    price_difference: number;
    discount_percentage: number;
    tracking_type: ListItemTrackingTypeEnum;
}