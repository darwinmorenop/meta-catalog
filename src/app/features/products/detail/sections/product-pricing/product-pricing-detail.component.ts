import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ProductDetailComponent } from 'src/app/features/products/detail/product-detail.component';

@Component({
  selector: 'app-product-pricing-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule],
  templateUrl: 'product-pricing-detail.component.html',
  styleUrl: 'product-pricing-detail.component.scss'
})
export class ProductPricingDetailComponent {
  private parent = inject(ProductDetailComponent);
  product = this.parent.product;

  pricing = computed(() => this.product()?.pricing);

  discountPercentage = computed(() => {
    const p = this.pricing();
    if (!p || !p.sale_price || p.sale_price >= p.price) return 0;
    return Math.round(((p.price - p.sale_price) / p.price) * 100);
  });

  hasOffer = computed(() => {
    const p = this.pricing();
    return p && p.sale_price && p.sale_price < p.price;
  });
}
