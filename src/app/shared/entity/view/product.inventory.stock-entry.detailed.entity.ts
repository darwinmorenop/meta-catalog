export interface ProductInventoryStockEntryDetailedEntity {
    id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    batch_number: string;
    expiry_date: Date;
    created_at: Date;
    updated_at: Date;
    user_owner_id: number;
    user_owner_first_name: string;
    user_owner_last_name: string;
    inbound_id: number; 
    inbound_reference_number: string;
    description: string;
}