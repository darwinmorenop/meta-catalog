import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';

@Component({
  selector: 'app-scrap-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SmartTableComponent,
    MatCardModule,
    RouterModule
  ],
  templateUrl: 'scrap-detail.component.html',
  styleUrls: ['scrap-detail.component.scss']
})
export class ScrapDetailComponent implements OnInit {
  private scrapService = inject(ScrapService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ScrapDetailComponent.name;

  scrapId: number | null = null;
  products = signal<ProductScrapEntity[]>([]);
  scrapSummary = signal<ScrapSummaryEntry | null>(null);
  isLoading = signal<boolean>(false);

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'product_manufacturer_ref', header: 'Ref. Fabr.', filterable: true },
      { key: 'source_status', header: 'Estado Fuente', filterable: true, type: 'badge' },
      { key: 'source_stock', header: 'Stock', filterable: true },
      { key: 'source_sale_price', header: 'Precio Venta', filterable: true, type: 'currency' }
    ],
    searchableFields: ['product_name', 'product_manufacturer_ref'],
    pageSizeOptions: [10, 20, 50, 100],
    actions: { show: true, edit: false, delete: false, view: true }
  };

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.scrapId = +id;
        this.loadProducts();
        this.loadSummary();
      }
    });
  }

  loadProducts() {
    const context = 'loadProducts';
    if (this.scrapId === null) return;

    this.isLoading.set(true);
    this.scrapService.getProductsByScrapId(this.scrapId).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loggerService.error('Error loading products for scrap:', err, this.CLASS_NAME, context);
        this.isLoading.set(false);
      }
    });
  }

  loadSummary() {
    const context = 'loadSummary';
    if (this.scrapId === null) return;
    this.scrapService.getSummaryById(this.scrapId).subscribe({
      next: (summary) => this.scrapSummary.set(summary),
      error: (err) => this.loggerService.error('Error loading summary:', err, this.CLASS_NAME, context)
    });
  }

  goBack() {
    this.router.navigate(['/scraps']);
  }

  onProductView(product: ProductScrapEntity) {
    const context = 'onProductView';
    this.loggerService.debug(`Product selected: ${JSON.stringify(product)}`, this.CLASS_NAME, context);
    this.scrapService.setCurrentProduct(product);
    this.router.navigate(['/scraps', this.scrapId, 'products', product.product_id]);
  }
}
