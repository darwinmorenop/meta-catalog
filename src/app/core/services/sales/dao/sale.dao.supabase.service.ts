import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SaleDashboardEntity, SaleDetailedEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { ProductSalesStats, SaleInsertRcpEntity, UpsertSaleRequest, UpsertSaleResponse } from 'src/app/shared/entity/rcp/sale.rcp.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { SaleStatusLabels } from 'src/app/shared/entity/sale.entity';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SaleDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = SaleDaoSupabaseService.name;

  constructor() {
  }

  getAllDashboardData(userIds?: string[]): Observable<SaleDashboardEntity[]> {
    const context = 'getAllDashboardData';
    let query = this.supabaseService.getSupabaseClient()
      .from('v_sales_summary_detailed')
      .select('*');

    if (userIds && userIds.length > 0) {
      query = query.or(`user_source_id.in.(${userIds.join(',')}),user_target_id.in.(${userIds.join(',')})`);
    }

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error fetching sale dashboard data:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => this.mapFromDashboardEntity(item))),
      catchError(error => {
        this.logger.error('Fatal error fetching sale dashboard data:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  saveSale(sale: SaleInsertRcpEntity): Observable<UpsertSaleResponse> {
    const context = 'saveSale';
    const saleToSend : UpsertSaleRequest = {
      p_sale_data: sale
    }
    this.logger.debug(`Saving sale with data: ${JSON.stringify(sale)}`, this.CLASS_NAME, context);
    const promise = this.supabaseService.getSupabaseClient()
    .rpc('upsert_sale_with_items', saleToSend);

    return from(promise).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in saveSale:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => response.data as UpsertSaleResponse),
      catchError(error => {
        this.logger.error('Fatal error in saveSale:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  getSaleByIdDetailedData(id: number): Observable<SaleDetailedEntity[]> {
    const context = 'getSaleByIdDetailedData';
    const query = this.supabaseService.getSupabaseClient()
      .from('v_sale_full_details')
      .select('*')
      .eq('sale_id', id);

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error fetching detailed sale data:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => this.mapFromDetailedEntity(item))),
      catchError(error => {
        this.logger.error('Fatal error fetching detailed sale data:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  getSalesStats(userIds?: string[]): Observable<ProductSalesStats[]> {
    const context = 'getSalesStats';
    const promise = this.supabaseService.getSupabaseClient()
    .rpc('get_product_sales_stats', {
      p_user_ids: userIds || null
    });

    return from(promise).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getSalesStats:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => response.data as ProductSalesStats[]),
      catchError(error => {
        this.logger.error('Fatal error in getSalesStats:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  getSalesByProductId(productId: number, userIds?: string[]): Observable<SaleDetailedEntity[]> {
    const context = 'getSalesByProductId';
    let query = this.supabaseService.getSupabaseClient()
      .from('v_sale_full_details')
      .select('*')
      .eq('product_id', productId);

    if (userIds && userIds.length > 0) {
      query = query.or(`source_user_id.in.(${userIds.join(',')}),target_user_id.in.(${userIds.join(',')})`);
    }

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getSalesByProductId:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => this.mapFromDetailedEntity(item))),
      catchError(error => {
        this.logger.error('Fatal error in getSalesByProductId:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  private mapFromDashboardEntity(item: any): SaleDashboardEntity {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at),
      sale_overall_status_label: SaleStatusLabels[item.sale_overall_status as keyof typeof SaleStatusLabels] || item.sale_overall_status
    } as any;
  }

  private mapFromDetailedEntity(item: any): SaleDetailedEntity {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at),
    } as any;
  }
}
