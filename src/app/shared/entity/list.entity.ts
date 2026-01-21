export interface ListEntity {
    id: string;
    owner_id: number;
    name: string;
    description: string;
    slug: ListSlugEnum;
    is_private: boolean;
    created_at: Date;
    updated_at: Date;
}

export enum ListSlugEnum {
    favorites='favorites',
    price_tracking ='price_tracking'
}

export enum ListItemTrackingTypeEnum {
    target = 'target',
    sale = 'sale',
    none = 'none'
}

export const ListItemTrackingTypeLabel = {
    [ListItemTrackingTypeEnum.target]: 'Precio objetivo',
    [ListItemTrackingTypeEnum.sale]: 'Descuento',
    [ListItemTrackingTypeEnum.none]: 'Ninguno'
}   

export interface ListItemEntity {
    id: string;
    list_id: string;
    product_id: number;
    added_at: Date;
    created_at: Date;
    updated_at: Date;
    price_at_addition: number;
    target_price: number;
    tracking_type: ListItemTrackingTypeEnum;
}

export interface ListMembersEntity {
    list_id: string;
    user_id: number;
    role: string;
    joined_at: Date;
}