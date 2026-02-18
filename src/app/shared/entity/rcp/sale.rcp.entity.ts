import { SalePaymentMethod, SaleStatus } from "src/app/shared/entity/sale.entity";

export interface SaleProductInsertRcpEntity {
  id?: number; // Opcional: si existe, se edita; si no, se crea
  product_id: number;
  quantity: number;
  unit_price: number;
  unit_cost_at_sale: number | null;
  discount_amount: number;
  status: SaleStatus;
  description?: string;
}

export interface SaleInsertRcpEntity {
  id: number | null; // Opcional: nulo para nueva venta, valor para editar
  total_amount: number;
  payment_method: SalePaymentMethod;
  status: SaleStatus;
  user_source_id: string;
  user_target_id: string;
  description?: string;
  items: SaleProductInsertRcpEntity[];
}

export interface UpsertSaleRequest {
  p_sale_data: SaleInsertRcpEntity;
}

export interface UpsertSaleResponse {
  sale_id: number;
  status: 'success';
}

export interface ProductSalesStats {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_ref: string;
  product_image: string;
  total_sales_count: number;
  avg_sale_price: number;
  total_units_sold: number;
  total_revenue: number;
  seller_metrics: SellerMetric[];
}

export interface SellerMetric {
  user_id: string;
  first_name: string;
  last_name: string;
  sales_count: number;
  avg_price: number;
  total_units: number;
  total_revenue: number;
}