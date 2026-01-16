export interface ProductInventoryStockEntryEntity {
    id: number;
    product_id: number;
    quantity: number;
    unit_cost: number;
    batch_number: string;
    expiry_date: Date;
    created_at: Date;
    updated_at: Date;
    user_owner_id: number;
    inbound_id: number; 
}