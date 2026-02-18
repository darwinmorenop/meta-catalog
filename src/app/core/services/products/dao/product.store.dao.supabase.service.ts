import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ProductCompleteEntity } from 'src/app/shared/entity/view/product.complete.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';
import { ProductStoreCompleteRpcEntity } from 'src/app/shared/entity/rcp/product/product.store.complete.rpc.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductStoreDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ProductStoreDaoSupabaseService.name;

  constructor() {
  }

  get(userId: string): Observable<ProductStoreCompleteRpcEntity[]> {
    const context = 'get'
    const promise = this.supabaseService.getSupabaseClient()
      .rpc('fn_get_products_with_user_context', { p_user_id: userId });

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        this.logger.debug(`Received data`, this.CLASS_NAME, context)
        const data = (response.data as any[]) || [];
        return data.map(item => ({
          ...item,
          product_created_at: this.dateUtils.parseDbDate(item.product_created_at),
          product_updated_at: this.dateUtils.parseDbDate(item.product_updated_at)
        })) as ProductStoreCompleteRpcEntity[];
      }),
      catchError(error => {
        this.logger.error('Error fetching products:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  toggleFav(userId: string, productId: number): Observable<boolean | null> {
    const context = 'toggleFav'
    const promise = this.supabaseService.getSupabaseClient()
      .rpc('fn_toggle_favorite', { p_user_id: userId, p_product_id: productId });

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => response.data),
      catchError(error => {
        this.logger.error('Error toggleFav for product:' + productId, error, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

  changeQuantity(user_id: string, product_id: number, delta: number): Observable<number | null> {
    const context = 'changeQuantity'
    const dataToSend = {
      p_user_id: user_id,
      p_product_id: product_id,
      p_qty: delta
    };

    return from(
      this.supabaseService.getSupabaseClient()
        .rpc('fn_change_cart_quantity', dataToSend)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as number; // Retorna la cantidad final
      }),
      catchError(error => {
        this.logger.error('Error in changeQuantity RPC:', error, this.CLASS_NAME, context);
        return of(null); // Indicamos fallo para el rollback
      })
    );
  }

  toggleStockNotifier(userId: string, productId: number): Observable<boolean | null> {
    const context = 'toggleStockNotifier'
    return from(
      this.supabaseService.getSupabaseClient()
        .rpc('fn_toggle_stock_notifier', { p_user_id: userId, p_product_id: productId })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as boolean;
      }),
      catchError(err => {
        this.logger.error('Error in toggleStockNotifier:', err, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

  toggleTracking(userId: string, productId: number): Observable<boolean | null> {
    const context = 'toggleTracking'
    const promise = this.supabaseService.getSupabaseClient()
      .rpc('fn_toggle_tracking', { p_user_id: userId, p_product_id: productId });

    return from(promise).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as boolean;
      }),
      catchError(err => {
        this.logger.error('Error in toggleTracking:', err, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

}