import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductDashboardPriceEntity } from 'src/app/shared/entity/view/product.price.dashboard.entity';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductPriceDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ProductPriceDaoSupabaseService.name;
  private readonly TABLE_NAME = 'price_history';
  private readonly VIEW_DASHBOARD_NAME = 'v_product_price_dashboard';

  constructor() {
  }

  getPriceHistoryByProductId(productId: string): Observable<PriceHistoryEntity[]> {
    const context = 'getPriceHistoryByProductId';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('product_id', productId)
      .order('updated_at', { ascending: false });

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => (response.data?.map(item => this.mapEntity(item)) ?? []) || []),
      catchError(error => {
        this.logger.error(`Error fetching media for product ${productId}:`, error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  getAllPriceHistoryDashboardData(): Observable<ProductDashboardPriceEntity[]> {
    const context = 'getAllPriceHistoryDashboardData';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.VIEW_DASHBOARD_NAME)
      .select('*')

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => (response.data?.map(item => this.mapDashboardEntity(item)) ?? []) || []),
      catchError(error => {
        this.logger.error('Error fetching all media:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  createPriceHistory(priceHistory: Partial<PriceHistoryEntity> & { product_id: string }): Observable<boolean> {
    const context = 'createPriceHistory';
    this.logger.debug(`Creating price history for product ${priceHistory.product_id}`, this.CLASS_NAME, context);
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .insert(priceHistory);

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(() => true),
      catchError(error => {
        this.logger.error(`Error creating price history:`, error, this.CLASS_NAME, context);
        return of(false);
      })
    );
  }

  updatePriceHistory(id: number, priceHistory: Partial<PriceHistoryEntity>): Observable<boolean> {
    const context = 'updatePriceHistory';
    this.logger.debug(`Updating price history for product ${id} with data:${JSON.stringify(priceHistory)}`, this.CLASS_NAME, context);
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .update(priceHistory)
      .eq('id', id);

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(() => true),
      catchError(error => {
        this.logger.error(`Error updating ${id}:`, error, this.CLASS_NAME, context);
        return of(false);
      })
    );
  }

  deletePriceHistory(id: number): Observable<boolean> {
    const context = 'deletePriceHistory';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(() => true),
      catchError(error => {
        this.logger.error(`Error deleting ${id}:`, error, this.CLASS_NAME, context);
        return of(false);
      })
    );
  }

  private mapDashboardEntity(entity: any): ProductDashboardPriceEntity {
    return {
      product_id: entity.product_id,
      product_main_image: entity.product_main_image,
      product_name: entity.product_name,
      product_sku: entity.product_sku,
      product_ean: entity.product_ean,
      product_status: entity.product_status,
      category_id: entity.category_id,
      category_name: entity.category_name,
      price_list: entity.price_list?.map((p: any) => this.mapEntity(p)) ?? [],
      total_price_count: entity.total_price_count
    };
  }

  private mapEntity(entity: any): PriceHistoryEntity {
    return {
      id: entity.id,
      original_price: entity.original_price,
      sale_price: entity.sale_price,
      offer_start: this.dateUtils.parseDbDate(entity.offer_start),
      offer_end: this.dateUtils.parseDbDate(entity.offer_end),
      is_active: entity.is_active,
      reason: entity.reason,
      created_at: this.dateUtils.parseDbDate(entity.created_at),
      updated_at: this.dateUtils.parseDbDate(entity.updated_at),
    };
  }

}
