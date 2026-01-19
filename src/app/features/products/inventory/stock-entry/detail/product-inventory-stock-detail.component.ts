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
import { StockEntryEditDialogComponent, StockEntryEditDialogData } from 'src/app/features/products/inventory/stock-entry/dialog/edit-dialog/stock-entry-edit-dialog.component';
import { StockEntryCreateDialogComponent, StockEntryCreateDialogData } from 'src/app/features/products/inventory/stock-entry/dialog/create-dialog/stock-entry-create-dialog.component';

// Services & Models
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductInventoryStockEntryDetailedEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.detailed.entity';
import { ProductInventoryStockEntryDashboardEntity } from 'src/app/shared/entity/view/product.inventory.stock-entry.dashboard.entity';
import { ProductService } from 'src/app/core/services/products/product.service';
import { ProductInventoryStockEntryEntity } from 'src/app/shared/entity/product.inventory.stock-entry.entity';

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
  templateUrl: 'product-inventory-stock-detail.component.html',
  styleUrl: 'product-inventory-stock-detail.component.scss'
})
export class ProductInventoryStockDetailComponent implements OnInit {
  private readonly stockService = inject(ProductInventoryStockEntryService);
  private readonly productService = inject(ProductService);
  private readonly loggerService = inject(LoggerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly CLASS_NAME = ProductInventoryStockDetailComponent.name;

  productId = signal<number>(0);
  userId = signal<number>(0);
  productInfo = signal<ProductInventoryStockEntryDashboardEntity | null>(null);

  private params$ = toObservable(computed(() => ({
    productId: this.productId(),
    userId: this.userId()
  })));

  stockHistoryResource = rxResource({
    stream: () => this.params$.pipe(
      switchMap(params => {
        if (params.productId === 0 || params.userId === 0) return of([]);
        return this.stockService.getByProductIdAndUserId(params.productId, params.userId);
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
      { key: 'inbound_reference_number', header: 'Documento/Origen', filterable: true },
      { key: 'description', header: 'Descripción', filterable: true },
    ],
    searchableFields: ['batch_number', 'inbound_reference_number'],
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
    this.route.params.subscribe(params => {
      this.productId.set(Number(params['productId']));
      this.userId.set(Number(params['userId']));
      if (this.stockService.getCurrentDashboardRow()
        && this.stockService.getCurrentDashboardRow()?.product_id === this.productId()) {
        this.productInfo.set(this.stockService.getCurrentDashboardRow());
      } else {
        this.loggerService.warn(`Not found current selected product with productId:${this.productId()} and data:${JSON.stringify(this.stockService.getCurrentDashboardRow())}`, this.CLASS_NAME, context);
        this.goBack();
      }
    });

  }

  onViewEntry(entry: ProductInventoryStockEntryDetailedEntity) {
    this.dialog.open(StockEntryViewDialogComponent, {
      width: '500px',
      data: entry
    });
  }

  onEditEntry(entry: ProductInventoryStockEntryDetailedEntity) {
    const dataEntry: StockEntryEditDialogData = {
      quantity: entry.quantity,
      unit_cost: entry.unit_cost,
      batch_number: entry.batch_number,
      expiry_date: entry.expiry_date,
      description: entry.description
    };
    const dialogRef = this.dialog.open(StockEntryEditDialogComponent, {
      width: '600px',
      data: dataEntry
    });

    dialogRef.afterClosed().subscribe((result: StockEntryEditDialogData) => {
      if (result) {
        const updateData: Partial<ProductInventoryStockEntryEntity> = {
          id: entry.id,
          quantity: result.quantity,
          unit_cost: result.unit_cost,
          batch_number: result.batch_number,
          expiry_date: result.expiry_date,
          description: result.description
        };
        this.stockService.update(updateData).subscribe(success => {
          if (success) {
            this.stockHistoryResource.reload();
          }
        });
      }
    });
  }

  onAddStock() {
    const info = this.productInfo()!;
    const entry: StockEntryCreateDialogData = {
      product_id: info.product_id,
      user_owner_id: this.userId(),
      product_name: info.product_name,
      product_sku: info.product_sku,
      quantity: 1,
      unit_cost: info.global_avg_unit_cost ?? 0
    };

    const dialogRef = this.dialog.open(StockEntryCreateDialogComponent, {
      width: '600px',
      autoFocus: false,
      data: entry
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
      const insertData : Partial<ProductInventoryStockEntryEntity> = {
        product_id: entry.product_id,
        quantity: entry.quantity * -1,
        unit_cost: entry.unit_cost,
        batch_number: entry.batch_number,
        expiry_date: entry.expiry_date,
        user_owner_id: entry.user_owner_id,
        inbound_id: entry.inbound_id,
        description: `Entrada de stock eliminada id:${entry.id}`
      };
      this.stockService.insert(insertData).subscribe(success => {
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
