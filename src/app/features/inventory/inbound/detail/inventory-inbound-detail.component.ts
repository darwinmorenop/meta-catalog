import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { InventoryInboundService } from 'src/app/core/services/inventory/inventory-inbound.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { InventoryInboundStatusEnum, InventoryInboundStatusLabels } from 'src/app/shared/entity/inventory.inbound.entity';
import { MatDialog } from '@angular/material/dialog';
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';
import { InventoryInboundDashboardDetailedEntity } from 'src/app/shared/entity/view/inventory.dashboard.inbound.entity';

@Component({
  selector: 'app-inventory-inbound-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SmartTableComponent
  ],
  templateUrl: 'inventory-inbound-detail.component.html',
  styleUrl: 'inventory-inbound-detail.component.scss'
})
export class InventoryInboundDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private inboundService = inject(InventoryInboundService);
  private stockService = inject(ProductInventoryStockEntryService);
  private snackBar = inject(MatSnackBar);

  id = signal<number | null>(null);

  inboundResource = rxResource({
    stream: () => {
      const id = this.id();
      if (!id) return of([]);
      return this.inboundService.getInboundByIdDetailedDashboardData(id);
    }
  });

  headerInfo = computed(() => {
    const data = this.inboundResource.value();
    if (!data || data.length === 0) return null;
    return data[0];
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_sku', header: 'SKU' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'quantity', header: 'Cant.' },
      { key: 'unit_cost', header: 'Costo Unit.', type: 'currency' },
      { key: 'line_total_cost', header: 'Monto Total', type: 'currency' },
      { key: 'batch_number', header: 'Lote' },
      { key: 'expiry_date', header: 'Vence', type: 'date' },
      { key: 'description', header: 'Descripción' },
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
    return this.inboundResource.value() || [];
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
    }
  }

  getStatusLabel(status: string): string {
    return InventoryInboundStatusLabels[status as InventoryInboundStatusEnum] || status;
  }

  goBack() {
    this.router.navigate(['/inventory/inbound']);
  }

  onViewDetail(item: InventoryInboundDashboardDetailedEntity) {
    this.snackBar.open('En el futuro cruzar informacion de precios en el momento que se creó el stock', 'Entendido', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
