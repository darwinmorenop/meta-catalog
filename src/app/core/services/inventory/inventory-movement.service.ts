import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryMovementDaoSupabaseService } from 'src/app/core/services/inventory/dao/inventory-movement.dao.supabase.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductMovementReport } from 'src/app/shared/entity/rcp/inventory.movement.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementService {
  private dao = inject(InventoryMovementDaoSupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = InventoryMovementService.name;

  getAllDashboardData(userIds?: string[], productIds?: number[]): Observable<ProductMovementReport[]> {
    this.logger.debug('Getting all dashboard data', this.CLASS_NAME, 'getAllDashboardData');
    return this.dao.getAllDashboardData(userIds, productIds);
  }

}
