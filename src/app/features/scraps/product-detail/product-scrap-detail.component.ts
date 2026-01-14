import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-product-scrap-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './product-scrap-detail.component.html',
  styleUrls: ['./product-scrap-detail.component.scss']
})
export class ProductScrapDetailComponent implements OnInit {
  private scrapService = inject(ScrapService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loggerService = inject(LoggerService)
  private readonly CLASS_NAME = ProductScrapDetailComponent.name

  scrapId: number | null = null;
  productId: number | null = null;
  product = signal<ProductScrapEntity | null>(null);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const sId = params.get('scrapId');
      const pId = params.get('productId');
      if (sId && pId) {
        this.scrapId = +sId;
        this.productId = +pId;
        this.loadProductDetail();
      }
    });
  }

  loadProductDetail() {
    const context = 'loadProductDetail'
    if (this.scrapId === null || this.productId === null) return;

    // Try to get from shared state first to avoid redundant call
    const cachedProduct = this.scrapService.getAndClearCurrentProduct();
    if (cachedProduct && cachedProduct.product_id === this.productId && cachedProduct.source_scrap_id === this.scrapId) {
      this.product.set(cachedProduct);
      return;
    }

    this.isLoading.set(true);
    this.scrapService.getProductScrapDetail(this.scrapId, this.productId).subscribe({
      next: (data) => {
        this.product.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loggerService.error('Error loading product scrap detail:', err, this.CLASS_NAME, context);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    if (this.scrapId) {
      this.router.navigate(['/scraps', this.scrapId]);
    } else {
      this.router.navigate(['/scraps']);
    }
  }
}
