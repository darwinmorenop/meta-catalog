import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { rxResource } from '@angular/core/rxjs-interop';
import { SaleService } from 'src/app/core/services/sales/sale.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { SaleDashboardEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { SaleStatusLabels } from 'src/app/shared/entity/sale.entity';

export interface SaleSimpleSelectorData {
  userIds?: number[];
  title?: string;
}

@Component({
  selector: 'app-sale-simple-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SmartTableComponent
  ],
  templateUrl: './sale-simple-selector-dialog.component.html',
  styleUrl: './sale-simple-selector-dialog.component.scss'
})
export class SaleSimpleSelectorDialogComponent {
  private readonly saleService = inject(SaleService);
  readonly dialogRef = inject(MatDialogRef<SaleSimpleSelectorDialogComponent>);
  readonly data = inject<SaleSimpleSelectorData>(MAT_DIALOG_DATA, { optional: true });

  salesResource = rxResource({
    stream: () => this.saleService.getAllDashboardData(this.data?.userIds)
  });

  tableData = computed(() => {
    const raw = this.salesResource.value() || [];
    return raw.map(item => ({
      ...item,
      status_label: SaleStatusLabels[item.sale_overall_status as keyof typeof SaleStatusLabels] || item.sale_overall_status
    }));
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'sale_id', header: 'ID', filterable: true },
      { key: 'created_at', header: 'Fecha', type: 'datetime' },
      { key: 'seller_name', header: 'Vendedor' },
      { key: 'buyer_name', header: 'Comprador' },
      { key: 'original_total_amount', header: 'Total', type: 'currency' },
      { key: 'status_label', header: 'Estado' }
    ],
    searchableFields: ['seller_name', 'buyer_name', 'sale_id'],
    pageSizeOptions: [5, 10],
    actions: {
      show: false // Deactivamos acciones para que el click en la fila sea la selección
    }
  };

  onSelect(sale: SaleDashboardEntity) {
    if (sale) {
      this.dialogRef.close(sale);
    }
  }
}
