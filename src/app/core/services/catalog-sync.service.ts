import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MetaProduct, BackendItem, ChangeRecord, sanitizeMetaProduct } from '../models/meta-model';

@Injectable({
    providedIn: 'root'
})
export class CatalogSyncService {
    private apiUrl = 'http://localhost:3000/api/products/perfumes';

    constructor(private http: HttpClient) { }

    syncCatalog(localCatalog: MetaProduct[]): Observable<{ updatedCatalog: MetaProduct[], changes: ChangeRecord[] }> {
        return this.http.get<BackendItem[]>(this.apiUrl).pipe(
            map(backendItems => {
                console.log(`Backend items count: ${backendItems.length}`);

                const updatedCatalog = [...localCatalog];
                const changes: ChangeRecord[] = [];

                // 1. Map for quick access
                const catalogMap = new Map<string, MetaProduct>();
                updatedCatalog.forEach(p => {
                    // Normalize remoteCode to string for comparison
                    if (p.remoteCode) {
                        catalogMap.set('' + p.remoteCode, p);
                    } else {
                        console.warn(`Product without remoteCode: ${JSON.stringify(p)}`);
                    }
                });

                // 2. Iterate backend items
                backendItems.forEach(item => {
                    // Normalize item code to string
                    const existingProduct = catalogMap.get('' + item.productCommercialCode);

                    if (existingProduct) {
                        // Update existing
                        const itemChanges: { field: string, oldValue: any, newValue: any }[] = [];

                        if (item.code != item.productCommercialCode) {
                            itemChanges.push({ field: 'COMPARE_remoteCode', oldValue: item.code, newValue: item.productCommercialCode });
                        }

                        // Ensure remoteCode matches code (e.g. string/number mismatches)
                        if (existingProduct.remoteCode != item.code) {
                            itemChanges.push({ field: 'remoteCode', oldValue: existingProduct.remoteCode, newValue: item.code });
                            existingProduct.remoteCode = item.code;
                        }

                        // Ensure productCommercialCode matches productCommercialCode (e.g. string/number mismatches)
                        if (existingProduct.productCommercialCode != item.productCommercialCode) {
                            itemChanges.push({ field: 'productCommercialCode', oldValue: existingProduct.productCommercialCode, newValue: item.productCommercialCode });
                            existingProduct.productCommercialCode = item.productCommercialCode;
                        }

                        // Map name -> title
                        if (existingProduct.title !== item.name) {
                            itemChanges.push({ field: 'title', oldValue: existingProduct.title, newValue: item.name });
                            existingProduct.title = item.name;
                        }

                        // Map description -> description (optional, but good fallback)
                        if (existingProduct.description !== item.description) {
                            // Only update if it seems to be a "default" description or we want to overwrite.
                            // For now, let's overwrite to keep in sync with "summary"
                            itemChanges.push({ field: 'description', oldValue: existingProduct.description, newValue: item.description });
                            if (item.description) {
                                existingProduct.description = item.description;
                            }
                        }

                        // Map originalPrice -> price
                        if (existingProduct.price !== item.originalPrice) {
                            itemChanges.push({ field: 'price', oldValue: existingProduct.price, newValue: item.originalPrice });
                            existingProduct.price = item.originalPrice;
                        }

                        // Map salePrice -> sale_price
                        if (existingProduct.sale_price !== item.salePrice) {
                            itemChanges.push({ field: 'sale_price', oldValue: existingProduct.sale_price, newValue: item.salePrice });
                            existingProduct.sale_price = item.salePrice;
                        }

                        // Map imageUrl -> image_link
                        if (existingProduct.image_link !== item.imageUrl) {
                            itemChanges.push({ field: 'image_link', oldValue: existingProduct.image_link, newValue: item.imageUrl });
                            existingProduct.image_link = item.imageUrl;
                        }

                        // Map secondImageUrl -> additional_image_link
                        if (existingProduct.additional_image_link !== item.secondImageUrl) {
                            itemChanges.push({ field: 'additional_image_link', oldValue: existingProduct.additional_image_link, newValue: item.secondImageUrl });
                            existingProduct.additional_image_link = item.secondImageUrl;
                        }

                        // Map url -> link
                        if (existingProduct.link !== item.url) {
                            itemChanges.push({ field: 'link', oldValue: existingProduct.link, newValue: item.url });
                            existingProduct.link = item.url;
                        }

                        // Map totalStock -> quantity_to_sell_on_facebook
                        if (existingProduct.quantity_to_sell_on_facebook !== item.totalStock) {
                            itemChanges.push({ field: 'quantity_to_sell_on_facebook', oldValue: existingProduct.quantity_to_sell_on_facebook, newValue: item.totalStock });
                            existingProduct.quantity_to_sell_on_facebook = item.totalStock;
                        }

                        // Availability logic based on totalStock
                        const newAvailability = item.totalStock > 0 ? 'in stock' : 'out of stock';
                        if (existingProduct.availability !== newAvailability) {
                            itemChanges.push({ field: 'availability', oldValue: existingProduct.availability, newValue: newAvailability });
                            existingProduct.availability = newAvailability;
                        }

                        // Map summary -> summary
                        if (existingProduct.summary !== item.summary) {
                            itemChanges.push({ field: 'summary', oldValue: existingProduct.summary, newValue: item.summary });
                            existingProduct.summary = item.summary;
                        }


                        if (itemChanges.length > 0) {
                            changes.push({
                                type: 'UPDATE',
                                product: existingProduct,
                                changes: itemChanges
                            });
                        }
                    } else {
                        console.warn(`Not found remoteCode: ${item.productCommercialCode} in map`);
                        // Create New
                        // sanitize to ensure mandatory fields have defaults ('UNKNOWN') if missing
                        const newProduct: MetaProduct = sanitizeMetaProduct({
                            id: this.generateRandomId(),
                            title: item.name,
                            description: item.description,
                            price: item.originalPrice,
                            sale_price: item.originalPrice,
                            availability: item.totalStock > 0 ? 'in stock' : 'out of stock',
                            quantity_to_sell_on_facebook: item.totalStock,
                            condition: 'new',
                            remoteCode: item.code,
                            productCommercialCode: item.productCommercialCode,
                            link: item.url,
                            image_link: item.imageUrl,
                            additional_image_link: item.secondImageUrl,
                            summary: item.summary,
                            brand: 'Yanbal' // Assumption or Default
                        });

                        updatedCatalog.push(newProduct);
                        changes.push({
                            type: 'NEW',
                            product: newProduct
                        });
                    }
                });

                return { updatedCatalog, changes };
            })
        );
    }

    private generateRandomId(): string {
        // Simple random ID generator if UUID is not available
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
