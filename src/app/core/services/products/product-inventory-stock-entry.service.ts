import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductInventoryStockEntryDaoSupabaseService } from './dao/product-inventory-stock-entry.dao.supabase.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductInventoryStockEntryDashboardEntity, UserInventoryStockEntryDashboardEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.dashboard.entity';
import { ProductInventoryStockEntryEntity } from 'src/app/shared/entity/product.inventory.stock-entry.entity';
import { ProductInventoryStockEntryDetailedEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.detailed.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductInventoryStockEntryService {
  private dao = inject(ProductInventoryStockEntryDaoSupabaseService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductInventoryStockEntryService.name;

  private currentDashboardRow = signal<any>(null);

  setCurrentDashboardRow(row: any) {
    this.currentDashboardRow.set(row);
  }

  getCurrentDashboardRow(): any {
    return this.currentDashboardRow();
  }


  getAllDashboardData(): Observable<ProductInventoryStockEntryDashboardEntity[]> {
    this.loggerService.debug(`Getting all dashboard data`, this.CLASS_NAME, 'getAllDashboardData');
    return this.dao.getAllDashboardData();
  }

  getByProductIdAndUserId(productId: string, userId: string): Observable<ProductInventoryStockEntryDetailedEntity[]> {
    return this.dao.getByProductIdAndUserId(productId, userId);
  }


  update(data: any): Observable<boolean> {
    this.loggerService.debug(`Updating stock entry: ${JSON.stringify(data)}`, this.CLASS_NAME, 'update');
    const id = data.id;
    const  entity: Partial<ProductInventoryStockEntryEntity> = this.mapToEntity(data);
    return this.dao.update(id, entity);
  }

  delete(id: number): Observable<boolean> {
    return this.dao.delete(id);
  }

  private mapToEntity(data:any): Partial<ProductInventoryStockEntryEntity> {
    const entity: Partial<ProductInventoryStockEntryEntity> = {
      quantity: data.quantity,
      expiry_date: data.expiry_date,
      batch_number: data.batch_number,
      unit_cost: data.unit_cost,
    };
    return entity;
  }
}
