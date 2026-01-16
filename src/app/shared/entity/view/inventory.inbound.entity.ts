export enum InventoryInboundStatusEnum {
    completed = 'Completado', returned = 'Reembolsado', cancelled = 'Cancelado', pending = 'Pendiente', started = 'Iniciado'
}
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