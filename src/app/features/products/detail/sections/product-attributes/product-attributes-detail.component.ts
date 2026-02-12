import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ProductAttributesDetailsItemComponent } from 'src/app/features/products/detail/sections/product-attributes/product-details/product-attributes-details-item.component';
import { ProductDetailComponent } from 'src/app/features/products/detail/product-detail.component';

@Component({
  selector: 'app-product-attributes-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatIconModule, MatChipsModule, ProductAttributesDetailsItemComponent],
  templateUrl: 'product-attributes-detail.component.html',
  styleUrl: 'product-attributes-detail.component.scss'
})
export class ProductAttributesDetailComponent {
  private parent = inject(ProductDetailComponent);
  product = this.parent.product;

  attributes = computed(() => this.product()?.attributes);

  claims = computed(() => {
    const attr = this.attributes();
    if (!attr || !attr.claims) return [];
    return [
      { label: 'Vegano', value: attr.claims.is_vegan, icon: 'eco' },
      { label: 'Cruelty Free', value: attr.claims.is_cruelty_free, icon: 'pets' },
      { label: 'Recargable', value: attr.claims.is_refillable, icon: 'refresh' }
    ].filter(c => c.value);
  });
}
