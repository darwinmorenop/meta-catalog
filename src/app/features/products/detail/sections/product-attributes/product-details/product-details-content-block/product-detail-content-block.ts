import { Component, input } from '@angular/core';
import { ProductDetailsContentBlock } from 'src/app/core/models/products/product.attributes.model';
@Component({
  selector: 'app-content-block',
  standalone: true,
  imports: [ProductDetailContentBlockComponent],
  templateUrl: './product-detail-content-block.html',
  styleUrl: './product-detail-content-block.scss',
})
export class ProductDetailContentBlockComponent {
  block = input.required<ProductDetailsContentBlock>();
  depth = input<number>(0); // Nivel de profundidad para indentación visual
}