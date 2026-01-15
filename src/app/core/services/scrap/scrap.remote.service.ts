import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap } from 'rxjs';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductScrapSyncOptions, ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { ProductScrap } from 'src/app/core/models/products/scrap/product.scrap.model';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';

@Injectable({
    providedIn: 'root'
})
export class ScrapRemoteService {
    
    private baseUrl = 'http://localhost:3000/api/products';
    private categories = ['perfumes'];
    private http: HttpClient = inject(HttpClient);
    private scrapService: ScrapService = inject(ScrapService);
    private loggerService: LoggerService = inject(LoggerService);
    private readonly CLASS_NAME = ScrapRemoteService.name;

    getChanges(options: ProductScrapSyncOptions): Observable<{ changes: ProductScrapSyncPendingChange[], scrapSize: number }> {
        const context = 'getChanges';
        this.loggerService.debug(`Starting`, this.CLASS_NAME, context);
        return forkJoin({
            scrap: this.getAllProductsScrap(),
            db: this.scrapService.getAllProductsScrap()
        }).pipe(
            map(({ scrap, db }) => {
                const changes: ProductScrapSyncPendingChange[] = [];
                const dbMap = new Map(db.map(p => [p.product_manufacturer_ref, p]));
                const scrapMap = new Map(scrap.map(s => [s.code, s]));

                // 1. Detectar Nuevos y Actualizaciones
                scrap.forEach(item => {
                    const existing = dbMap.get(item.code);

                    if (!existing) {
                        this.loggerService.debug(`New product: ${item.code} found in dbMap:${[...dbMap.keys()]}`, this.CLASS_NAME, context);
                        if (options.syncStatus) {
                            changes.push({
                                manufacturerRef: item.code,
                                productName: item.name,
                                type: 'CREATE',
                                fields: [{ field: 'all', oldValue: null, newValue: item }],
                                saved: false,
                                originalScrap: item
                            });
                        }
                    } else {
                        const updates = this.calculateDiff(existing, item, options);
                        if (updates.length > 0) {
                            changes.push({
                                productId: existing.product_id,
                                manufacturerRef: item.code,
                                productName: item.name,
                                type: 'UPDATE',
                                fields: updates,
                                saved: false,
                                originalScrap: item
                            });
                        } else {
                            this.loggerService.debug(`No updates found for product ${item.code}`, this.CLASS_NAME, context);
                        }
                    }
                });

                // 2. Detectar para Archivar (Si no están en el scrap)
                if (options.syncStatus) {
                    db.forEach(p => {
                        if (!scrapMap.has(p.product_manufacturer_ref) && p.source_status !== 'archived') {
                            changes.push({
                                productId: p.product_id,
                                manufacturerRef: p.product_manufacturer_ref,
                                productName: p.product_name,
                                type: 'ARCHIVE',
                                fields: [{ field: 'source_status', oldValue: p.source_status, newValue: 'archived' }],
                                saved: false,
                                originalScrap: {} as any // Opcional
                            });
                        }
                    });
                }
                this.loggerService.info(`Recovered: ${scrap.length}, synced:${changes.length}`, this.CLASS_NAME, context);
                this.loggerService.debug(`Recovered: ${scrap.length}, synced:${JSON.stringify(changes)}`, this.CLASS_NAME, context);
                return { changes, scrapSize: scrap.length };
            })
        );
    }

    private getAllProductsScrap(): Observable<ProductScrap[]> {
        const categoriesArray = this.categories.join(',');
        return this.http.get<ProductScrap[]>(`scrap.request.json`);
        //return this.http.get<ProductScrap[]>(`${this.baseUrl}/${categoriesArray}`);
    }


    private calculateDiff(existing: ProductScrapEntity, scrap: ProductScrap, options: ProductScrapSyncOptions) {
        const diff: { field: string; oldValue: any; newValue: any }[] = [];

        if (options.syncPrices) {
            if (existing.source_sale_price !== scrap.salePrice) {
                diff.push({ field: 'salePrice', oldValue: existing.source_sale_price, newValue: scrap.salePrice });
            }
            if (existing.source_original_price !== scrap.originalPrice) {
                diff.push({ field: 'originalPrice', oldValue: existing.source_original_price, newValue: scrap.originalPrice });
            }
        }

        if (options.syncStock) {
            if (existing.source_stock !== scrap.totalStock) {
                diff.push({ field: 'stock', oldValue: existing.source_stock, newValue: scrap.totalStock });
            }
        }

        if (options.syncProperties) {
            if (existing.product_name !== scrap.name) {
                diff.push({ field: 'name', oldValue: existing.product_name, newValue: scrap.name });
            }
            if (existing.product_description !== scrap.description) {
                diff.push({ field: 'description', oldValue: existing.product_description, newValue: scrap.description });
            }
            if (existing.product_summary !== scrap.summary) {
                diff.push({ field: 'summary', oldValue: existing.product_summary, newValue: scrap.summary });
            }
        }

        return diff;
    }
}