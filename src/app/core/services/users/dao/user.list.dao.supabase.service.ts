import { inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';
import { ListEntity, ListSlugEnum } from 'src/app/shared/entity/list.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { ListItemViewEntity, ListViewEntity } from 'src/app/shared/entity/view/list.view.entity';
import { ListItemRcpUpsertRequestEntity, ListRcpCopyRequestEntity, ListRcpUpsertRequestEntity } from 'src/app/shared/entity/rcp/list.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class UserListDaoSupabaseService {


  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);
  private loggerService: LoggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserListDaoSupabaseService.name;

  constructor() {
  }

  getAll(userIds?: number[]): Observable<ListViewEntity[]> {
    const systemSlugs = `${ListSlugEnum.favorites},${ListSlugEnum.price_tracking}`;

    let query = this.supabaseService.getSupabaseClient()
      .from('v_list')
      .select('*');

    query = query.or(`slug.is.null,slug.not.in.(${systemSlugs})`);

    if (userIds && userIds.length > 0) {
      query = query.or(`owner_id.in.(${userIds.join(',')})`);
    }

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToDashboardEntity(item)))
    );
  }

  getTracking(userIds?: number[]): Observable<ListViewEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_list')
      .select('*')
      .eq('slug', ListSlugEnum.price_tracking);

    if (userIds && userIds.length > 0) {
      query = query.or(`owner_id.in.(${userIds.join(',')})`);
    }

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToDashboardEntity(item)))
    );
  }

  getTrackingByUser(userId: number): Observable<ListItemViewEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_list_items')
      .select('*')
      .eq('owner_id', userId)
      .eq('slug', ListSlugEnum.price_tracking);

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToListItemEntity(item)))
    );
  }

  getFavorites(userIds?: number[]): Observable<ListViewEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_list')
      .select('*')
      .eq('slug', ListSlugEnum.favorites);

    if (userIds && userIds.length > 0) {
      query = query.or(`owner_id.in.(${userIds.join(',')})`);
    }

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToDashboardEntity(item)))
    );
  }

  getFavoritesByUser(userId: number): Observable<ListItemViewEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_list_items')
      .select('*')
      .eq('owner_id', userId)
      .eq('slug', ListSlugEnum.favorites);

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToListItemEntity(item)))
    );
  }


  getById(id: string): Observable<ListViewEntity> {
    const query = this.supabaseService.getSupabaseClient()
      .from('v_list')
      .select('*')
      .eq('id', id)
      .single();

    return from(query).pipe(
      map(res => this.mapToDashboardEntity(res.data))
    );
  }

  /**
   * Obtiene todos los items de una lista. Sin historicos
   * @param listId Id de la lista
   * @returns Observable con los items de la lista
   */
  getAllItems(listId: string): Observable<Partial<ListItemViewEntity>[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_list_items')
      .select(`
        item_id,
        list_id, 
        list_name, 
        list_description,
        list_is_private,
        owner_full_name,
        product_id, 
        product_name, 
        product_main_image,  
        added_at
      `)
      .eq('list_id', listId)
      .order('product_name');
    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToListItemEntity(item)))
    );
  }

  getAllItemsComplete(listId: string): Observable<ListItemViewEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_list_items')
      .select('*')
      .eq('list_id', listId)
      .order('product_name');
    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToListItemEntity(item)))
    );
  }

  upsert(data: ListRcpUpsertRequestEntity): Observable<string | null> {
    const query = this.supabaseService.getSupabaseClient()
      .rpc('upsert_full_list', data);
    return from(query).pipe(
      map(res => res.data),
      catchError(err => {
        this.loggerService.error(this.CLASS_NAME, 'upsert', err);
        return of(null);
      })
    );
  }

  copy(data: ListRcpCopyRequestEntity): Observable<string | null> {
    const query = this.supabaseService.getSupabaseClient()
      .rpc('copy_list', data);
    return from(query).pipe(
      map(res => res.data),
      catchError(err => {
        this.loggerService.error(this.CLASS_NAME, 'copy', err);
        return of(null);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    const query = this.supabaseService.getSupabaseClient()
      .from('lists')
      .delete()
      .eq('id', id);
    return from(query).pipe(
      map(res => res.data !== null),
      catchError(err => {
        this.loggerService.error(this.CLASS_NAME, 'delete', err);
        return of(false);
      })
    );
  }

  removeItem(listId: string, itemId: string): Observable<boolean> {
    const query = this.supabaseService.getSupabaseClient()
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('id', itemId);
    return from(query).pipe(
      // En Supabase, si no hay error, la operación fue exitosa
      map(res => res.error === null), catchError(err => {
        this.loggerService.error(this.CLASS_NAME, 'removeItem', err);
        return of(false);
      })
    );
  }

  upsertItem(data: ListItemRcpUpsertRequestEntity): Observable<string|null> {
    const query = this.supabaseService.getSupabaseClient()
      .rpc('upsert_single_list_item', data);
    return from(query).pipe(
      map(res => res.data),
      catchError(err => {
        this.loggerService.error(this.CLASS_NAME, 'upsertItem', err);
        return of(null);
      })
    );
  }

  private mapToDashboardEntity(item: any): ListViewEntity {
    return {
      ...item,
      updated_at: this.dateUtils.parseDbDate(item.updated_at),
      created_at: this.dateUtils.parseDbDate(item.created_at),
    };
  }

  private mapToListItemEntity(item: any): ListItemViewEntity {
    return {
      ...item,
      updated_at: this.dateUtils.parseDbDate(item.updated_at),
      created_at: this.dateUtils.parseDbDate(item.created_at),
      added_at: this.dateUtils.parseDbDate(item.added_at),
    };
  }


}