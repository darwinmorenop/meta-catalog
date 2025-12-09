import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, switchMap } from 'rxjs';
import { MetaProduct, BackendItem, ChangeRecord, sanitizeMetaProduct } from '../models/meta-model';
import { GoogleSheetsService } from './google-sheets.service';

@Injectable({
    providedIn: 'root'
})
export class CatalogSyncService {
    private baseUrl = 'http://localhost:3000/api/products';
    private categories = ['perfumes'];

    constructor(
        private http: HttpClient,
        private googleSheetsService: GoogleSheetsService
    ) { }

    syncCatalog(localCatalog: MetaProduct[]): Observable<{ updatedCatalog: MetaProduct[], changes: ChangeRecord[] }> {
        // 1. Prepare Backend Requests
        const backendRequests = this.categories.map(category =>
            this.http.get<BackendItem[]>(`${this.baseUrl}/${category}`).pipe(
                map(items => items.map(item => ({ ...item, category }))) // Attach category to each item
            )
        );

        // 2. Fetch Backend Data AND Campaign Codes in parallel
        return forkJoin({
            backendItems: forkJoin(backendRequests).pipe(map(results => results.flat())),
            campaignMap: this.googleSheetsService.getCatalogCampaignCodes()
        }).pipe(
            map(({ backendItems, campaignMap }) => {
                console.log(`Total backend items count: ${backendItems.length}`);

                const updatedCatalog = [...localCatalog];
                const changes: ChangeRecord[] = [];

                // --- SYNC LOGIC (Backend vs Local) ---

                // 1. Map for quick access
                const catalogMap = new Map<string, MetaProduct>();
                const backendCodes = new Set<string>();

                updatedCatalog.forEach(p => {
                    // Normalize remoteCode to string for comparison
                    if (p.remoteCode) {
                        catalogMap.set('' + p.remoteCode, p);
                    } else {
                        console.warn(`Product without remoteCode: ${JSON.stringify(p)}`);
                    }
                });

                // 2. Identify Backend Codes
                backendItems.forEach((item: BackendItem) => {
                    backendCodes.add('' + item.code);
                });

                // 3. Mark missing items as ARCHIVED
                updatedCatalog.forEach(p => {
                    if (p.remoteCode && !backendCodes.has('' + p.remoteCode)) {
                        if (p.status !== 'archived') {
                            changes.push({
                                type: 'UPDATE',
                                product: p,
                                changes: [{ field: 'status', oldValue: p.status, newValue: 'archived' }]
                            });
                            p.status = 'archived';
                        }
                    }
                });

                // 4. Iterate backend items (Update/Create)
                backendItems.forEach((item: BackendItem) => {
                    // Normalize item code to string
                    const existingProduct = catalogMap.get('' + item.code);

                    if (existingProduct) {
                        // Update existing
                        const itemChanges: { field: string, oldValue: any, newValue: any }[] = [];

                        // Always set status to active if found
                        if (existingProduct.status !== 'active') {
                            itemChanges.push({ field: 'status', oldValue: existingProduct.status, newValue: 'active' });
                            existingProduct.status = 'active';
                        }

                        // Ensure remoteCode matches code (e.g. string/number mismatches)
                        if (existingProduct.remoteCode != item.code) {
                            itemChanges.push({ field: 'remoteCode', oldValue: existingProduct.remoteCode, newValue: item.code });
                            existingProduct.remoteCode = item.code;
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
                        console.warn(`Not found remoteCode: ${item.code} in map`);
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
                            link: item.url,
                            image_link: item.imageUrl,
                            additional_image_link: item.secondImageUrl,
                            summary: item.summary,
                            status: 'active', // Default to active for new items
                            brand: 'Yanbal' // Assumption or Default
                        });

                        updatedCatalog.push(newProduct);
                        changes.push({
                            type: 'NEW',
                            product: newProduct
                        });
                    }
                });

                // --- ENRICHMENT LOGIC (Apply Campaign Codes) ---
                console.log('Enriching synced catalog with campaign codes (Post-Processing)...');

                const localProductSet = new Set(localCatalog);
                const changeMap = new Map<MetaProduct, ChangeRecord>();
                changes.forEach(c => changeMap.set(c.product, c));

                updatedCatalog.forEach(product => {
                    const campaignCode = campaignMap.get(String(product.id).trim());
                    const newCode = campaignCode || 'N/A';
                    const currentCode = product.productCommercialCode;

                    if (currentCode !== newCode) {
                        // Apply change
                        product.productCommercialCode = newCode;

                        // Log change if product is NOT NEW (exists in localCatalog)
                        if (localProductSet.has(product)) {
                            let record = changeMap.get(product);
                            if (!record) {
                                record = { type: 'UPDATE', product: product, changes: [] };
                                changes.push(record);
                                changeMap.set(product, record);
                            }

                            if (record.type === 'UPDATE') {
                                if (!record.changes) {
                                    record.changes = [];
                                }
                                record.changes.push({
                                    field: 'productCommercialCode',
                                    oldValue: currentCode,
                                    newValue: newCode
                                });
                            }
                        }
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
