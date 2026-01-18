import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductWithSourcesEntity, ProductSourceDetail } from 'src/app/shared/entity/view/product.scrap.entity';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ScrapSourceViewDialogComponent } from './dialog/scrap-source-view-dialog.component';

@Component({
  selector: 'app-scrap-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    SmartTableComponent,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './scrap-product-detail.component.html',
  styleUrl: './scrap-product-detail.component.scss'
})
export class ScrapProductDetailComponent implements OnInit {
  private readonly scrapService = inject(ScrapService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  productId = signal<number>(0);
  productInfo = computed(() => {
    const data = this.sourcesResource.value();
    if (data && data.length > 0) {
      return data[0];
    }
    
    // Fallback al servicio si el recurso aún no ha cargado
    const savedProduct = this.scrapService.getCurrentProductWithSources();
    if (savedProduct && savedProduct.product_id === this.productId()) {
      return savedProduct;
    }
    
    return null;
  });

  private productId$ = toObservable(this.productId);

  sourcesResource = rxResource({
    stream: () => this.productId$.pipe(
      switchMap(id => {
        if (id === 0) return of([]);
        return this.scrapService.getProductsWithSources(id);
      })
    )
  });

  tableData = computed(() => {
    const data = this.sourcesResource.value();
    if (data && data.length > 0) {
      return data[0].sources || [];
    }
    return [];
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'scraped_at', header: 'Fecha Captura', type: 'datetime' },
      { key: 'campaign_name', header: 'Campaña' },
      { key: 'code', header: 'Código Origen' },
      { key: 'original_price', header: 'Precio Orig.', type: 'currency' },
      { key: 'sale_price', header: 'Precio Oferta', type: 'currency' },
      { key: 'status', header: 'Estado' },
    ],
    searchableFields: ['campaign_name', 'code', 'status'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['productId']);
      this.productId.set(id);
    });
  }

  onViewSource(row: ProductSourceDetail): void {
    this.dialog.open(ScrapSourceViewDialogComponent, {
      width: '600px',
      data: row
    });
  }

  goBack(): void {
    this.router.navigate(['/scraps/products']);
  }
}
