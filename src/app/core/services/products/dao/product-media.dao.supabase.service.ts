import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductMediaEntity } from 'src/app/shared/entity/product.media.entity';
import { ProductDashboardMediaEntity } from 'src/app/shared/entity/view/product.media.dashboard.entity';
import { MediaRcpOrderRequestEntity, MediaRcpOrderResponseEntity } from 'src/app/shared/entity/rcp/media.rcp.entity';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductMediaDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ProductMediaDaoSupabaseService.name;
  private readonly TABLE_NAME = 'product_media';
  private readonly VIEW_DASHBOARD_NAME = 'v_product_media_dashboard';

  constructor() {
  }

  getMediaByProductId(productId: string): Observable<ProductMediaEntity[]> {
    const context = 'getMediaByProductId';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => (response.data as ProductMediaEntity[]) || []),
      catchError(error => {
        this.logger.error(`Error fetching media for product ${productId}:`, error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }

  getAllMediaDashboardData(): Observable<ProductDashboardMediaEntity[]> {
    const context = 'getAllMediaDashboardData';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.VIEW_DASHBOARD_NAME)
      .select('*')

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => (response.data as ProductDashboardMediaEntity[]) || []),
      catchError(error => {
        this.logger.error('Error fetching all media:', error, this.CLASS_NAME, context);
        return of([]);
      })
    );
  }
  createMedia(media: Partial<ProductMediaEntity>): Observable<ProductMediaEntity | null> {
    const context = 'createMedia';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .insert(media)
      .select()
      .single();

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => response.data as ProductMediaEntity),
      catchError(error => {
        this.logger.error('Error creating media:', error, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

  updateMedia(id: number, media: Partial<ProductMediaEntity>): Observable<ProductMediaEntity | null> {
    const context = 'updateMedia';
    const promise = this.supabaseService.getSupabaseClient()
      .from(this.TABLE_NAME)
      .update(media)
      .eq('id', id)
      .select()
      .single();

    return from(promise).pipe(
      tap(response => {
        if (response.error) throw response.error;
      }),
      map(response => response.data as ProductMediaEntity),
      catchError(error => {
        this.logger.error(`Error updating media ${id}:`, error, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }

  updateOrderMedia(media: MediaRcpOrderRequestEntity): Observable<MediaRcpOrderResponseEntity> {
    return from(this.supabaseService.getSupabaseClient()
      .rpc('complex_mediaOrder', media)).pipe(
        tap((res: any) => { if (res.error) throw res.error; }),
        map((res: any) => {
          if (!res.data) throw new Error(`RPC 'complex_mediaOrder' returned no data`);
          return res.data as MediaRcpOrderResponseEntity;
        })
      );
  }

  deleteMedia(id: number): Observable<boolean> {
    const context = 'deleteMedia';
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
        this.logger.error(`Error deleting media ${id}:`, error, this.CLASS_NAME, context);
        return of(false);
      })
    );
  }
}
