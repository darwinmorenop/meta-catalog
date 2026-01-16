import { Component, inject, computed, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PriceHistoryViewDialogComponent } from './dialog/view-dialog/price-history-view-dialog.component';
import { PriceHistoryEditDialogComponent } from './dialog/edit-dialog/price-history-edit-dialog.component';

// Services & Models
import { ProductPriceService } from 'src/app/core/services/products/product-price.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductDashboardPriceEntity } from 'src/app/shared/entity/view/product.price.dashboard.entity';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';

@Component({
  selector: 'app-product-price-history',
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
  templateUrl: './product-price-history.component.html',
  styleUrl: './product-price-history.component.scss'
})
export class ProductPriceHistoryComponent implements OnInit {
  // If true, hide header and back button (used when embedded in product edit tabs)
  @Input() embedded = false;
  private readonly priceService = inject(ProductPriceService);
  private readonly loggerService = inject(LoggerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly CLASS_NAME = ProductPriceHistoryComponent.name;

  productId = signal<string | null>(null);
  private productId$ = toObservable(this.productId);
  
  // Intentamos obtener el producto desde el servicio (el "current" seteado)
  product = signal<ProductDashboardPriceEntity | null>(null);

  // Recurso para cargar el historial si no viene en el "current" o si se refresca la página
  priceHistoryResource = rxResource({
    stream: () => this.productId$.pipe(
        switchMap(id => {
            if (!id) return of([] as PriceHistoryEntity[]);
            
            // Si ya tenemos el producto y tiene lista de precios, la usamos primero
            const current = this.product();
            if (current && current.price_list && current.price_list.length > 0) {
                return of(current.price_list);
            }
            return this.priceService.getPriceByProductId(id);
        })
    )
  });

  tableData = computed(() => {
    return this.priceHistoryResource.value() ?? [];
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'updated_at', header: 'Fecha Actualización', type: 'date', filterable: false },
      { key: 'original_price', header: 'P. Original', type: 'currency', filterable: false },
      { key: 'sale_price', header: 'P. Oferta', type: 'currency', filterable: false },
      { key: 'is_active', header: 'Estado', type: 'boolean', filterable: true },
      { key: 'reason', header: 'Motivo / Nota', filterable: true }
    ],
    searchableFields: ['reason'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  ngOnInit(): void {
    const context = 'ngOnInit';
    
    // Recuperamos el producto seteado en el dashboard
    const current = this.priceService.getAndClearCurrentProduct();
    if (current) {
        this.product.set(current);
    }

    this.route.params.subscribe(params => {
      const id = params['productId'] || params['id'];
      if (id) {
        this.productId.set(id);
      }
    });

    this.loggerService.debug(`ProductPriceHistoryComponent initialized for product: ${this.productId()}`, this.CLASS_NAME, context);
  }

  onDeletePrice(price: PriceHistoryEntity): void {
    if (confirm('¿Estás seguro de que deseas eliminar este registro histórico de precio?')) {
        this.priceService.deletePrice(price.id).subscribe(success => {
            if (success) {
                this.priceHistoryResource.reload();
            }
        });
    }
  }

  onViewPrice(price: PriceHistoryEntity): void {
    this.dialog.open(PriceHistoryViewDialogComponent, {
      width: '500px',
      data: { price }
    });
  }

  onEditPrice(price: PriceHistoryEntity): void {
    const dialogRef = this.dialog.open(PriceHistoryEditDialogComponent, {
      width: '600px',
      data: { price }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.priceService.updatePrice(result).subscribe((success: boolean) => {
            if (success) {
                this.priceHistoryResource.reload();
            }
        });
      }
    });
  }

  onCreatePrice(): void {
    const dialogRef = this.dialog.open(PriceHistoryEditDialogComponent, {
      width: '600px',
      data: { productId: this.productId() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.priceService.createPrice(result).subscribe((success: boolean) => {
          if (success) {
            this.priceHistoryResource.reload();
          }
        });
      }
    });
  }

  goBack(): void {
    if (this.embedded) {
        const id = this.productId();
        this.router.navigate(['/products', id, 'edit']);
    } else {
        this.router.navigate(['/products-price-dashboard']);
    }
  }
}
