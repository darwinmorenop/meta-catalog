import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Models
import { ProductService } from 'src/app/core/services/products/product.service';
import { ProductStatusEnum } from 'src/app/core/models/products/product.status.enum';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';

@Component({
  selector: 'app-product-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.scss'
})
export class ProductDashboardComponent {
  private readonly productService = inject(ProductService);
  private readonly loggerService = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly CLASS_NAME = ProductDashboardComponent.name;

  /** * Usamos rxResource con 'stream' para manejar el Observable del servicio.
   * Esto elimina la necesidad de BehaviorSubject y loading$ manual.
   */
  productsResource = rxResource({
    stream: () => this.productService.getAll()
  });

  // --- Signals Derivados (Computed) ---

  // Conteo de productos activos
  activeCount = computed(() => {
    const products = this.productsResource.value() ?? [];
    return products.filter(p => p.status === ProductStatusEnum.Active).length;
  });

  // Conteo de productos con stock bajo
  lowStockCount = computed(() => {
    const products = this.productsResource.value() ?? [];
    return products.filter(p => p.stock.internal_stock < 10).length;
  });

  // Datos formateados para la tabla
  tableData = computed(() => {
    const products = this.productsResource.value() ?? [];
    return products.map(p => ({
      ...p,
      img_main: p.media?.find(m => m.is_main)?.url || p.media?.[0]?.url || '',
      category_name: p.category.name,
      price_display: new Intl.NumberFormat('es-ES', { 
        style: 'currency', 
        currency: p.pricing.currency 
      }).format(p.pricing.price),
      stock_internal: p.stock.internal_stock??0,
      stock_manufacturer: p.stock.manufacturer_stock??0,
      status_display: p.status.toUpperCase()
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'img_main', header: 'Imagen', type: 'image' },
      { key: 'name', header: 'Producto', filterable: true },
      { key: 'sku', header: 'SKU', filterable: true },
      { key: 'category_name', header: 'Categoría', filterable: true },
      { key: 'price_display', header: 'Precio', filterable: false },
      { key: 'stock_manufacturer', header: 'Stock fabricante', filterable: false },
      { key: 'stock_internal', header: 'Stock interno', filterable: false },
      { key: 'status_display', header: 'Estado', filterable: true }
    ],
    searchableFields: ['name', 'sku', 'category_name', 'status_display'],
    actions: {
      show: true,
      edit: true,
      delete: true,
      view: true
    },
    pageSizeOptions: [5, 10, 20]
  };

  // --- Métodos de Acción ---

  onEdit(product: any): void {
    this.loggerService.log('Edit product:', product, this.CLASS_NAME, 'onEdit');
    // The product in the table already has the full Product data plus some display fields
    this.productService.setCurrentProduct(product);
    this.router.navigate(['/products', product.id, 'edit']);
  }

  onDelete(product: any): void {
    this.loggerService.log('Delete product:', product, this.CLASS_NAME, 'onDelete');
  }

  onSelectionChange(product: any): void {
    this.loggerService.log('Selection changed:', product, this.CLASS_NAME, 'onSelectionChange');
    this.productService.setCurrentProduct(product);
  }

  onView(product: any): void {
    this.loggerService.log('View product detail:', product, this.CLASS_NAME, 'onView');
    // The product in the table already has the full Product data plus some display fields
    this.productService.setCurrentProduct(product);
    this.router.navigate(['/products', product.id]);
  }

  reloadProducts(): void {
    this.productsResource.reload();
  }
}