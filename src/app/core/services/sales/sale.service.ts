import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SaleDaoSupabaseService } from 'src/app/core/services/sales/dao/sale.dao.supabase.service';
import { SaleDashboardEntity, SaleDetailedEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { ProductSalesStats, SaleInsertRcpEntity, UpsertSaleResponse } from 'src/app/shared/entity/rcp/sale.rcp.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private dao = inject(SaleDaoSupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = SaleService.name;

  getAllDashboardData(userIds?: number[]): Observable<SaleDashboardEntity[]> {
    this.logger.debug('Getting all sales dashboard data', this.CLASS_NAME, 'getAllDashboardData');
    return this.dao.getAllDashboardData(userIds);
  }

  saveSale(sale: SaleInsertRcpEntity): Observable<UpsertSaleResponse> {
    this.logger.debug(`Saving sale: ${JSON.stringify(sale)}`, this.CLASS_NAME, 'saveSale');
    return this.dao.saveSale(sale);
  }

  getSaleByIdDetailedData(id: number): Observable<SaleDetailedEntity[]> {
    this.logger.debug(`Getting detailed sale data for id: ${id}`, this.CLASS_NAME, 'getSaleByIdDetailedData');
    return this.dao.getSaleByIdDetailedData(id);
  }

  getSalesStats(userIds?: number[]): Observable<ProductSalesStats[]> {
    this.logger.debug('Getting sales stats', this.CLASS_NAME, 'getSalesStats');
    return this.dao.getSalesStats(userIds);
  }

  getSalesByProductId(productId: number, userIds?: number[]): Observable<SaleDetailedEntity[]> {
    this.logger.debug(`Getting sales for product id: ${productId}`, this.CLASS_NAME, 'getSalesByProductId');
    return this.dao.getSalesByProductId(productId, userIds);
  }
}
