export enum InventoryInboundStatusEnum {
    completed = 'completed',
    returned = 'returned',
    cancelled = 'cancelled',
    pending = 'pending',
    started = 'started',
    deleted = 'deleted'
}

export const InventoryInboundStatusLabels: Record<InventoryInboundStatusEnum, string> = {
    [InventoryInboundStatusEnum.completed]: 'Completado',
    [InventoryInboundStatusEnum.returned]: 'Devuelto',
    [InventoryInboundStatusEnum.cancelled]: 'Cancelado',
    [InventoryInboundStatusEnum.pending]: 'Pendiente',
    [InventoryInboundStatusEnum.started]: 'Iniciado',
    [InventoryInboundStatusEnum.deleted]: 'Eliminado'
};

export interface InventoryInboundEntity {
    id: number;
    user_source_id: number;
    received_at: Date;
    created_at: Date;
    updated_at: Date;
    user_target_id: number;
    reference_number: string;
    status: InventoryInboundStatusEnum
}