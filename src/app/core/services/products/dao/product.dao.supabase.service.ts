import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProductCompleteEntity } from 'src/app/shared/entity/view/product.complete.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

@Injectable({
  providedIn: 'root'
})
export class ProductDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  getProducts(): Observable<ProductCompleteEntity[]> {
    const promise = this.supabase
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
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }
}