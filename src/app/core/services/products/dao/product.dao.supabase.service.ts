import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProductCompleteEntity } from 'src/app/shared/entity/view/product.complete.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { ProductEntity } from 'src/app/shared/entity/product.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ProductDaoSupabaseService.name;

  constructor() {
  }

  getProductsComplete(): Observable<ProductCompleteEntity[]> {
    const context = 'getProductsComplete'
    const promise = this.supabaseService.getSupabaseClient()
      .from('v_product_complete')
      .select('*');

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        const data = (response.data as any[]) || [];
        return data.map(item => ({
          ...item,
          product_created_at: this.dateUtils.parseDbDate(item.product_created_at),
          product_updated_at: this.dateUtils.parseDbDate(item.product_updated_at)
        })) as ProductCompleteEntity[];
      }),
      catchError(error => {
        this.logger.error('Error fetching products:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  getProducts(): Observable<ProductEntity[]> {
    const context = 'getProducts'
    const promise = this.supabaseService.getSupabaseClient()
      .from('product')
      .select('*');

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        const data = (response.data as any[]) || [];
        return data.map(item => ({
          ...item,
          created_at: this.dateUtils.parseDbDate(item.created_at),
          updated_at: this.dateUtils.parseDbDate(item.updated_at)
        })) as ProductEntity[];
      }),
      catchError(error => {
        this.logger.error('Error fetching products:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  getProductCompleteById(id: number): Observable<ProductCompleteEntity | null> {
    const context = 'getProductCompleteById'
    const promise = this.supabaseService.getSupabaseClient()
      .from('v_product_complete')
      .select('*')
      .eq('product_id', id)
      .single();

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => {
        const item = response.data;
        if (!item) return null;
        return {
          ...item,
          product_created_at: this.dateUtils.parseDbDate(item.product_created_at),
          product_updated_at: this.dateUtils.parseDbDate(item.product_updated_at)
        } as ProductCompleteEntity;
      }),
      catchError(error => {
        this.logger.error(`Error fetching product complete with id ${id}:`, error, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

}