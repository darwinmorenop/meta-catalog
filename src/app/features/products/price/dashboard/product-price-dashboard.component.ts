import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Models
import { ProductPriceService } from 'src/app/core/services/products/product-price.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductDashboardPriceEntity } from 'src/app/shared/entity/view/product.price.dashboard.entity';

@Component({
  selector: 'app-product-price-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: 'product-price-dashboard.component.html',
  styleUrl: 'product-price-dashboard.component.scss'
})
export class ProductPriceDashboardComponent implements OnInit {
  private readonly priceService = inject(ProductPriceService);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductPriceDashboardComponent.name;
  private readonly router = inject(Router);
  
  priceResource = rxResource({
    stream: () => this.priceService.getAllPriceDashboardData()
  });

  tableData = computed(() => {
    const data = this.priceResource.value() ?? [];
    return data.map(item => {
        // Obtenemos el precio actual (el primero de la lista si está ordenada por fecha desc)
        const currentPrice = item.price_list && item.price_list.length > 0 ? item.price_list.find(p => p.is_active) : null;
        return {
            ...item,
            current_original_price: currentPrice?.original_price || 0,
            current_sale_price: currentPrice?.sale_price || 0,
            is_offer: currentPrice ? currentPrice.sale_price < currentPrice.original_price : false
        };
    });
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image', filterable: false },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'category_name', header: 'Categoría', filterable: true },
      { key: 'current_original_price', header: 'P. Original', type: 'currency', filterable: false },
      { key: 'current_sale_price', header: 'P. Oferta', type: 'currency', filterable: false },
      { key: 'total_price_count', header: 'Histórico', filterable: false }
    ],
    searchableFields: ['product_name', 'product_sku', 'category_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      viewIcon: 'history',
      edit: false,
      delete: false
    }
  };

  onViewPrice(row: ProductDashboardPriceEntity): void {
    this.priceService.setCurrentProduct(row);
    this.router.navigate(['/products-price', row.product_id]);
  }

  ngOnInit(): void {
    this.loggerService.debug(`ProductPriceDashboardComponent ngOnInit`, this.CLASS_NAME, 'ngOnInit');
  }
}
