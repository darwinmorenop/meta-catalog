export interface SaleEntity {
    id: number;
    created_at: Date;
    updated_at: Date;
    total_amount: number;
    payment_method: SalePaymentMethod;
    status: SaleStatus;
    user_source_id: string;
    user_target_id: string;
}

export interface SaleProductEntity {
    id: number;
    created_at: Date;
    updated_at: Date;
    sale_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    unit_cost_at_sale: number;
    discount_amount: number;
    status: SaleStatus;
}


export enum SaleStatus {
    completed = 'completed',
    refunded = 'refunded',
    cancelled = 'cancelled',
    pending = 'pending',
    started = 'started'
}

export const SaleStatusLabels: Record<SaleStatus, string> = {
    [SaleStatus.completed]: 'Completado',
    [SaleStatus.refunded]: 'Devuelto',
    [SaleStatus.cancelled]: 'Cancelado',
    [SaleStatus.pending]: 'Pendiente',
    [SaleStatus.started]: 'Iniciado',
};


export enum SalePaymentMethod {
    cash = 'cash',
    card = 'card',
    bizum = 'bizum',
    transfer = 'transfer',
    exchange = 'exchange'
}

export const SalePaymentMethodLabels: Record<SalePaymentMethod, string> = {
    [SalePaymentMethod.cash]: 'Efectivo',
    [SalePaymentMethod.card]: 'Tarjeta de crédito',
    [SalePaymentMethod.bizum]: 'Bizum',
    [SalePaymentMethod.transfer]: 'Transferencia bancaria',
    [SalePaymentMethod.exchange]: 'Cambio'
};
