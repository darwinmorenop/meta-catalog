import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

// Services & Models
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';
import { StockScopeType } from 'src/app/core/services/products/dao/product-inventory-stock-entry.dao.supabase.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ProductInventoryStockEntryDashboardEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.dashboard.entity';

@Component({
  selector: 'app-product-inventory-stock-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: './product-inventory-stock-dashboard.component.html',
  styleUrl: './product-inventory-stock-dashboard.component.scss'
})
export class ProductInventoryStockDashboardComponent implements OnInit {
  private readonly stockService = inject(ProductInventoryStockEntryService);
  private readonly userService = inject(UserService);
  private readonly loggerService = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly CLASS_NAME = ProductInventoryStockDashboardComponent.name;

  scopeControl = new FormControl<StockScopeType>('Personal', { nonNullable: true });
  
  // Track form control changes as a signal for reactive queries
  scope = toSignal(this.scopeControl.valueChanges, { initialValue: this.scopeControl.value });

  filteredUserIds = computed(() => {
    const scope = this.scope();
    const currentUser = this.userService.currentUser();
    const network = this.userService.currentUserNetwork() || [];

    if (!currentUser) return [];

    switch (scope) {
      case 'Personal':
        return [currentUser.id];
      case 'Grupal':
        return network.map((u: UserNetworkDetail) => u.id);
      case 'Todos':
        return []; // Important: empty array means NO filter in the DAO
      default:
        return [];
    }
  });

  // Automatically re-fetches when filteredUserIds() changes
  stockResource = rxResource({
    stream: () => this.stockService.getAllDashboardData(this.filteredUserIds())
  });

  tableData = computed(() => {
    const rawData = this.stockResource.value() as ProductInventoryStockEntryDashboardEntity[] ?? [];
    return rawData.map(product => ({
      ...product,
      total_users_count: product.users_details?.length || 0
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image', filterable: false },
      { key: 'product_sku', header: 'SKU', filterable: false },
      { key: 'product_name', header: 'Producto', filterable: false },
      { key: 'total_users_count', header: 'Número de usuarios', filterable: false },
      { key: 'global_total_quantity', header: 'Cantidad Total', filterable: false },
      { key: 'global_avg_quantity', header: 'Cantidad Promedio', filterable: false },
      { key: 'global_avg_unit_cost', header: 'Costo Promedio por unidad', type: 'currency', filterable: false },
      { key: 'global_total_purchases', header: 'Compras totales', filterable: false },
    ],
    searchableFields: ['product_name', 'product_sku', 'manufacturer_ref'],
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
    this.router.navigate(['/inventory/stock-entry', row.product_id, 'all']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  ngOnInit(): void {
    this.loggerService.debug(`ProductInventoryStockDashboardComponent initialized`, this.CLASS_NAME, 'ngOnInit');
  }
}
