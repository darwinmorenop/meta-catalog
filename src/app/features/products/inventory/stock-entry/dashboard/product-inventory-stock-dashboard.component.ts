import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Models
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';

@Component({
  selector: 'app-product-inventory-stock-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: './product-inventory-stock-dashboard.component.html',
  styleUrl: './product-inventory-stock-dashboard.component.scss'
})
export class ProductInventoryStockDashboardComponent implements OnInit {
  private readonly stockService = inject(ProductInventoryStockEntryService);
  private readonly loggerService = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly CLASS_NAME = ProductInventoryStockDashboardComponent.name;

  stockResource = rxResource({
    stream: () => this.stockService.getAllDashboardData()
  });

  tableData = computed(() => {
    const rawData = this.stockResource.value() ?? [];
    const flattened: any[] = [];

    rawData.forEach(product => {
      if (product.users_details && product.users_details.length > 0) {
        product.users_details.forEach(user => {
          flattened.push({
            ...product,
            user_id: user.user_id,
            user_name: `${user.first_name} ${user.last_name}`,
            user_quantity: user.total_quantity,
            user_avg_cost: user.avg_unit_cost,
            user_purchases: user.total_purchases
          });
        });
      } else {
        // En caso de que no haya detalles de usuario pero queramos ver el producto
        flattened.push({
          ...product,
          user_id: null,
          user_name: 'N/A',
          user_quantity: 0,
          user_avg_cost: 0,
          user_purchases: 0
        });
      }
    });

    return flattened;
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image', filterable: false },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'user_name', header: 'Usuario', filterable: true },
      { key: 'user_quantity', header: 'Cantidad', filterable: false },
      { key: 'user_avg_cost', header: 'Costo Promedio', type: 'currency', filterable: false },
      { key: 'global_total_quantity', header: 'Total Global', filterable: false }
    ],
    searchableFields: ['product_name', 'product_sku', 'product_ean', 'user_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  onViewDetail(row: any): void {
    this.stockService.setCurrentDashboardRow(row);
    this.router.navigate(['/inventory/stock-entry', row.product_id, row.user_id || 'all']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.loggerService.debug(`ProductInventoryStockDashboardComponent initialized`, this.CLASS_NAME, 'ngOnInit');
  }
}
