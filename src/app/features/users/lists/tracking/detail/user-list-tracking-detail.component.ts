import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { rxResource } from '@angular/core/rxjs-interop';

import { UserListService } from 'src/app/core/services/users/user.list.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ListItemViewEntity } from 'src/app/shared/entity/view/list.view.entity';
import { UserListTrackingSaleDialogComponent } from './dialog/sale/user-list-tracking-sale-dialog.component';
import { UserListTrackingTargetDialogComponent } from './dialog/target/user-list-tracking-target-dialog.component';
import { ListItemTrackingTypeEnum, ListItemTrackingTypeLabel } from 'src/app/shared/entity/list.entity';

@Component({
  selector: 'app-user-list-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: './user-list-tracking-detail.component.html',
  styleUrl: './user-list-tracking-detail.component.scss'
})
export class UserListTrackingDetailComponent {
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
      tracking_type_label: this.getTrackingTypeLabel(item.tracking_type),
      smart_table_view_disabled: item.tracking_type === ListItemTrackingTypeEnum.none
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
      edit: false,
      delete: false
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

  goBack() {
    this.router.navigate(['/tracking']);
  }
}
