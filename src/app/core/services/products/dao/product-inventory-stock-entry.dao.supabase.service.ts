import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductDashboardPriceEntity } from 'src/app/shared/entity/view/product.price.dashboard.entity';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';
import { ProductInventoryStockEntryEntity } from 'src/app/shared/entity/product.inventory.stock-entry.entity';
import { ProductInventoryStockEntryDashboardEntity, UserInventoryStockEntryDashboardEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.dashboard.entity';
import { ProductInventoryStockEntryDetailedEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.detailed.entity';

export type StockScopeType = 'Todos' | 'Grupal' | 'Personal';

@Injectable({
  providedIn: 'root'
})
export class ProductInventoryStockEntryDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ProductInventoryStockEntryDaoSupabaseService.name;
  private readonly TABLE_NAME = 'inventory_stock_entry';
  private readonly VIEW_DASHBOARD_NAME = 'v_product_inventory_stock_entry_dashboard';
  private readonly VIEW_DETAILED_NAME = 'v_product_inventory_stock_entry_detailed';

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  getByProductIdAndUserId(productId: string, userId: string): Observable<ProductInventoryStockEntryDetailedEntity[]> {
    const context = 'getByProductIdAndUserId';
    let query = this.supabase
      .from(this.VIEW_DETAILED_NAME)
      .select('*')
      .eq('product_id', productId)

    if (userId) {
      query = query.eq('user_owner_id', userId);
    }
    const promise = query
      .order('updated_at', { ascending: false });

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => (response.data?.map(item => this.mapDetailedEntity(item)) ?? []) || []),
      catchError(error => {
        this.logger.error(`Error fetching media for product ${productId}:`, error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  getAllDashboardData(userIds: number[] = []): Observable<ProductInventoryStockEntryDashboardEntity[]> {
    const context = 'getAllDashboardData';
    const query = this.supabase.rpc('get_product_dashboard_by_users', {
      p_user_ids: userIds.length > 0 ? userIds : null
    });

    return from(query).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => (response.data || []).map((item: any) => this.mapDashboardEntity(item))),
      catchError(error => {
        this.logger.error('Error in Dashboard RPC:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }


  update(id: number, priceHistory: Partial<PriceHistoryEntity>): Observable<boolean> {
    const context = 'updatePriceHistory';
    this.logger.debug(`Updating price history for product ${id} with data:${JSON.stringify(priceHistory)}`, this.CLASS_NAME, context);
    const promise = this.supabase
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

  delete(id: number): Observable<boolean> {
    const context = 'delete';
    const promise = this.supabase
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

  private mapDashboardEntity(entity: any): ProductInventoryStockEntryDashboardEntity {
    return {
      product_id: entity.product_id,
      product_main_image: entity.product_main_image,
      product_name: entity.product_name,
      product_sku: entity.product_sku,
      manufacturer_ref: entity.manufacturer_ref,
      global_total_purchases: entity.global_total_purchases,
      global_avg_unit_cost: entity.global_avg_unit_cost,
      global_avg_quantity: entity.global_avg_quantity,
      global_total_quantity: entity.global_total_quantity,
      users_details: entity.users_details?.map((p: any) => this.mapDashboardEntityUser(p)) ?? [],
    };
  }

  private mapDashboardEntityUser(entity: any): UserInventoryStockEntryDashboardEntity {
    return {
      user_id: entity.user_id,
      first_name: entity.first_name,
      last_name: entity.last_name,
      total_purchases: entity.total_purchases,
      avg_unit_cost: entity.avg_unit_cost,
      avg_quantity: entity.avg_quantity,
      total_quantity: entity.total_quantity,
    };
  }

  private mapEntity(entity: any): ProductInventoryStockEntryEntity {
    return {
      id: entity.id,
      product_id: entity.product_id,
      quantity: entity.quantity,
      unit_cost: entity.unit_cost,
      batch_number: entity.batch_number,
      expiry_date: this.dateUtils.parseDbDate(entity.expiry_date),
      created_at: this.dateUtils.parseDbDate(entity.created_at),
      updated_at: this.dateUtils.parseDbDate(entity.updated_at),
      user_owner_id: entity.user_owner_id,
      inbound_id: entity.inbound_id,
    };
  }

  private mapDetailedEntity(entity: any): ProductInventoryStockEntryDetailedEntity {
    return {
      id: entity.id,
      product_id: entity.product_id,
      quantity: entity.quantity,
      unit_cost: entity.unit_cost,
      batch_number: entity.batch_number,
      expiry_date: this.dateUtils.parseDbDate(entity.expiry_date),
      created_at: this.dateUtils.parseDbDate(entity.created_at),
      updated_at: this.dateUtils.parseDbDate(entity.updated_at),
      user_owner_id: entity.user_owner_id,
      inbound_id: entity.inbound_id,
      user_owner_first_name: entity.user_owner_first_name,
      user_owner_last_name: entity.user_owner_last_name,
      inbound_description: entity.inbound_description,
    };
  }

}
