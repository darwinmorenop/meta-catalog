import { Injectable } from "@angular/core";
import { ProductCompleteEntity } from "src/app/shared/entity/product.complete.entity";
import { Product } from "src/app/core/models/products/product.model";
import { ProductStatusEnum } from "src/app/core/models/products/product.status.enum";
import { ProductAttributesGender, ProductAttributesUnit } from "src/app/core/models/products/product.attributes.model";
import { ProductCategoryBreadcrumb } from "src/app/core/models/products/product.category.model";

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
            category: {
                name: product.category_leaf,
                full_path: product.category_full_path
            },
            brand: product.brand_name,
            status: product.product_status as ProductStatusEnum,
            attributes: {
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
            },
            pricing: {
                id: '', 
                product_id: String(product.product_id),
                price: product.product_price,
                currency: 'EUR',
                created_at: product.product_created_at,
                updated_at: product.product_updated_at
            },
            stock: {
                id: 0,
                sku: product.product_sku,
                internal_stock: product.product_stock,
                manufacturer_stock: product.product_manufacturer_stock,
                min_stock_alert: product.product_min_stock_alert,
                weight_grams: 0,
                dimensions: ''
            },
            media: [] // product.product_media requiere mapeo a la interfaz ProductMedia
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