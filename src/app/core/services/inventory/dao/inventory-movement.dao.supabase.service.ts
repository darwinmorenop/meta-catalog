import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductMovementReport } from 'src/app/shared/entity/rcp/inventory.movement.rcp.entity';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = InventoryMovementDaoSupabaseService.name;

  constructor() {
  }

  getAllDashboardData(userIds?: number[], productIds?: number[]): Observable<ProductMovementReport[]> {
    const context = 'getAllDashboardData';
    let query = this.supabaseService.getSupabaseClient()
      .rpc('get_movements_by_user_and_product', { p_user_ids: userIds, p_product_ids: productIds });

    return from(query).pipe(
      tap(response => {
        if (response.error) {
          this.logger.error('Error in getAll Dashboard Data:', response.error, this.CLASS_NAME, context);
          throw response.error;
        }
      }),
      map(response => (response.data || []).map((item: any) => item as ProductMovementReport)),
      catchError(error => {
        this.logger.error('Fatal error in getAll Dashboard Data:', error, this.CLASS_NAME, context);
        throw error;
      })
    );
  }
   
}
