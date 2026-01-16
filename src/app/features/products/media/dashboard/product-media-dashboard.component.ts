import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Models
import { ProductMediaService } from 'src/app/core/services/products/product-media.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductDashboardMediaEntity } from 'src/app/shared/entity/view/product.media.dashboard.entity';

@Component({
  selector: 'app-product-media-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: './product-media-dashboard.component.html',
  styleUrl: './product-media-dashboard.component.scss'
})
export class ProductMediaDashboardComponent implements OnInit {
  private readonly mediaService = inject(ProductMediaService);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductMediaDashboardComponent.name;
  private readonly router = inject(Router);
  
  mediaResource = rxResource({
    stream: () => this.mediaService.getAllMediaDashboardData()
  });

  tableData = computed(() => {
    const data = this.mediaResource.value() ?? [];
    return data.map(item => ({
      ...item,
      img_main: item.media_gallery.find(m => m.is_main)?.url || item.media_gallery[0]?.url || ''
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'img_main', header: 'Imagen', type: 'image' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'category_name', header: 'Categoría', filterable: true },
      { key: 'total_media_count', header: 'Total Media', filterable: false }
    ],
    searchableFields: ['product_name', 'product_sku', 'category_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      viewIcon: 'collections',
      edit: false,
      delete: false
    }
  };

  onViewMedia(row: ProductDashboardMediaEntity): void {
    this.mediaService.setCurrentProduct(row);
    this.router.navigate(['/products-media', row.product_id]);
  }

  ngOnInit(): void {
    this.loggerService.debug(`ProductMediaDashboardComponent ngOnInit`, this.CLASS_NAME, 'ngOnInit');
  }
}
