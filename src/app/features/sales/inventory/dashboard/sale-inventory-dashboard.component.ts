import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { UserSimpleSelectorDialogComponent, UserSimpleSelectorData } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';

import { SaleService } from 'src/app/core/services/sales/sale.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ProductSalesStats } from 'src/app/shared/entity/rcp/sale.rcp.entity';

export type SaleScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
  selector: 'app-sale-inventory-dashboard',
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
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './sale-inventory-dashboard.component.html',
  styleUrl: './sale-inventory-dashboard.component.scss'
})
export class SaleInventoryDashboardComponent {
  private readonly saleService = inject(SaleService);
  private readonly userService = inject(UserService);
  private readonly loggerService = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly CLASS_NAME = 'SaleInventoryDashboardComponent';

  scopeControl = new FormControl<SaleScopeType>('Personal', { nonNullable: true });
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
        return []; 
      default:
        return [];
    }
  });

  statsResource = rxResource({
    stream: () => this.saleService.getSalesStats(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.scope();
      this.statsResource.reload();
    });
  }

  tableData = computed(() => {
    return this.statsResource.value() ?? [];
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'product_image', header: 'Imagen', type: 'image', filterable: false },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'total_sales_count', header: 'Ventas', filterable: false },
      { key: 'total_units_sold', header: 'Unidades', filterable: false },
      { key: 'avg_sale_price', header: 'Precio Prom.', type: 'currency', filterable: false },
      { key: 'total_revenue', header: 'Ventas Totales', type: 'currency', filterable: false },
    ],
    searchableFields: ['product_name', 'product_sku'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  onViewDetail(row: ProductSalesStats): void {
    const usersCount = row.seller_metrics?.length ?? 0;

    if (usersCount === 1) {
      // Un solo usuario: Navegación directa
      this.router.navigate(['/sales/inventory', row.product_id, row.seller_metrics[0].user_id]);
    } else if (usersCount > 1) {
      // Múltiples usuarios: Decisión según el ámbito
      if (this.scope() === 'Grupal') {
        const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
          width: '600px',
          data: { userIds: row.seller_metrics.map(u => u.user_id) } as UserSimpleSelectorData
        });

        dialogRef.afterClosed().subscribe(user => {
          if (user) {
            this.router.navigate(['/sales/inventory', row.product_id, user.id]);
          }
        });
      } else {
        // En ámbitos como "Todos", vamos a la vista global (0)
        this.router.navigate(['/sales/inventory', row.product_id, 0]);
      }
    } else {
        // Ningún dato, pero navegamos al producto con ID 0 para el usuario
        this.router.navigate(['/sales/inventory', row.product_id, 0]);
    }
  }

  onAddSale(): void {
    this.router.navigate(['/sales/register']);
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }
}
