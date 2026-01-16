import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductPriceDaoSupabaseService } from './dao/product-price.dao.supabase.service';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { ProductDashboardPriceEntity } from 'src/app/shared/entity/view/product.price.dashboard.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductPriceService {
  private dao = inject(ProductPriceDaoSupabaseService);
  private dateUtils = inject(DateUtilsService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductPriceService.name;

  private currentProduct = signal<ProductDashboardPriceEntity | null>(null);

  setCurrentProduct(product: ProductDashboardPriceEntity | null) {
      const context = 'setCurrentProduct';
      this.loggerService.debug(`Setting current product: ${JSON.stringify(product)}`, this.CLASS_NAME, context);
      this.currentProduct.set(product);
  }

  getAndClearCurrentProduct(): ProductDashboardPriceEntity | null {
      const product = this.currentProduct();
      this.currentProduct.set(null);
      return product;
  }

  getAllPriceDashboardData(): Observable<ProductDashboardPriceEntity[]> {
    this.loggerService.debug(`Getting all price dashboard data`, this.CLASS_NAME, 'getAllPriceDashboardData');
    return this.dao.getAllPriceHistoryDashboardData();
  }

  getPriceByProductId(productId: string): Observable<PriceHistoryEntity[]> {
    return this.dao.getPriceHistoryByProductId(productId);
  }

  createPrice(price: any): Observable<boolean> {
    const entity = this.mapToEntity(price);
    return this.dao.createPriceHistory(entity as any);
  }

  updatePrice(price: any): Observable<boolean> {
    const id = price.id;
    const entity = this.mapToEntity(price);
    return this.dao.updatePriceHistory(id, entity);
  }

  deletePrice(id: number): Observable<boolean> {
    return this.dao.deletePriceHistory(id);
  }

  private mapToEntity(model: Partial<PriceHistoryEntity>): Partial<PriceHistoryEntity> {
    const entity: any = { ...model };
    if (model.created_at) delete entity.created_at; // Managed by DB
    if (model.updated_at) delete entity.updated_at; // Managed by DB
    return entity;
  }
}
