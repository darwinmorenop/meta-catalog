import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ProductScrapSyncOptions, ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ScrapRcpArchivedRequestEntity, ScrapRcpInsertEntity, ScrapRcpInsertRequestEntity, ScrapRcpResponseEntity, ScrapRcpUpdateEntity, ScrapRcpUpdateRequestEntity } from 'src/app/shared/entity/rcp/scrap.rcp.entity';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';
import { ProductScrapDetails } from 'src/app/core/models/products/scrap/product.scrap.model';

@Injectable({
  providedIn: 'root'
})
export class ScrapWriteDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ScrapWriteDaoSupabaseService.name;

  constructor() {
  }


  delete(id: number): Observable<any> {
    const context = 'delete'
    this.logger.info(`Deleting with id:${id}`, this.CLASS_NAME, context)
    return from(
      this.supabaseService.getSupabaseClient()
        .from('scrap')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }

  applyChanges(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
    if (changes.length === 0) return of(this.getDefaultResponse());
    const type = changes[0].type;
    if (type === 'CREATE') return this.createProducts(changes, scrapId, options);
    if (type === 'UPDATE') return this.updateProducts(changes, scrapId, options);
    if (type === 'ARCHIVE') return this.archiveProducts(changes, scrapId, options);
    return of(this.getDefaultResponse());
  }

  applyChangesAll(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
    if (changes.length === 0) return of(this.getDefaultResponse());

    const createChanges = changes.filter(c => c.type === 'CREATE');
    const updateChanges = changes.filter(c => c.type === 'UPDATE');
    const archiveChanges = changes.filter(c => c.type === 'ARCHIVE');

    const initialState: ScrapRcpResponseEntity = {
      success: true,
      total_processed: 0,
      scrap_id: scrapId
    };

    let obs$ = of(initialState);

    // 1. Create
    if (createChanges.length > 0) {
      obs$ = obs$.pipe(
        switchMap(state => this.createProducts(createChanges, state.scrap_id, options).pipe(
          map(res => ({
            success: state.success && res.success,
            total_processed: state.total_processed + (res.total_processed || 0),
            scrap_id: res.scrap_id || state.scrap_id,
            error_message: res.success ? state.error_message : res.error_message
          }))
        ))
      );
    }

    // 2. Update
    if (updateChanges.length > 0) {
      obs$ = obs$.pipe(
        switchMap(state => {
          if (!state.success) return of(state);
          return this.updateProducts(updateChanges, state.scrap_id, options).pipe(
            map(res => ({
              success: state.success && res.success,
              total_processed: state.total_processed + (res.total_processed || 0),
              scrap_id: res.scrap_id || state.scrap_id,
              error_message: res.success ? state.error_message : res.error_message
            }))
          );
        })
      );
    }

    // 3. Archive
    if (archiveChanges.length > 0) {
      obs$ = obs$.pipe(
        switchMap(state => {
          if (!state.success) return of(state);
          return this.archiveProducts(archiveChanges, state.scrap_id, options).pipe(
            map(res => ({
              success: state.success && res.success,
              total_processed: state.total_processed + (res.total_processed || 0),
              scrap_id: res.scrap_id || state.scrap_id,
              error_message: res.success ? state.error_message : res.error_message
            }))
          );
        })
      );
    }

    return obs$;
  }

  private getDefaultResponse(): ScrapRcpResponseEntity {
    return {
      success: false,
      scrap_id: 0,
      total_processed: 0,
      error_message: undefined
    };
  }

  private mapDetails(details?: any): ProductScrapDetails | undefined {
    if (!details) return undefined;
    return {
      description: details.description || [],
      benefits: details.benefits || [],
      ingredients_commercial: details.ingredients_commercial || [],
      ingredients_modal: details.ingredients_modal || [],
      usage: details.usage || [],
      images: details.images || []
    };
  }

  private createProducts(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
    const context = 'createProducts';
    const products: ScrapRcpInsertEntity[] = changes.map(c => {
      return {
        name: c.original_scrap.name,
        description: c.original_scrap.description,
        details: this.mapDetails(c.original_scrap.details),
        summary: c.original_scrap.summary,
        manufacturer_ref: c.manufacturer_ref,
        url_source: c.original_scrap.urlSource,
        url: c.original_scrap.urlBase,
        scrap_id: scrapId,
        original_price: c.original_scrap.originalPrice,
        sale_price: c.original_scrap.salePrice,
        stock_status: c.original_scrap.totalStock,
        img_main: c.original_scrap.imageUrl,
        img_sec: c.original_scrap.secondImageUrl
      };
    });
    const dataToSend: ScrapRcpInsertRequestEntity = {
      p_scrap_id: scrapId,
      p_sources: products,
      p_config: options
    };
    this.logger.info(`Sending data to Supabase: ${JSON.stringify(dataToSend)}`, this.CLASS_NAME, context);
    return from(this.supabaseService.getSupabaseClient().rpc('complex_scrapInsert', dataToSend)).pipe(
      tap((res: any) => { if (res.error) throw res.error; }),
      map((res: any) => {
        if (!res.data) throw new Error(`RPC 'complex_scrapInsert' returned no data`);
        return res.data as ScrapRcpResponseEntity;
      })
    );
  }

  private archiveProducts(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
    const context = 'archiveProducts'
    const products: number[] = changes.map(c => c.productId).filter(id => id !== undefined);
    const dataToSend: ScrapRcpArchivedRequestEntity = {
      p_scrap_id: scrapId,
      p_product_ids: products,
      p_config: options
    };
    this.logger.info(`Sending data to Supabase: ${JSON.stringify(dataToSend)}`, this.CLASS_NAME, context);
    return from(this.supabaseService.getSupabaseClient().rpc('complex_scrapArchive', dataToSend)).pipe(
      tap((res: any) => { if (res.error) throw res.error; }),
      map((res: any) => {
        if (!res.data) throw new Error(`RPC 'complex_scrapArchive' returned no data`);
        return res.data as ScrapRcpResponseEntity;
      })
    );
  }

  private updateProducts(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<ScrapRcpResponseEntity> {
    const context = 'updateProducts'
    const products: ScrapRcpUpdateEntity[] = changes.map(c => {
      return {
        product_id: c.productId!,
        name: c.original_scrap.name,
        description: c.original_scrap.description,
        details: this.mapDetails(c.original_scrap.details) as ProductScrapDetails,
        summary: c.original_scrap.summary,
        manufacturer_ref: c.manufacturer_ref,
        url_source: c.original_scrap.urlSource,
        url: c.original_scrap.urlBase,
        scrap_id: scrapId,
        original_price: c.original_scrap.originalPrice,
        sale_price: c.original_scrap.salePrice,
        stock_status: c.original_scrap.totalStock,
        img_main: c.original_scrap.imageUrl,
        img_sec: c.original_scrap.secondImageUrl
      };
    });
    const dataToSend: ScrapRcpUpdateRequestEntity = {
      p_scrap_id: scrapId,
      p_sources: products,
      p_config: options
    };
    this.logger.info(`Sending data to Supabase: ${JSON.stringify(dataToSend)}`, this.CLASS_NAME, context);
    return from(this.supabaseService.getSupabaseClient().rpc('complex_scrapUpdate', dataToSend)).pipe(
      tap((res: any) => { if (res.error) throw res.error; }),
      map((res: any) => {
        if (!res.data) throw new Error(`RPC 'complex_scrapUpdate' returned no data`);
        return res.data as ScrapRcpResponseEntity;
      })
    );
  }
}