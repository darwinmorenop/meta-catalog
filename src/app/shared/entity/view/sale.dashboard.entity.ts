import { UserRankEnum } from "src/app/core/models/users/user.model";
import { SalePaymentMethod, SaleStatus } from "src/app/shared/entity/sale.entity";

export interface SaleDashboardEntity {
    sale_id: number;
    created_at: Date;
    updated_at: Date;
    payment_method: SalePaymentMethod;
    sale_overall_status: SaleStatus;
    original_total_amount: number;

    seller_name: string;
    buyer_name: string;

    unique_products_count: number;
    total_items_sold: number;
    calculated_total_amount_no_discount: number;
    calculated_total_amount_discount: number;

    items_completed: number;
    items_refunded: number;
    items_cancelled: number;
    items_pending: number;
    items_started: number;
}

export interface SaleDetailedEntity {
    sale_id: number;
    sale_date: string;
    sale_description: string;
    sale_status: SaleStatus;
    payment_method: SalePaymentMethod;
    sale_header_total: number;
    sale_created_at: Date;
    sale_updated_at: Date;

    // Datos del Vendedor
    source_user_id: number;
    source_user_name: string;
    source_user_email: string;
    source_user_image: string;
    source_user_rank: UserRankEnum;

    // Datos del Cliente
    target_user_id: number;
    target_user_name: string;
    target_user_email: string;
    target_user_image: string;
    target_user_rank: UserRankEnum;

    // Datos del Producto e Item
    product_id: number;
    product_name: string;
    product_image: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    unit_cost_at_sale: number | null;
    discount_amount: number;
    item_id: number;
    item_status: SaleStatus;
    item_created_at: Date;
    item_updated_at: Date;
    item_description: string;

    // Valores de negocio calculados
    line_revenue: number;    // Ingreso neto de la línea (precio * cant - desc)
    line_total_cost: number; // Lo que te costó a ti esa mercancía
    line_profit: number;     // Tu ganancia real en esa línea
}