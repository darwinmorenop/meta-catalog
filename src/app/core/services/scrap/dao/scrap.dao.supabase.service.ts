import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { environment } from 'src/environments/environment';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { ScrapEntity } from 'src/app/shared/entity/scrap.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';
import { ScrapRcpEntity, ScrapRcpInsertEntity, ScrapRcpResponseEntity } from 'src/app/shared/entity/rcp/scrap.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class ScrapDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ScrapDaoSupabaseService.name;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }


  getAllProductsScrap(): Observable<ProductScrapEntity[]> {
    const promise = this.supabase
      .from('v_product_for_scrapping')
      .select('*')
      .order('product_name', { ascending: true });
    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        const data = (response.data as any[]) || [];
        return data.map(item => ({
          ...item,
          last_scraped_at: this.dateUtils.parseDbDate(item.last_scraped_at),
        })) as ProductScrapEntity[];
      }),
      catchError(error => {
        console.error('Error fetching products for scrap:', error);
        return of([]);
      })
    );
  }


  getProductsScrapById(scrapId: number): Observable<ProductScrapEntity[]> {
    const promise = this.supabase
      .from('v_product_for_scrapping')
      .select('*')
      .eq('source_scrap_id', scrapId)
      .order('product_name', { ascending: true });
    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        const data = (response.data as any[]) || [];
        return data.map(item => ({
          ...item,
          last_scraped_at: this.dateUtils.parseDbDate(item.last_scraped_at),
        })) as ProductScrapEntity[];
      }),
      catchError(error => {
        console.error('Error fetching products for scrap:', error);
        return of([]);
      })
    );
  }

  getProductScrapDetail(scrapId: number, productId: number): Observable<ProductScrapEntity | null> {
    const promise = this.supabase
      .from('v_product_for_scrapping')
      .select('*')
      .eq('source_scrap_id', scrapId)
      .eq('product_id', productId)
      .single();
    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        if (!response.data) return null;
        return {
          ...response.data,
          last_scraped_at: this.dateUtils.parseDbDate(response.data.last_scraped_at),
        } as ProductScrapEntity;
      }),
      catchError(error => {
        console.error('Error fetching product scrap detail:', error);
        return of(null);
      })
    );
  }

  getAll(): Observable<ScrapEntity[]> {
    return from(
      this.supabase
        .from('scrap')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => (res.data || []).map(item => this.mapScrap(item)))
    );
  }

  getAllSummary(): Observable<ScrapSummaryEntry[]> {
    return from(
      this.supabase
        .from('v_scrap_summary')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => (res.data || []).map(item => this.mapScrapSummary(item)))
    );
  }

  delete(id: number): Observable<any> {
    return from(
      this.supabase
        .from('scrap')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }

  applyChangesAll(changes: ProductScrapSyncPendingChange[], scrapId: number): Observable<any> {
    if (changes.length === 0) return of([]);
    const createChanges = changes.filter(c => c.type === 'CREATE');
    const updateChanges = changes.filter(c => c.type === 'UPDATE');
    const archiveChanges = changes.filter(c => c.type === 'ARCHIVE');
    const requests = [];
    if (createChanges.length > 0) requests.push(this.createProducts(createChanges, scrapId));
    if (updateChanges.length > 0) requests.push(of(this.getDefaultResponse()));
    if (archiveChanges.length > 0) requests.push(of(this.getDefaultResponse()));
    return forkJoin(requests);
  }

  applyChanges(changes: ProductScrapSyncPendingChange[], scrapId: number): Observable<ScrapRcpResponseEntity> {
    if (changes.length === 0) return of(this.getDefaultResponse());
    const type = changes[0].type;
    if (type === 'CREATE') return this.createProducts(changes, scrapId);
    return of(this.getDefaultResponse());
  }

  private getDefaultResponse(): ScrapRcpResponseEntity {
    return {
      success: false,
      scrap_id: 0,
      total_processed: 0
    };
  }

  private createProducts(changes: ProductScrapSyncPendingChange[], scrapId: number): Observable<ScrapRcpResponseEntity> {
    const clientName = changes[0].originalScrap.clientScrap;
    const products: ScrapRcpInsertEntity[] = changes.map(c => {
      return {
        name: c.originalScrap.name,
        description: c.originalScrap.description,
        summary: c.originalScrap.summary,
        manufacturer_ref: c.manufacturerRef,
        url_source: c.originalScrap.urlSource,
        url: c.originalScrap.url,
        scrap_id: scrapId,
        original_price: c.originalScrap.originalPrice,
        sale_price: c.originalScrap.salePrice,
        stock_status: c.originalScrap.totalStock
      };
    });
    const dataToSend: ScrapRcpEntity = {
      p_scrap_client: clientName,
      p_scrap_id: scrapId,
      p_sources: products
    };
    this.logger.info(`Sending data to Supabase: ${JSON.stringify(dataToSend)}`, this.CLASS_NAME);
    return from(this.supabase.rpc('fn_scrap_insert', dataToSend)).pipe(
      map(res => res.data as ScrapRcpResponseEntity)
    );
  }

  private mapScrap(item: any): ScrapEntity {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
    };
  }
  private mapScrapSummary(item: any): ScrapSummaryEntry {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
    };
  }
}