import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ScrapWriteDaoSupabaseService } from './dao/scrap.write.dao.supabase.service';
import { ScrapEntity } from 'src/app/shared/entity/scrap.entity';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';
import { ScrapRcpResponseEntity } from 'src/app/shared/entity/rcp/scrap.rcp.entity';
import { ProductScrapSyncOptions, ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { ScrapReadDaoSupabaseService } from 'src/app/core/services/scrap/dao/scrap.read.dao.supabase.service';

@Injectable({
    providedIn: 'root'
})
export class ScrapService {
    private scrapWriteDaoSupabaseService: ScrapWriteDaoSupabaseService = inject(ScrapWriteDaoSupabaseService);
    private scrapReadDaoSupabaseService: ScrapReadDaoSupabaseService = inject(ScrapReadDaoSupabaseService);
    private loggerService: LoggerService = inject(LoggerService);
    private readonly CLASS_NAME = ScrapService.name;
    private currentProduct = signal<ProductScrapEntity | null>(null);

    setCurrentProduct(product: ProductScrapEntity | null) {
        const context = 'setCurrentProduct'
        this.loggerService.debug(`Setting current product: ${JSON.stringify(product)}`, this.CLASS_NAME, context);
        this.currentProduct.set(product);
    }

    getAndClearCurrentProduct(): ProductScrapEntity | null {
        const product = this.currentProduct();
        this.currentProduct.set(null);
        return product;
    }

    getAll(): Observable<ScrapEntity[]> {
        return this.scrapReadDaoSupabaseService.getAll();
    }

    getById(id: number): Observable<ScrapEntity> {
        return this.scrapReadDaoSupabaseService.getById(id);
    }

    getAllSummary(): Observable<ScrapSummaryEntry[]> {
        return this.scrapReadDaoSupabaseService.getAllSummary();
    }

    getSummaryById(id: number): Observable<ScrapSummaryEntry> {
        return this.scrapReadDaoSupabaseService.getSummaryById(id);
    }

    getProductsByScrapId(scrapId: number): Observable<ProductScrapEntity[]> {
        return this.scrapReadDaoSupabaseService.getProductsScrapById(scrapId);
    }

    getProductScrapDetail(scrapId: number, productId: number): Observable<ProductScrapEntity | null> {
        return this.scrapReadDaoSupabaseService.getProductScrapDetail(scrapId, productId);
    }

    applyChanges(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
        return this.scrapWriteDaoSupabaseService.applyChanges(changes, scrapId, options);
    }

    applyChangesAll(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
        return this.scrapWriteDaoSupabaseService.applyChangesAll(changes, scrapId, options);
    }

    delete(scrapId: number): Observable<any> {
        return this.scrapWriteDaoSupabaseService.delete(scrapId);
    }

    getAllProductsScrap(): Observable<ProductScrapEntity[]> {
        return this.scrapReadDaoSupabaseService.getAllProductsScrap();
    }

}