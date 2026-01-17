import { InventoryInboundStatusEnum } from "src/app/shared/entity/inventory.inbound.entity";

export interface InventoryInboundDashboardEntity {
    inbound_id: number;
    reference_number: string;
    inbound_status: InventoryInboundStatusEnum;
    received_at: Date;
    inbound_created_at: Date;
    inbound_updated_at: Date;

    source_user_id: number;
    source_user_full_name: string;
    source_user_email: string;
    source_user_rank: string;

    target_user_id: number;
    target_user_full_name: string;
    target_user_email: string;
    target_user_rank: string;

    total_entries_count: number;
    total_unique_products: number;
    total_items_quantity: number;
    total_inbound_value: number;
}

export interface InventoryInboundDashboardDetailedEntity {
    inbound_id: number;
    reference_number: string;
    inbound_status: InventoryInboundStatusEnum;
    inbound_description: string;
    received_at: Date;
    inbound_created_at: Date;
    inbound_updated_at: Date;

    source_user_id: number;
    source_user_full_name: string;
    source_user_email: string;
    source_user_rank: string;

    target_user_id: number;
    target_user_full_name: string;
    target_user_email: string;
    target_user_rank: string;

    entry_id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_cost: number;
    batch_number: string;
    expiry_date: Date;
    description: string;
    created_at: Date;
    updated_at: Date;
    line_total_cost: number;
}

