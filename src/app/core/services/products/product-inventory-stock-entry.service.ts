import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductInventoryStockEntryDaoSupabaseService } from 'src/app/core/services/products/dao/product-inventory-stock-entry.dao.supabase.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductInventoryStockEntryDashboardEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.dashboard.entity';
import { ProductInventoryStockEntryEntity } from 'src/app/shared/entity/product.inventory.stock-entry.entity';
import { ProductInventoryStockEntryDetailedEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.detailed.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductInventoryStockEntryService {
  private dao = inject(ProductInventoryStockEntryDaoSupabaseService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductInventoryStockEntryService.name;

  private currentDashboardRow = signal<ProductInventoryStockEntryDashboardEntity | null>(null);

  setCurrentDashboardRow(row: ProductInventoryStockEntryDashboardEntity) {
    this.currentDashboardRow.set(row);
  }

  getCurrentDashboardRow(): ProductInventoryStockEntryDashboardEntity | null {
    return this.currentDashboardRow();
  }


  getAllDashboardData(userIds?: string[]): Observable<ProductInventoryStockEntryDashboardEntity[]> {
    this.loggerService.debug(`Getting all dashboard data for users: ${userIds}`, this.CLASS_NAME, 'getAllDashboardData');
    return this.dao.getAllDashboardData(userIds);
  }

  getByProductIdAndUserId(productId: number, userId: string): Observable<ProductInventoryStockEntryDetailedEntity[]> {
    return this.dao.getByProductIdAndUserId(productId, userId);
  }


  update(data: any): Observable<boolean> {
    this.loggerService.debug(`Updating stock entry: ${JSON.stringify(data)}`, this.CLASS_NAME, 'update');
    const id = data.id;
    const entity: Partial<ProductInventoryStockEntryEntity> = this.mapToEntity(data);
    return this.dao.update(id, entity);
  }

  insert(data: any): Observable<boolean> {
    this.loggerService.debug(`Inserting stock entry: ${JSON.stringify(data)}`, this.CLASS_NAME, 'insert');
    const entity: Partial<ProductInventoryStockEntryEntity> = this.mapToInsertEntity(data);
    return this.dao.insert(entity);
  }

  delete(id: number): Observable<boolean> {
    return this.dao.delete(id);
  }

  private mapToEntity(data: any): Partial<ProductInventoryStockEntryEntity> {
    const entity: Partial<ProductInventoryStockEntryEntity> = {
      quantity: data.quantity,
      expiry_date: data.expiry_date,
      batch_number: data.batch_number,
      unit_cost: data.unit_cost,
      description: data.description,
    };
    return entity;
  }

  private mapToInsertEntity(data: any): Partial<ProductInventoryStockEntryEntity> {
    const entity: Partial<ProductInventoryStockEntryEntity> = {
      quantity: data.quantity,
      expiry_date: data.expiry_date,
      batch_number: data.batch_number,
      unit_cost: data.unit_cost,
      product_id: data.product_id,
      user_owner_id: data.user_owner_id,
      inbound_id: data.inbound_id,
      description: data.description,
    };
    return entity;
  }
}
