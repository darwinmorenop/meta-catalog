import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CartDaoSupabaseService } from './dao/cart.dao.supabase.service';
import { CartItemEntity } from 'src/app/shared/entity/cart.entity';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartDao = inject(CartDaoSupabaseService);

  getAll(userIds?: number[]): Observable<CartItemEntity[]> {
    return this.cartDao.getAll(userIds);
  }

  delete(user_id: number, product_id: number): Observable<any> {
    return this.cartDao.delete(user_id, product_id);
  }

  update(user_id: number, product_id: number, updates: Partial<CartItemEntity>): Observable<any> {
    return this.cartDao.update(user_id, product_id, updates);
  }

  changeIsSelected(user_id: number, product_id: number, is_selected: boolean): Observable<any> {
    return this.cartDao.changeIsSelected(user_id, product_id, is_selected);
  }

  changeIsSavedForLater(user_id: number, product_id: number, is_saved_for_later: boolean): Observable<any> {
    return this.cartDao.changeIsSavedForLater(user_id, product_id, is_saved_for_later);
  }
}
