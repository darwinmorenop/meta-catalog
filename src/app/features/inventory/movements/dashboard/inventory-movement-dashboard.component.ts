import { Component, inject, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { InventoryMovementService } from 'src/app/core/services/inventory/inventory-movement.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { ProductMovementReport } from 'src/app/shared/entity/rcp/inventory.movement.rcp.entity';
import { UserSimpleSelectorDialogComponent, UserSimpleSelectorData } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';

export type MovementScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
  selector: 'app-inventory-movement-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SmartTableComponent,
    RouterModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: 'inventory-movement-dashboard.component.html',
  styleUrl: 'inventory-movement-dashboard.component.scss'
})
export class InventoryMovementDashboardComponent implements OnInit {
  private readonly movementService = inject(InventoryMovementService);
  private readonly userService = inject(UserService);
  private readonly loggerService = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly CLASS_NAME = 'InventoryMovementDashboardComponent';

  scopeControl = new FormControl<MovementScopeType>('Personal', { nonNullable: true });
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

  movementsResource = rxResource({
    stream: () => this.movementService.getAllDashboardData(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.scope();
      this.movementsResource.reload();
    });
  }

  tableData = computed(() => {
    const data = this.movementsResource.value() ?? [];
    return data.map(report => ({
      ...report,
      owners_count: report.owners?.length || 0,
      total_stock: report.owners?.reduce((acc, curr) => acc + (curr.owner_current_stock || 0), 0) || 0
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'product_image', header: 'Imagen', type: 'image', filterable: false },
      { key: 'product_sku', header: 'SKU', filterable: true },
      { key: 'product_name', header: 'Producto', filterable: true },
      { key: 'owners_count', header: 'Propietarios', filterable: false },
      { key: 'total_stock', header: 'Stock Total', filterable: false },
    ],
    searchableFields: ['product_name', 'product_sku'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: false,
      delete: false
    }
  };

  onViewDetail(row: ProductMovementReport): void {
    const owners = row.owners || [];
    if (owners.length === 1) {
      this.router.navigate(['/inventory/movements', row.product_id, owners[0].user_id]);
    } else if (owners.length > 1) {
      if (this.scope() === 'Grupal') {
        const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
          width: '600px',
          data: { userIds: owners.map(o => o.user_id) } as UserSimpleSelectorData
        });
        dialogRef.afterClosed().subscribe(user => {
          if (user) {
            this.router.navigate(['/inventory/movements', row.product_id, user.id]);
          }
        });
      } else {
        // Vista global para el producto
        this.router.navigate(['/inventory/movements', row.product_id, 0]);
      }
    } else {
       this.router.navigate(['/inventory/movements', row.product_id, 0]);
    }
  }

  ngOnInit(): void {
    this.loggerService.debug(`${this.CLASS_NAME} initialized`, this.CLASS_NAME, 'ngOnInit');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
