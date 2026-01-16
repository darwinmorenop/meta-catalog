import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StockEntryViewDialogComponent } from 'src/app/features/products/inventory/stock-entry/dialog/view-dialog/stock-entry-view-dialog.component';
import { StockEntryEditDialogComponent } from 'src/app/features/products/inventory/stock-entry/dialog/edit-dialog/stock-entry-edit-dialog.component';
import { LinkStockToInboundDialogComponent } from 'src/app/features/products/inventory/stock-entry/dialog/link-inbound/link-stock-to-inbound-dialog.component';

// Services & Models
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductInventoryStockEntryDetailedEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.detailed.entity';

@Component({
  selector: 'app-product-inventory-stock-detail',
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
  templateUrl: './product-inventory-stock-detail.component.html',
  styleUrl: './product-inventory-stock-detail.component.scss'
})
export class ProductInventoryStockDetailComponent implements OnInit {
  private readonly stockService = inject(ProductInventoryStockEntryService);
  private readonly loggerService = inject(LoggerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly CLASS_NAME = ProductInventoryStockDetailComponent.name;

  productId = signal<string | null>(null);
  userId = signal<string | null>(null);
  productInfo = signal<any>(null);

  private params$ = toObservable(computed(() => ({
    productId: this.productId(),
    userId: this.userId()
  })));

  stockHistoryResource = rxResource({
    stream: () => this.params$.pipe(
        switchMap(params => {
            if (!params.productId) return of([]);
            const userIdParam = params.userId === 'all' ? '' : params.userId || '';
            return this.stockService.getByProductIdAndUserId(params.productId, userIdParam);
        })
    )
  });

  tableData = computed(() => this.stockHistoryResource.value() ?? []);

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'created_at', header: 'Fecha', type: 'date', filterable: false },
      { key: 'quantity', header: 'Cantidad', filterable: false },
      { key: 'unit_cost', header: 'Costo Unit.', type: 'currency', filterable: false },
      { key: 'batch_number', header: 'Lote', filterable: true },
      { key: 'expiry_date', header: 'Vencimiento', type: 'date', filterable: false },
      { key: 'inbound_description', header: 'Documento/Origen', filterable: true }
    ],
    searchableFields: ['batch_number', 'inbound_description'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId.set(params['productId']);
      this.userId.set(params['userId']);
    });
    this.productInfo.set(this.stockService.getCurrentDashboardRow());
  }

  onViewEntry(entry: ProductInventoryStockEntryDetailedEntity) {
    this.dialog.open(StockEntryViewDialogComponent, {
      width: '500px',
      data: { entry }
    });
  }

  onEditEntry(entry: ProductInventoryStockEntryDetailedEntity) {
    const dialogRef = this.dialog.open(StockEntryEditDialogComponent, {
      width: '600px',
      data: { entry }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.stockService.update(result).subscribe(success => {
          if (success) {
            this.stockHistoryResource.reload();
          }
        });
      }
    });
  }

  onAddStock() {
    const info = this.productInfo();
    const entry = {
      product_id: info?.product_id,
      user_owner_id: info?.user_owner_id,
      product_name: info?.product_name,
      product_sku: info?.product_sku,
      quantity: 1,
      unit_cost: 0
    };

    const dialogRef = this.dialog.open(LinkStockToInboundDialogComponent, {
      width: '600px',
      autoFocus: false,
      data: { entry }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const insertData = {
          ...entry,
          ...result
        };
        this.stockService.insert(insertData).subscribe(success => {
          if (success) {
            this.stockHistoryResource.reload();
          }
        });
      }
    });
  }

  onDeleteEntry(entry: ProductInventoryStockEntryDetailedEntity) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de entrada de stock?')) {
      this.stockService.delete(entry.id).subscribe(success => {
        if (success) {
          this.stockHistoryResource.reload();
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/inventory/stock-entry']);
  }
}
