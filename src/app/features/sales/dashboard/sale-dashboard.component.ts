import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { SaleService } from 'src/app/core/services/sales/sale.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { SalePaymentMethodLabels, SaleStatusLabels } from 'src/app/shared/entity/sale.entity';
import { SaleDashboardEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';

export type SaleScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
  selector: 'app-sale-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: './sale-dashboard.component.html',
  styleUrl: './sale-dashboard.component.scss'
})
export class SaleDashboardComponent {
  private router = inject(Router);
  private saleService = inject(SaleService);
  private userService = inject(UserService);

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
        return []; // Important: empty array means NO filter in the DAO
      default:
        return [];
    }
  });

  salesResource = rxResource({
    stream: () => this.saleService.getAllDashboardData(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.scope();
      this.salesResource.reload();
    });
  }

  tableData = computed(() => {
    const raw = this.salesResource.value() || [];
    return raw.map(item => ({
      ...item,
      payment_method_label: SalePaymentMethodLabels[item.payment_method as keyof typeof SalePaymentMethodLabels] || item.payment_method,
      status_label: SaleStatusLabels[item.sale_overall_status as keyof typeof SaleStatusLabels] || item.sale_overall_status
    }));
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'created_at', header: 'Fecha', type: 'datetime', filterable: false },
      { key: 'seller_name', header: 'Vendedor', filterable: true },
      { key: 'buyer_name', header: 'Comprador', filterable: true },
      { key: 'payment_method_label', header: 'Pago', filterable: true },
      { key: 'total_items_sold', header: 'Items', filterable: false },
      { key: 'original_total_amount', header: 'Total', type: 'currency', filterable: false },
      { key: 'status_label', header: 'Estado', filterable: true }
    ],
    searchableFields: ['seller_name', 'buyer_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: false // Usually sales aren't deleted but cancelled
    }
  };

  onViewSale(item: SaleDashboardEntity) {
    this.router.navigate(['/sales', item.sale_id]);
  }

  onEditSale(item: SaleDashboardEntity) {
    this.router.navigate(['/sales', item.sale_id, 'edit']);
  }

  onAddSale() {
    this.router.navigate(['/sales/register']);
  }

  onViewStats() {
    this.router.navigate(['/sales/inventory']);
  }
}
