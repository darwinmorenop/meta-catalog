import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from 'src/app/core/services/products/product.service';
import { Product } from 'src/app/core/models/products/product.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductEditComponent.name;

  product = signal<Product | null>(null);
  isLoading = signal(true);

  productId = computed(() => this.product()?.id);
  productMainImage = computed(() => {
    const p = this.product();
    if (!p) return null;
    return p.media?.find(m => m.is_main)?.url || p.media?.[0]?.url || null;
  });

  navLinks = [
    { path: 'general', label: 'General', icon: 'edit' },
    { path: 'attributes', label: 'Atributos', icon: 'list_alt' }
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(+id);
      }
    });
  }

  private loadProduct(id: number) {
    const context = 'loadProduct';
    const cached = this.productService.getAndClearCurrentProduct();
    if (cached && (cached as Product).id === id) {
      this.product.set(cached as Product);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.productService.getById(id).subscribe({
      next: (res) => {
        this.product.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loggerService.error(`Error loading product ${id} for editing`, err, this.CLASS_NAME, context);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
