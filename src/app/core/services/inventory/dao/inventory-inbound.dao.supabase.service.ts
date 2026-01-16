import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { InventoryInboundInsertRcpEntity } from 'src/app/shared/entity/rcp/inventory.inbound.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryInboundDaoSupabaseService {
  private supabase: SupabaseClient;
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

  getAll(): Observable<any> {
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
      map(response => response.data),
      catchError(error => {
        this.logger.error('Fatal error in getAll:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }


  getInboundById(id: number): Observable<any> {
    const context = 'getInboundById';
    const query = this.supabase
      .from('inventory_inbound')
      .select(`
        *,
        user_source:users!user_source_id(*),
        user_target:users!user_target_id(*),
        products:inventory_inbound_product(
          *,
          product:products(id, name, sku, media)
        )
      `)
      .eq('id', id)
      .single();

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getInboundById:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => response.data),
      catchError(error => {
        this.logger.error('Fatal error in getInboundById:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }
}
