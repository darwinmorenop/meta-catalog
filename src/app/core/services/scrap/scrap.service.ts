import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { ProductDaoSupabaseService } from 'src/app/core/services/products/dao/product.dao.supabase.service';
import { CampaignDaoSupabaseService } from '../campaigns/dao/campaign.dao.supabase.service';
import { ProductScrap } from '../../models/products/scrap/product.scrap.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductScrapSyncOptions, ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { ScrapDaoSupabaseService } from './dao/scrap.dao.supabase.service';
import { ScrapEntity } from 'src/app/shared/entity/scrap.entity';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';

@Injectable({
    providedIn: 'root'
})
export class ScrapService {
    private baseUrl = 'http://localhost:3000/api/products';
    private categories = ['perfumes'];
    private http: HttpClient = inject(HttpClient);
    private scrapDaoSupabaseService: ScrapDaoSupabaseService = inject(ScrapDaoSupabaseService);
    private loggerService: LoggerService = inject(LoggerService);
    private readonly CLASS_NAME = ScrapService.name;
    private currentProduct = signal<ProductScrapEntity | null>(null);

    setCurrentProduct(product: ProductScrapEntity | null) {
        this.loggerService.debug(`Setting current product: ${JSON.stringify(product)}`, this.CLASS_NAME);
        this.currentProduct.set(product);
    }

    getAndClearCurrentProduct(): ProductScrapEntity | null {
        const product = this.currentProduct();
        this.currentProduct.set(null);
        return product;
    }

    getAll(): Observable<ScrapEntity[]> {
        return this.scrapDaoSupabaseService.getAll();
    }

    getAllSummary(): Observable<ScrapSummaryEntry[]> {
        return this.scrapDaoSupabaseService.getAllSummary();
    }

    getProductsByScrapId(scrapId: number): Observable<ProductScrapEntity[]> {
        return this.scrapDaoSupabaseService.getProductsScrapById(scrapId);
    }

    getProductScrapDetail(scrapId: number, productId: number): Observable<ProductScrapEntity | null> {
        return this.scrapDaoSupabaseService.getProductScrapDetail(scrapId, productId);
    }

    applyChanges(changes: ProductScrapSyncPendingChange[], scrapId: number): Observable<any> {
        return this.scrapDaoSupabaseService.applyChanges(changes, scrapId);
    }

    applyChangesAll(changes: ProductScrapSyncPendingChange[], scrapId: number): Observable<any> {
        return this.scrapDaoSupabaseService.applyChangesAll(changes, scrapId);
    }

    delete(scrapId: number): Observable<any> {
        return this.scrapDaoSupabaseService.delete(scrapId);
    }

    getChanges(options: ProductScrapSyncOptions): Observable<ProductScrapSyncPendingChange[]> {
        return forkJoin({
            scrap: this.getAllProductsScrap(),
            db: this.scrapDaoSupabaseService.getAllProductsScrap()
        }).pipe(
            map(({ scrap, db }) => {
                const changes: ProductScrapSyncPendingChange[] = [];
                const dbMap = new Map(db.map(p => [p.product_manufacturer_ref, p]));
                const scrapMap = new Map(scrap.map(s => [s.code, s]));

                // 1. Detectar Nuevos y Actualizaciones
                scrap.forEach(item => {
                    const existing = dbMap.get(item.code);

                    if (!existing) {
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
                this.loggerService.info(`Synced ${changes.length} products`, this.CLASS_NAME);
                this.loggerService.debug(`Synced products:${JSON.stringify(changes)}`, this.CLASS_NAME);
                return changes;
            })
        );
    }

    private getAllProductsScrap(): Observable<ProductScrap[]> {
        // 1. Prepare Backend Requests
        const backendRequests = this.categories.map(category =>
            //this.http.get<ProductScrap[]>(`${this.baseUrl}/${category}`)
            this.http.get<ProductScrap[]>(`scrap.request.json`)
        );

        // 2. Fetch Backend Data AND Campaign Codes in parallel
        return forkJoin(backendRequests).pipe(map(results => results.flat()));
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