import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { InventoryInboundInsertRcpEntity } from 'src/app/shared/entity/rcp/inventory.inbound.rcp.entity';
import { InventoryInboundStatusEnum, InventoryInboundEntity, InventoryInboundStatusLabels } from 'src/app/shared/entity/inventory.inbound.entity';
import { InventoryInboundDashboardEntity, InventoryInboundDashboardDetailedEntity } from 'src/app/shared/entity/view/inventory.dashboard.inbound.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryInboundDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = InventoryInboundDaoSupabaseService.name;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  insertInboundRpc(inbound: InventoryInboundInsertRcpEntity): Observable<number> {
    const context = 'insertInboundRpc';
    this.logger.debug(`Calling to insert with: ${JSON.stringify(inbound)}`, this.CLASS_NAME, context);
    const promise = this.supabase.rpc('create_inbound_with_stock', {
      p_data: inbound
    });

    return from(promise).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in insertInboundRpc:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => response.data),
      catchError(error => {
        this.logger.error('Fatal error in insertInboundRpc:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  getAllDashboardData(): Observable<InventoryInboundDashboardEntity[]> {
    const context = 'getAllDashboardData';
    const query = this.supabase
      .from('v_inventory_inbound_dashboard')
      .select(`*`);

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getAll Dashboard Data:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => this.mapFromDashboardEntity(item))),
      catchError(error => {
        this.logger.error('Fatal error in getAll Dashboard Data:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  getInboundByIdDetailedDashboardData(id: number): Observable<InventoryInboundDashboardDetailedEntity[]> {
    const context = 'getInboundByIdDetailedDashboardData';
    const query = this.supabase
      .from('v_inventory_inbound_entries_detailed')
      .select(`*`)
      .eq('inbound_id', id);

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getInboundByIdDetailedDashboardData:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => this.mapFromDashboardDetailedEntity(item))),
      catchError(error => {
        this.logger.error('Fatal error in getInboundByIdDetailedDashboardData:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  getAll(): Observable<InventoryInboundEntity[]> {
    const context = 'getAll';
    const query = this.supabase
      .from('inventory_inbound')
      .select(`*`);

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getAll:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => this.mapFromEntity(item))),
      catchError(error => {
        this.logger.error('Fatal error in getAll:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  private mapFromEntity(item: any): InventoryInboundEntity {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at),
      received_at: this.dateUtils.parseDbDate(item.received_at),
      status_label: InventoryInboundStatusEnum[item.status as keyof typeof InventoryInboundStatusEnum] || item.status
    };
  }

  private mapFromDashboardEntity(item: any): InventoryInboundDashboardEntity {
    return {
      ...item,
      inbound_created_at: this.dateUtils.parseDbDate(item.inbound_created_at),
      inbound_updated_at: this.dateUtils.parseDbDate(item.inbound_updated_at),
      received_at: this.dateUtils.parseDbDate(item.received_at),
      inbound_status_label: InventoryInboundStatusLabels[item.inbound_status as InventoryInboundStatusEnum] || item.inbound_status
    } as any;
  }

  private mapFromDashboardDetailedEntity(item: any): InventoryInboundDashboardDetailedEntity {
    return {
      ...item,
      inbound_created_at: this.dateUtils.parseDbDate(item.inbound_created_at),
      inbound_updated_at: this.dateUtils.parseDbDate(item.inbound_updated_at),
      received_at: this.dateUtils.parseDbDate(item.received_at),
      expiry_date: this.dateUtils.parseDbDate(item.expiry_date),
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at),
      inbound_status_label: InventoryInboundStatusEnum[item.inbound_status as keyof typeof InventoryInboundStatusEnum] || item.inbound_status
    } as any;
  }


  getInboundById(id: number): Observable<InventoryInboundEntity> {
    const context = 'getInboundById';
    const query = this.supabase
      .from('inventory_inbound')
      .select(`*`)
      .eq('id', id)
      .single();

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getInboundById:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => this.mapFromEntity(response.data)),
      catchError(error => {
        this.logger.error('Fatal error in getInboundById:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }

  update(id: number, data: Partial<InventoryInboundEntity>): Observable<boolean> {
    const context = 'update';
    const query = this.supabase
      .from('inventory_inbound')
      .update(data)
      .eq('id', id);

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in update:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => !response.error),
      catchError(error => {
        this.logger.error('Fatal error in update:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }
}
