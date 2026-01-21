import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { rxResource } from '@angular/core/rxjs-interop';

import { UserListService } from 'src/app/core/services/users/user.list.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ListItemTrackingTypeEnum, ListItemTrackingTypeLabel } from 'src/app/shared/entity/list.entity';
import { ProductSelectorDialogComponent } from '../../../edit/product-selector-dialog/product-selector-dialog.component';
import { UserListTrackingSaleDialogComponent } from '../view/sale/user-list-tracking-sale-dialog.component';
import { UserListTrackingTargetDialogComponent } from '../view/target/user-list-tracking-target-dialog.component';
import { UserListTrackingSaleEditDialogComponent } from './sale/user-list-tracking-sale-edit-dialog.component';
import { UserListTrackingTargetEditDialogComponent } from './target/user-list-tracking-target-edit-dialog.component';
import { Product } from 'src/app/core/models/products/product.model';
import { ListItemRcpUpsertRequestEntity } from 'src/app/shared/entity/rcp/list.rcp.entity';

@Component({
  selector: 'app-user-list-tracking-edit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: './user-list-tracking-edit.component.html',
  styleUrl: './user-list-tracking-edit.component.scss'
})
export class UserListTrackingEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private listService = inject(UserListService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  readonly listId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  readonly showName = computed(() => this.route.snapshot.queryParamMap.get('showName') === 'true');

  itemsResource = rxResource({
    stream: () => this.listService.getAllItemsComplete(this.listId())
  });

  ownerName = computed(() => {
    const items = this.itemsResource.value() as any[];
    return (items && items.length > 0) ? items[0].owner_full_name : null;
  });

  tableData = computed<any[]>(() => {
    const items = this.itemsResource.value() || [];
    return items.map(item => ({
      ...item,
      tracking_type_label: this.getTrackingTypeLabel(item.tracking_type)
    }));
  });

  getTrackingTypeLabel(type: string): string {
    return ListItemTrackingTypeLabel[type as ListItemTrackingTypeEnum] || type;
  }

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image' },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'original_price', header: 'Precio original', type: 'currency' },
      { key: 'sale_price', header: 'Precio de venta', type: 'currency' },
      { key: 'price_at_addition', header: 'Precio al añadir', type: 'currency' },
      { key: 'target_price', header: 'Precio objetivo', type: 'currency' },
      { key: 'added_at', header: 'Añadido el', type: 'datetime', filterable: false },
      { key: 'price_difference', header: 'Diferencia de precio', type: 'currency' },
      { key: 'discount_percentage', header: 'Porcentaje de descuento' },
      { key: 'tracking_type_label', header: 'Tipo de seguimiento', type: 'text' },
    ],
    searchableFields: ['product_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  onViewProduct(item: any) {
    if (item.tracking_type === ListItemTrackingTypeEnum.sale) {
      this.dialog.open(UserListTrackingSaleDialogComponent, {
        width: '500px',
        data: item
      });
    } else if (item.tracking_type === ListItemTrackingTypeEnum.target) {
      this.dialog.open(UserListTrackingTargetDialogComponent, {
        width: '500px',
        data: item
      });
    }
  }

  onAddProduct(type: 'sale' | 'target') {
    // We open selector. Once closed, we handle the additions.
    const existingIds = this.tableData().map(i => i.product_id);
    const dialogRef = this.dialog.open(ProductSelectorDialogComponent, {
      width: '800px',
      data: { existingIds, multiple: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.added && result.added.length > 0) {
        this.processAdditions(result.added[0], type);
      }
    });
  }

  private async processAdditions(product: Product, type: 'sale' | 'target') {
    const trackingType = type === 'sale' ? ListItemTrackingTypeEnum.sale : ListItemTrackingTypeEnum.target;
    const priceAtAddition = (product.pricing.sale_price && product.pricing.sale_price > 0) ? product.pricing.sale_price : product.pricing.price;
    this.onEditProduct({
      ...product,
      product_id: product.id,
      product_name: product.name,
      product_main_image: product.media?.find((m: any) => m.is_main)?.url || 'assets/images/placeholder.png',
      price_at_addition: priceAtAddition,
      tracking_type: trackingType
    }, true);
  }

  onEditProduct(item: any, isNew: boolean = false) {
    const dialogComponent = item.tracking_type === ListItemTrackingTypeEnum.sale
      ? UserListTrackingSaleEditDialogComponent
      : UserListTrackingTargetEditDialogComponent;

    const dialogRef = this.dialog.open(dialogComponent as any, {
      width: '600px',
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const payload: ListItemRcpUpsertRequestEntity = {
          p_list_id: this.listId(),
          p_product_id: item.product_id,
          p_target_price: result.target_price,
          p_tracking_type: result.tracking_type
        };

        this.listService.upsertItem(payload).subscribe({
          next: () => {
            const msg = isNew ? 'Producto añadido' : 'Seguimiento actualizado';
            this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
            this.itemsResource.reload();
          },
          error: () => {
            this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }


  onDeleteProduct(item: any) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de entrada?')) {
      this.listService.removeItem(this.listId(), item.item_id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Producto eliminado', 'Cerrar', { duration: 3000 });
            this.itemsResource.reload();
          } else {
            this.snackBar.open('Error al eliminar el producto', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Error de conexión', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/tracking']);
  }
}
