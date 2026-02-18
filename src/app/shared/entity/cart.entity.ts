export interface CartItemEntity {
    id: number;
    product_id: number;
    user_id: string;
    quantity: number;
    is_selected: boolean;
    is_saved_for_later: boolean;
    created_at: string;
    updated_at: string;
    // View fields
    product_name?: string;
    product_image?: string;
    owner_full_name?: string;
    owner_image?: string;
}