import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProductCompleteEntity } from 'src/app/shared/entity/product.complete.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductDaoSupabaseService {
  private supabase: SupabaseClient;

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
        console.log('DB before parsed:', response.data);
      }),
      map(response => {        
        const data = (response.data as any[]) || [];
        const res = data.map(item => {
          const parseDate = (dateStr: string) => {
            if (!dateStr) return new Date();
            // Si no tiene 'Z' ni '+', asumimos que es UTC y se lo añadimos
            const formattedStr = (dateStr.includes('Z') || dateStr.includes('+')) 
              ? dateStr 
              : `${dateStr}Z`;
            return new Date(formattedStr);
          };

          return {
            ...item,
            product_created_at: parseDate(item.product_created_at),
            product_updated_at: parseDate(item.product_updated_at)
          };
        }) as ProductCompleteEntity[];
        
        console.log('DB after parsed:', res);
        return res;
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    );
  }
}