import { Component, input, computed } from '@angular/core';
import { ProductDetails, ProductDetailsContentBlock } from 'src/app/core/models/products/product.attributes.model';
import { ProductDetailContentBlockComponent } from 'src/app/features/products/detail/sections/product-attributes/product-details/product-details-content-block/product-detail-content-block';

interface ProductSection {
  id: string;
  label: string;
  icon: string;
  blocks: ProductDetailsContentBlock[];
}

@Component({
  selector: 'app-product-attributes-details-item',
  standalone: true,
  imports: [ProductDetailContentBlockComponent],
  templateUrl: './product-attributes-details-item.component.html',
  styleUrl: './product-attributes-details-item.component.scss',
})
export class ProductAttributesDetailsItemComponent {
  product = input.required<ProductDetails>();

  /** Secciones visibles (solo las que tienen contenido) */
  sections = computed<ProductSection[]>(() => {
    const p = this.product();
    return [
      { id: 'description',   label: 'Descripción',             icon: '📝', blocks: p.description },
      { id: 'benefits',      label: 'Por qué te encantará',    icon: '✨', blocks: p.benefits },
      { id: 'usage',         label: 'Modo de uso',             icon: '🧴', blocks: p.usage },
      { id: 'ingredients',   label: 'Ingredientes destacados', icon: '🧬', blocks: p.ingredients_commercial },
    ].filter(s => s.blocks?.length > 0);
  });

  hasImages = computed(() => this.product().images?.length > 0);
  hasVideos = computed(() => this.product().videos?.length > 0);
  hasModalIngredients = computed(() => this.product().ingredients_modal?.length > 0);
}