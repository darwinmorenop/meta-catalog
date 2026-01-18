import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { rxResource } from '@angular/core/rxjs-interop';

import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductWithSourcesEntity } from 'src/app/shared/entity/view/product.scrap.entity';

@Component({
  selector: 'app-scrap-product-dashboard',
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
  templateUrl: './scrap-product-dashboard.component.html',
  styleUrl: './scrap-product-dashboard.component.scss'
})
export class ScrapProductDashboardComponent {
  private readonly scrapService = inject(ScrapService);
  private readonly router = inject(Router);

  productsResource = rxResource({
    stream: () => this.scrapService.getProductsWithSources()
  });

  tableData = computed(() => {
    return this.productsResource.value() ?? [];
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image', filterable: false },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'product_manufacturer_ref', header: 'Ref. Fabricante', filterable: true },
      { key: 'product_status', header: 'Estado', filterable: true },
    ],
    searchableFields: ['product_sku', 'product_name', 'product_manufacturer_ref'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  onViewDetail(row: ProductWithSourcesEntity): void {
    this.scrapService.setCurrentProductWithSources(row);
    this.router.navigate(['/scraps/products', row.product_id]);
  }

  reload(): void {
    this.productsResource.reload();
  }
}
