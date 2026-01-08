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
  templateUrl: './scrap-detail.component.html',
  styleUrls: ['./scrap-detail.component.scss']
})
export class ScrapDetailComponent implements OnInit {
  private scrapService = inject(ScrapService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  scrapId: number | null = null;
  products = signal<ProductScrapEntity[]>([]);
  isLoading = signal<boolean>(false);

  tableConfig: TableConfig = {
    columns: [
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
      }
    });
  }

  loadProducts() {
    if (this.scrapId === null) return;
    
    this.isLoading.set(true);
    this.scrapService.getProductsByScrapId(this.scrapId).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products for scrap:', err);
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/scraps']);
  }
}
