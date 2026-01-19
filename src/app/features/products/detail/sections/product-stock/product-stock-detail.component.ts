import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductDetailComponent } from 'src/app/features/products/detail/product-detail.component';

@Component({
  selector: 'app-product-stock-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule, MatProgressBarModule],
  templateUrl: 'product-stock-detail.component.html',
  styleUrl: 'product-stock-detail.component.scss'
})
export class ProductStockDetailComponent {
  private parent = inject(ProductDetailComponent);
  product = this.parent.product;

  stock = computed(() => this.product()?.stock);

  totalStock = computed(() => {
    const s = this.stock();
    if (!s) return 0;
    return (s.internal_stock || 0) + (s.manufacturer_stock || 0);
  });

  isLowStock = computed(() => {
    const s = this.stock();
    if (!s) return false;
    return s.internal_stock < (s.min_stock_alert || 10);
  });

  stockStatus = computed(() => {
    const s = this.stock();
    if (!s) return 'unknown';
    if (s.internal_stock === 0) return 'out';
    if (this.isLowStock()) return 'low';
    return 'ok';
  });
}
