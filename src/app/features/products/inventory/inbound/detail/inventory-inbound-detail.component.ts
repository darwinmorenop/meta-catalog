import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { InventoryInboundService } from 'src/app/core/services/inventory/inventory-inbound.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { InventoryInboundStatusEnum } from 'src/app/shared/entity/view/inventory.inbound.entity';

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
    SmartTableComponent
  ],
  templateUrl: './inventory-inbound-detail.component.html',
  styleUrl: './inventory-inbound-detail.component.scss'
})
export class InventoryInboundDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inboundService = inject(InventoryInboundService);

  id = signal<number | null>(null);

  inboundResource = rxResource({
    stream: () => {
      const id = this.id();
      if (!id) return of(null);
      return this.inboundService.getInboundById(id);
    }
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_image', header: 'Imagen', type: 'image' },
      { key: 'product_name', header: 'Producto' },
      { key: 'product_sku', header: 'SKU' },
      { key: 'quantity', header: 'Cantidad' },
      { key: 'unit_cost', header: 'Costo Unit.', type: 'currency' },
      { key: 'batch_number', header: 'Lote' },
      { key: 'expiry_date', header: 'Vence', type: 'date' }
    ],
    searchableFields: ['product_name', 'product_sku'],
    pageSizeOptions: [10, 20],
    actions: {
      show: false
    }
  };

  tableData = computed(() => {
    const data = this.inboundResource.value() as any;
    if (!data?.products) return [];
    
    return data.products.map((p: any) => ({
      ...p,
      product_name: p.product?.name,
      product_sku: p.product?.sku,
      product_image: p.product?.media?.find((m: any) => m.is_main)?.url || p.product?.media?.[0]?.url || ''
    }));
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(Number(idParam));
    }
  }

  getStatusLabel(status: string): string {
    return InventoryInboundStatusEnum[status as keyof typeof InventoryInboundStatusEnum] || status;
  }

  goBack() {
    this.router.navigate(['/inventory/stock-entry']);
  }
}
