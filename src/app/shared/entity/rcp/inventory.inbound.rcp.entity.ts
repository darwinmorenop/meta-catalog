export interface InventoryInboundInsertRcpEntity {
    user_source_id: number;
    received_at: string;
    user_target_id: number;
    reference_number: string;
    status: string
    products: InventoryInboundProductInsertRcpEntity[]
}

export interface InventoryInboundProductInsertRcpEntity {
    product_id: number;
    quantity: number;
    unit_cost: number;
    batch_number: string;
    expiry_date: string;
}