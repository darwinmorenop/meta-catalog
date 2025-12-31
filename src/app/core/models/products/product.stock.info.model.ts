export interface ProductStockInfo {
    id: number;
    sku: string;
    internal_stock: number;
    manufacturer_stock: number;
    min_stock_alert: number;
    weight_grams: number;
    dimensions: string; // JSON (length, width, height)
}