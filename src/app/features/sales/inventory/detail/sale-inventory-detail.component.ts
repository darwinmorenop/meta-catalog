import { Component, inject, computed, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SaleService } from 'src/app/core/services/sales/sale.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { SaleDetailedEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { SaleStatus, SaleStatusLabels } from 'src/app/shared/entity/sale.entity';
import { SaleProductDialogComponent } from 'src/app/features/sales/register/sale-product-dialog/sale-product-dialog.component';
import { SaleSimpleSelectorDialogComponent } from 'src/app/features/sales/dialog/simple-selector/sale-simple-selector-dialog.component';
import { SaleDashboardEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';

@Component({
  selector: 'app-sale-inventory-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: 'sale-inventory-detail.component.html',
  styleUrl: 'sale-inventory-detail.component.scss'
})
export class SaleInventoryDetailComponent implements OnInit {
  private readonly saleService = inject(SaleService);
  private readonly loggerService = inject(LoggerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly CLASS_NAME = 'SaleInventoryDetailComponent';

  productId = signal<number>(0);
  userId = signal<number>(0);

  private params$ = toObservable(computed(() => ({
    productId: this.productId(),
    userId: this.userId()
  })));

  salesHistoryResource = rxResource({
    stream: () => this.params$.pipe(
      switchMap(params => {
        if (params.productId === 0) return of([]);
        // Si userId es 0, pasamos undefined para que el DAO no filtre por usuario (ver todo el producto)
        const filterUserIds = params.userId > 0 ? [params.userId] : undefined;
        return this.saleService.getSalesByProductId(params.productId, filterUserIds);
      })
    )
  });

  productInfo = computed(() => {
    const data = this.salesHistoryResource.value();
    if (data && data.length > 0) {
        return {
            name: data[0].product_name,
            sku: data[0].product_sku,
            image: data[0].product_image
        };
    }
    return null;
  });

  tableData = computed(() => {
    const raw = this.salesHistoryResource.value() ?? [];
    return raw.map(item => ({
      ...item,
      status_label: SaleStatusLabels[item.item_status] || item.item_status,
      // Deshabilitar edición si ya está cancelado o reembolsado (negativo)
      smart_table_edit_disabled: item.quantity < 0 || item.item_status === SaleStatus.cancelled || item.item_status === SaleStatus.refunded,
      smart_table_delete_disabled: item.quantity < 0 || item.item_status === SaleStatus.cancelled || item.item_status === SaleStatus.refunded
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'sale_date', header: 'Fecha', type: 'datetime', filterable: false },
      { key: 'sale_id', header: 'Venta ID', filterable: true },
      { key: 'source_user_name', header: 'Vendedor', filterable: true },
      { key: 'target_user_name', header: 'Comprador', filterable: true },
      { key: 'quantity', header: 'Cant.', filterable: false },
      { key: 'unit_price', header: 'Precio', type: 'currency', filterable: false },
      { key: 'discount_amount', header: 'Dcto.', type: 'currency', filterable: false },
      { key: 'line_revenue', header: 'Total', type: 'currency', filterable: false },
      { key: 'status_label', header: 'Estado', filterable: true },
    ],
    searchableFields: ['source_user_name', 'target_user_name', 'sale_id'],
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
      this.productId.set(Number(params['productId']));
      this.userId.set(Number(params['userId']));
    });
  }

  onViewSale(item: SaleDetailedEntity): void {
    this.router.navigate(['/sales', item.sale_id]);
  }

  onEditItem(item: SaleDetailedEntity): void {
    const dialogRef = this.dialog.open(SaleProductDialogComponent, {
      width: '1000px',
      data: { product: item, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Al editar desde aquí, tenemos que regenerar el objeto de venta completo o usar un rpc parcial
        // Para simplificar, usamos la lógica de SaleRegisterComponent pero cargando la venta
        this.saveModification(item.sale_id, result);
      }
    });
  }

  private saveModification(saleId: number, itemResult: any) {
      // Necesitamos cargar la venta completa, actualizar el item y guardar
      this.saleService.getSaleByIdDetailedData(saleId).subscribe(details => {
          if (details && details.length > 0) {
              const items = details.map(i => {
                  if (i.item_id === itemResult.item_id) {
                      return {
                        id: itemResult.item_id,
                        product_id: itemResult.product_id,
                        quantity: itemResult.quantity,
                        unit_price: itemResult.unit_price,
                        discount_amount: itemResult.discount_amount,
                        unit_cost_at_sale: itemResult.unit_cost_at_sale,
                        status: itemResult.item_status,
                        description: itemResult.item_description
                      };
                  }
                  return {
                      id: i.item_id,
                      product_id: i.product_id,
                      quantity: i.quantity,
                      unit_price: i.unit_price,
                      discount_amount: i.discount_amount,
                      unit_cost_at_sale: i.unit_cost_at_sale,
                      status: i.item_status,
                      description: i.item_description
                  };
              });

              const payload = {
                  id: saleId,
                  user_source_id: details[0].source_user_id,
                  user_target_id: details[0].target_user_id,
                  payment_method: details[0].payment_method,
                  status: details[0].sale_status,
                  items: items as any,
                  total_amount: items.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price - curr.discount_amount), 0)
              };

              this.saleService.saveSale(payload).subscribe(() => {
                  this.snackBar.open('Item actualizado correctamente', 'Cerrar', { duration: 3000 });
                  this.salesHistoryResource.reload();
              });
          }
      }, err => {
          this.loggerService.error('Error saving modification', err, this.CLASS_NAME, 'saveModification');
          this.snackBar.open('Error al actualizar el item', 'Cerrar', { duration: 3000 });
      });
  }

  onDeleteItem(item: SaleDetailedEntity): void {
    if (confirm('¿Estás seguro de que deseas anular este ítem de la venta?')) {
        this.saleService.getSaleByIdDetailedData(item.sale_id).subscribe(details => {
            if (details && details.length > 0) {
                const items = details.map(i => ({
                    id: i.item_id,
                    product_id: i.product_id,
                    quantity: i.item_id === item.item_id ? -Math.abs(i.quantity) : i.quantity,
                    unit_price: i.unit_price,
                    discount_amount: i.item_id === item.item_id ? -Math.abs(i.discount_amount || 0) : i.discount_amount,
                    unit_cost_at_sale: i.unit_cost_at_sale,
                    status: i.item_id === item.item_id ? SaleStatus.cancelled : i.item_status,
                    description: i.item_id === item.item_id ? `Anulado desde vista de producto` : i.item_description
                }));

                const payload = {
                    id: item.sale_id,
                    user_source_id: details[0].source_user_id,
                    user_target_id: details[0].target_user_id,
                    payment_method: details[0].payment_method,
                    status: details[0].sale_status,
                    items: items as any,
                    total_amount: items.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price - curr.discount_amount), 0)
                };

                this.saleService.saveSale(payload).subscribe(() => {
                    this.snackBar.open('Item anulado correctamente', 'Cerrar', { duration: 3000 });
                    this.salesHistoryResource.reload();
                });
            }
        });
    }
  }

  onLinkToSale(): void {
    const info = this.productInfo();
    if (!info) return;

    // 1. Seleccionar la venta
    const saleSelector = this.dialog.open(SaleSimpleSelectorDialogComponent, {
      width: '900px',
      data: { 
        userIds: this.userId() > 0 ? [this.userId()] : undefined,
        title: `Vincular ${info.name} a una venta existente`
      }
    });

    saleSelector.afterClosed().subscribe((selectedSale: SaleDashboardEntity) => {
      if (selectedSale) {
        // 2. Definir parámetros del producto (precio, cantidad, etc)
        // Mapeamos a lo que espera SaleProductDialogComponent
        const productForDialog = {
            id: this.productId(),
            name: info.name,
            sku: info.sku,
            img_main: info.image,
            price: 0 // Se actualizará en el diálogo si se selecciona
        };

        const productDialog = this.dialog.open(SaleProductDialogComponent, {
          width: '1000px',
          data: { product: productForDialog, isEdit: true } // Usamos isEdit: true para que fije el producto
        });

        productDialog.afterClosed().subscribe(result => {
          if (result) {
            // 3. Guardar el nuevo ítem en la venta seleccionada
            this.saveNewItemToSale(selectedSale.sale_id, result);
          }
        });
      }
    });
  }

  private saveNewItemToSale(saleId: number, itemResult: any) {
    this.saleService.getSaleByIdDetailedData(saleId).subscribe(details => {
        if (details && details.length > 0) {
            const items = details.map(i => ({
                id: i.item_id,
                product_id: i.product_id,
                quantity: i.quantity,
                unit_price: i.unit_price,
                discount_amount: i.discount_amount,
                unit_cost_at_sale: i.unit_cost_at_sale,
                status: i.item_status,
                description: i.item_description
            }));

            // Añadimos el nuevo item
            items.push({
                id: undefined as any, // Nuevo item
                product_id: itemResult.product_id,
                quantity: itemResult.quantity,
                unit_price: itemResult.unit_price,
                discount_amount: itemResult.discount_amount,
                unit_cost_at_sale: itemResult.unit_cost_at_sale,
                status: itemResult.item_status,
                description: itemResult.item_description
            });

            const payload = {
                id: saleId,
                user_source_id: details[0].source_user_id,
                user_target_id: details[0].target_user_id,
                payment_method: details[0].payment_method,
                status: details[0].sale_status,
                items: items as any,
                total_amount: items.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price - (curr.discount_amount || 0)), 0)
            };

            this.saleService.saveSale(payload).subscribe(() => {
                this.snackBar.open('Producto vinculado a la venta correctamente', 'Cerrar', { duration: 3000 });
                this.salesHistoryResource.reload();
            }, err => {
                this.loggerService.error('Error linking product to sale', err, this.CLASS_NAME, 'saveNewItemToSale');
                this.snackBar.open('Error al vincular el producto', 'Cerrar', { duration: 3000 });
            });
        }
    });
  }

  goBack(): void {
    this.router.navigate(['/sales/inventory']);
  }
}
