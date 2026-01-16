export interface PriceHistoryEntity {
    id: number;
    original_price: number;
    sale_price: number;
    offer_start: Date;
    offer_end: Date;
    is_active: boolean;
    reason: string;
    created_at: Date;
    updated_at: Date;
}