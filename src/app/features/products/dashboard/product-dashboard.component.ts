import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from 'src/app/core/services/products/product.service';
import { Product } from 'src/app/core/models/products/product.model';
import { Observable, map, of, shareReplay, BehaviorSubject, tap, catchError } from 'rxjs';
import { ProductStatusEnum } from 'src/app/core/models/products/product.status.enum';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/core/models/table-config';
import { RouterModule } from '@angular/router';

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
export class ProductDashboardComponent implements OnInit {
  private productService = inject(ProductService);

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  products$: Observable<Product[]> = this.productService.getAll().pipe(
    tap(() => this.loadingSubject.next(false)),
    catchError(err => {
      this.loadingSubject.next(false);
      console.error('Error loading products:', err);
      return of([]);
    }),
    shareReplay(1)
  );

  activeCount$: Observable<number> = this.products$.pipe(
    map(products => products.filter(p => p.status === ProductStatusEnum.Active).length)
  );
  lowStockCount$: Observable<number> = this.products$.pipe(
    map(products => products.filter(p => p.stock.internal_stock < 10).length)
  );

  tableData$: Observable<any[]> = this.products$.pipe(
    map(products => products.map(p => ({
      ...p,
      category_name: p.category.name,
      price_display: new Intl.NumberFormat('es-ES', { style: 'currency', currency: p.pricing.currency }).format(p.pricing.price),
      stock_display: p.stock.internal_stock,
      status_display: p.status.toUpperCase()
    })))
  );

  tableConfig: TableConfig = {
    columns: [
      { key: 'name', header: 'Producto', filterable: true },
      { key: 'sku', header: 'SKU', filterable: true },
      { key: 'category_name', header: 'Categoría', filterable: true },
      { key: 'price_display', header: 'Precio', filterable: false },
      { key: 'stock_display', header: 'Stock', filterable: false },
      { key: 'status_display', header: 'Estado', filterable: true }
    ],
    searchableFields: ['name', 'sku', 'category_name', 'status_display'],
    pageSizeOptions: [5, 10, 20]
  };

  ngOnInit(): void {}

  onEdit(product: any) {
    console.log('Edit product:', product);
  }

  onDelete(product: any) {
    console.log('Delete product:', product);
  }
}
