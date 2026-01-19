import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { InventoryInboundService } from 'src/app/core/services/inventory/inventory-inbound.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { InventoryInboundDashboardEntity, InventoryInboundDashboardDetailedEntity } from 'src/app/shared/entity/view/inventory.dashboard.inbound.entity';
import { InventoryInboundStatusEnum } from 'src/app/shared/entity/inventory.inbound.entity';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProductInventoryStockEntryService } from 'src/app/core/services/products/product-inventory-stock-entry.service';

@Component({
  selector: 'app-inventory-inbound-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule,
    SmartTableComponent
  ],
  templateUrl: 'inventory-inbound-dashboard.component.html',
  styleUrl: 'inventory-inbound-dashboard.component.scss'
})
export class InventoryInboundDashboardComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private inboundService = inject(InventoryInboundService);
  private stockService = inject(ProductInventoryStockEntryService);
  private userService = inject(UserService);

  scopeControl = new FormControl<'Personal' | 'Grupal' | 'Todos'>('Personal', { nonNullable: true });
  scope = toSignal(this.scopeControl.valueChanges, { initialValue: this.scopeControl.value });

  filteredUserIds = computed(() => {
    const scope = this.scope();
    const currentUser = this.userService.currentUser();
    const network = this.userService.currentUserNetwork() || [];

    if (!currentUser) return [];

    switch (scope) {
      case 'Personal':
        return [currentUser.id];
      case 'Grupal':
        return network.map((u: UserNetworkDetail) => u.id);
      case 'Todos':
        return [];
      default:
        return [];
    }
  });

  inboundsResource = rxResource({
    stream: () => this.inboundService.getAllDashboardData(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.scope();
      this.inboundsResource.reload();
    });
  }

  tableData = computed(() => {
    const raw = this.inboundsResource.value() || [];
    return raw.map(item => ({
      ...item,
      smart_table_delete_disabled: item.inbound_status === InventoryInboundStatusEnum.deleted
    }));
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'reference_number', header: 'Referencia', filterable: false },
      { key: 'target_user_full_name', header: 'Destinatario', filterable: true },
      { key: 'source_user_full_name', header: 'Remitente', filterable: true },
      { key: 'total_unique_products', header: 'Productos', filterable: false },
      { key: 'total_items_quantity', header: 'Cantidad Total', filterable: false },
      { key: 'total_inbound_value', header: 'Valor Total', type: 'currency', filterable: false },
      { key: 'received_at', header: 'Fecha Recepción', type: 'datetime', filterable: false },
      { key: 'inbound_status_label', header: 'Estado', filterable: true },
      { key: 'description', header: 'Descripción', filterable: false }
    ],
    searchableFields: ['reference_number', 'target_user_full_name', 'source_user_full_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  onViewInbound(item: InventoryInboundDashboardEntity) {
    this.router.navigate(['/inventory/inbound', item.inbound_id]);
  }

  onEditInbound(item: InventoryInboundDashboardEntity) {
    this.router.navigate(['/inventory/inbound', item.inbound_id, 'edit']);
  }

  onDeleteInbound(item: InventoryInboundDashboardEntity) {
    this.inboundService.getInboundByIdDetailedDashboardData(item.inbound_id).pipe(
      switchMap((details: InventoryInboundDashboardDetailedEntity[]) => {
        if (!details || details.length === 0) {
          return of(true);
        }

        const entriesToReverse = details.map(detail => ({
          product_id: detail.product_id,
          quantity: detail.quantity * -1,
          unit_cost: detail.unit_cost,
          batch_number: detail.batch_number,
          expiry_date: detail.expiry_date,
          user_owner_id: detail.target_user_id,
          inbound_id: detail.inbound_id
        }));

        const insertions = entriesToReverse.map(entry => this.stockService.insert(entry));
        return forkJoin(insertions).pipe(
          map(results => results.every(res => res))
        );
      }),
      switchMap(success => {
        if (!success) {
          this.snackBar.open('Error al revertir el stock de los productos', 'Cerrar', { duration: 3000 });
          return of(false);
        }
        return this.inboundService.update(item.inbound_id, { status: InventoryInboundStatusEnum.deleted });
      })
    ).subscribe({
      next: (success) => {
        if (success) {
          this.snackBar.open('Inbound y stock revertidos correctamente', 'Cerrar', { duration: 3000 });
          this.inboundsResource.reload();
        }
      },
      error: (err) => {
        console.error('Error deleting inbound:', err);
        this.snackBar.open('Ocurrió un error al intentar eliminar el inbound', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onAddInbound() {
    this.router.navigate(['/inventory/inbound/register']);
  }

  goBack() {
    this.router.navigate(['/inventory/stock-entry']);
  }
}
