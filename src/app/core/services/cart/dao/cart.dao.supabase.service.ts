import { Injectable, inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';
import { CartItemEntity } from 'src/app/shared/entity/cart.entity';

@Injectable({
  providedIn: 'root'
})
export class CartDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);

  constructor() {
  }

  private mapCart(item: any): CartItemEntity {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at)
    };
  }

  getAll(userIds?: number[]): Observable<CartItemEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_cart_items')
      .select('*')
      .order('updated_at', { ascending: false });

    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapCart(item)))
    );
  }

  delete(user_id: number, product_id: number): Observable<any> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('cart_items')
        .delete()
        .eq('user_id', user_id)
        .eq('product_id', product_id)
    ).pipe(map(res => res.data));
  }

  update(user_id: number, product_id: number, updates: Partial<CartItemEntity>): Observable<any> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('cart_items')
        .update(updates)
        .eq('user_id', user_id)
        .eq('product_id', product_id)
    ).pipe(map(res => res.data));
  }

  changeIsSelected(user_id: number, product_id: number, is_selected: boolean): Observable<any> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('cart_items')
        .update({ is_selected: is_selected })
        .match({ product_id: product_id, user_id: user_id })
    ).pipe(map(res => res.data));
  }

  changeIsSavedForLater(user_id: number, product_id: number, is_saved_for_later: boolean): Observable<any> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('cart_items')
        .update({ is_saved_for_later: is_saved_for_later })
        .match({ product_id: product_id, user_id: user_id })
    ).pipe(map(res => res.data));
  }
}