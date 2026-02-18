export interface ProductInventoryStockEntryDashboardEntity {
    product_id: number;
    product_main_image: string;
    product_name: string;
    product_sku: string;
    manufacturer_ref: string;
    global_total_purchases: number;
    global_avg_unit_cost: number;
    global_avg_quantity: number;
    global_total_quantity: number;
    users_details: UserInventoryStockEntryDashboardEntity[];
}

export interface UserInventoryStockEntryDashboardEntity {
    user_id: string;
    first_name: string;
    last_name: string;
    total_purchases: number;
    avg_unit_cost: number;
    avg_quantity: number;
    total_quantity: number;
}