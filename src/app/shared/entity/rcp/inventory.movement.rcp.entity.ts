export interface InventoryMovement {
  id: number;
  quantity: number;
  type: InventoryMovementType;
  reason: string;
  created_at: Date;
  updated_at: Date;
  sale_item_id?: number;
  stock_entry_id?: number;
}

export enum InventoryMovementType {
  OUT = 'OUT',
  IN = 'IN',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT'
}

export const InventoryMovementTypeLabels = {
  [InventoryMovementType.OUT]: 'Salida',
  [InventoryMovementType.IN]: 'Entrada',
  [InventoryMovementType.RETURN]: 'Devolución',
  [InventoryMovementType.ADJUSTMENT]: 'Ajuste'
}

export interface ProductMovementReportOwnerGroup {
  user_id: string;
  owner_name: string;
  owner_email: string;
  owner_current_stock: number;
  movements: InventoryMovement[];
}

export interface ProductMovementReport {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image: string;
  owners: ProductMovementReportOwnerGroup[];
}