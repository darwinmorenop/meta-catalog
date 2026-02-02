import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of, forkJoin } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { ProductScrapSyncOptions, ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { environment } from 'src/environments/environment';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { ProductScrapEntity, ProductWithSourcesEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { ScrapEntity } from 'src/app/shared/entity/scrap.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ScrapReadDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ScrapReadDaoSupabaseService.name;

  constructor() {
  }

  getProductsScrapById(scrapId: number): Observable<ProductScrapEntity[]> {
    const context = 'getProductsScrapById';
    const promise = this.supabaseService.getSupabaseClient()
      .from('v_product_scrap_report')
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
        this.logger.error('Error fetching products for scrap:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  getProductScrapDetail(scrapId: number, productId: number): Observable<ProductScrapEntity | null> {
    const context = 'getProductScrapDetail';
    const promise = this.supabaseService.getSupabaseClient()
      .from('v_product_scrap_report')
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
        this.logger.error('Error fetching product scrap detail:', error, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

  getAll(): Observable<ScrapEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('scrap')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => (res.data || []).map(item => this.mapScrap(item)))
    );
  }

  getById(id: number): Observable<ScrapEntity> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('scrap')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(res => this.mapScrap(res.data))
    );
  }

  getAllSummary(): Observable<ScrapSummaryEntry[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('v_scrap_summary')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => (res.data || []).map(item => this.mapScrapSummary(item)))
    );
  }

  getSummaryById(id: number): Observable<ScrapSummaryEntry> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('v_scrap_summary')
        .select('*')
        .eq('scrap_id', id)
        .single()
    ).pipe(
      map(res => this.mapScrapSummary(res.data))
    );
  }

  getProductsWithSources(productId?: number): Observable<ProductWithSourcesEntity[]> {
    const context = 'getProductsWithSources';

    let query = this.supabaseService.getSupabaseClient()
      .from('v_product_sources_aggregated')
      .select('*');

    // Si quieres filtrar por un producto específico
    if (productId) {
      query = query.eq('product_id', productId);
    }

    return from(query).pipe(
      map(response => {
        if (response.error) throw response.error;
        const data = (response.data as any[]) || [];

        // Mapeo para formatear fechas dentro del array anidado
        return data.map(product => ({
          ...product,
          sources: product.sources.map((src: any) => ({
            ...src,
            scraped_at: this.dateUtils.parseDbDate(src.scraped_at),
            scrap_created_at: this.dateUtils.parseDbDate(src.scrap_created_at)
          }))
        })) as ProductWithSourcesEntity[];
      }),
      catchError(error => {
        this.logger.error('Error fetching aggregated products/sources:', error, this.CLASS_NAME, context);
        return of([]);
      })
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