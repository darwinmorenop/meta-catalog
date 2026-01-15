import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ProductDetailComponent } from '../../product-detail.component';

@Component({
  selector: 'app-product-general',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule],
  templateUrl: './product-general.component.html',
  styleUrl: './product-general.component.scss'
})
export class ProductGeneralComponent {
  private parent = inject(ProductDetailComponent);
  product = this.parent.product;

  categoryPath = computed(() => {
    const p = this.product();
    return p?.category?.full_path || 'N/A';
  });
}
