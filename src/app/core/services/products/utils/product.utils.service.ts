import { Injectable } from "@angular/core";
import { ProductCompleteEntity } from "src/app/shared/entity/view/product.complete.entity";
import { Product } from "src/app/core/models/products/product.model";
import { ProductStatusEnum } from "src/app/core/models/products/product.status.enum";
import { ProductAttributes, ProductAttributesGender, ProductAttributesUnit } from "src/app/core/models/products/product.attributes.model";
import { ProductCategory, ProductCategoryBreadcrumb } from "src/app/core/models/products/product.category.model";
import { ProductPricing } from "src/app/core/models/products/product.pricing.model";
import { ProductStockInfo } from "src/app/core/models/products/product.stock.info.model";

@Injectable({
    providedIn: 'root'
})
export class ProductUtilsService {

    constructor() { }

    mapProduct(product: ProductCompleteEntity): Product {
        return {
            id: product.product_id,
            created_at: product.product_created_at,
            updated_at: product.product_updated_at,
            sku: product.product_sku,
            ean: product.product_ean,
            name: product.product_name,
            description: product.product_description,
            summary: product.product_summary,
            category: this.getCategory(product),
            brand: product.brand_name,
            brand_id: product.brand_id,
            status: product.product_status as ProductStatusEnum,
            attributes: this.getAttributes(product),
            pricing: this.getPricing(product),
            stock: this.getStock(product),
            media: this.getMedia(product.product_media)
        };
    }

    private getMedia(media: any[] | null): any[] {
        if (!media) return [];
        return media.map(m => ({
            id: m.id,
            product_id: m.product_id,
            url: m.url,
            type: m.type,
            is_main: m.is_main,
            display_order: m.display_order,
            alt_text: m.alt_text,
            title: m.title,
            description: m.description,
            created_at: m.created_at ? new Date(m.created_at) : undefined,
            updated_at: m.updated_at ? new Date(m.updated_at) : undefined
        }));
    }

    private getCategory(product: ProductCompleteEntity): ProductCategory {
        return {
            id: product.category_id,
            name: product.category_leaf,
            full_path: product.category_full_path
        };
    }

    private getAttributes(product: ProductCompleteEntity): ProductAttributes {
        return {
            gender: product.attribute_gender as ProductAttributesGender,
            format: product.attribute_format,
            size: product.attribute_size,
            unit: product.attribute_unit as ProductAttributesUnit,
            claims: {
                is_vegan: product.attribute_is_vegan,
                is_cruelty_free: product.attribute_is_cruelty_free,
                is_refillable: product.attribute_is_refillable
            },
            inci: product.attribute_inci,
            pao: product.attribute_pao,
            notes: {
                top: product.attribute_notes?.top || [],
                heart: product.attribute_notes?.heart || [],
                base: product.attribute_notes?.base || []
            }
        };
    }

    private getPricing(product: ProductCompleteEntity): ProductPricing {
        return {
            price: product.price_original_price,
            currency: 'EUR',
            sale_price: product.price_sale_price,
            offer_start_date: product.price_offer_start,
            offer_end_date: product.price_offer_end
        };
    }

    private getStock(product: ProductCompleteEntity): ProductStockInfo {
        return {
            internal_stock: product.stock_available,
            manufacturer_stock: product.stock_external,
            min_stock_alert: product.product_min_stock_alert,
        };
    }

    getBreadcrumbs(fullPath: string | null): ProductCategoryBreadcrumb[] {
        if (!fullPath) return [];

        const parts = fullPath.split(' > ');
        let accumulatedPath = '/categories';

        return parts.map(part => {
            // Creamos el slug de esta parte (ej: "Cuidado Facial" -> "cuidado-facial")
            const slug = part.toLowerCase()
                .trim()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita acentos
                .replace(/\s+/g, '-'); // Espacios por guiones

            accumulatedPath += `/${slug}`; // Vamos sumando al path anterior

            return {
                label: part.trim(),
                url: accumulatedPath
            };
        });
    }
}