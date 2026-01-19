import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { SaleService } from 'src/app/core/services/sales/sale.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { SalePaymentMethodLabels, SaleStatusLabels } from 'src/app/shared/entity/sale.entity';
import { SaleDetailedEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { SaleItemViewDialogComponent } from './dialog/sale-item-view-dialog/sale-item-view-dialog.component';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: 'sale-detail.component.html',
  styleUrl: 'sale-detail.component.scss'
})
export class SaleDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private saleService = inject(SaleService);
  private dialog = inject(MatDialog);

  id = signal<number | null>(null);

  saleResource = rxResource({
    stream: () => {
      const id = this.id();
      if (!id) return of([]);
      return this.saleService.getSaleByIdDetailedData(id);
    }
  });

  headerInfo = computed(() => {
    const data = this.saleResource.value();
    if (!data || data.length === 0) return null;
    const first = data[0];
    return {
      ...first,
      status_label: SaleStatusLabels[first.sale_status as keyof typeof SaleStatusLabels] || first.sale_status,
      payment_method_label: SalePaymentMethodLabels[first.payment_method as keyof typeof SalePaymentMethodLabels] || first.payment_method
    };
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_sku', header: 'SKU' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'quantity', header: 'Cant.' },
      { key: 'unit_price', header: 'Precio Unit.', type: 'currency' },
      { key: 'discount_amount', header: 'Dcto.', type: 'currency' },
      { key: 'line_total', header: 'Total Línea', type: 'currency' }
    ],
    searchableFields: ['product_name', 'product_sku'],
    pageSizeOptions: [10, 20],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  tableData = computed(() => {
    return this.saleResource.value() || [];
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
    }
  }

  onEdit() {
    this.router.navigate(['/sales', this.id(), 'edit']);
  }

  onViewSaleItem(item: SaleDetailedEntity) {
    this.dialog.open(SaleItemViewDialogComponent, {
      width: '700px',
      data: item
    });
  }

  goBack() {
    this.router.navigate(['/sales']);
  }
}
