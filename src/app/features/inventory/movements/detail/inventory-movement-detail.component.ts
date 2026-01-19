import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { InventoryMovementService } from 'src/app/core/services/inventory/inventory-movement.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductMovementReport, InventoryMovementTypeLabels, InventoryMovementType } from 'src/app/shared/entity/rcp/inventory.movement.rcp.entity';

@Component({
  selector: 'app-inventory-movement-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    SmartTableComponent,
    RouterModule,
    MatProgressSpinnerModule
  ],
  templateUrl: 'inventory-movement-detail.component.html',
  styleUrl: 'inventory-movement-detail.component.scss'
})
export class InventoryMovementDetailComponent implements OnInit {
  private readonly movementService = inject(InventoryMovementService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = 'InventoryMovementDetailComponent';

  productId = signal<number>(0);
  userId = signal<number>(0);

  private params$ = toObservable(computed(() => ({
    productId: this.productId(),
    userId: this.userId()
  })));

  reportResource = rxResource({
    stream: () => this.params$.pipe(
      switchMap(params => {
        if (params.productId === 0) return of([]);
        // Si userId es 0, pedimos todo el producto (array vacío de usuarios)
        const filterUserIds = params.userId > 0 ? [params.userId] : [];
        return this.movementService.getAllDashboardData(filterUserIds, [params.productId]);
      })
    )
  });

  productInfo = computed(() => {
    const data = this.reportResource.value();
    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  });

  tableData = computed(() => {
    const report = this.productInfo();
    if (!report) return [];

    let movements: any[] = [];

    if (this.userId() > 0) {
      // Un solo dueño
      const owner = report.owners.find(o => o.user_id === this.userId());
      if (owner) {
        movements = owner.movements.map(m => ({
          ...m,
          owner_name: owner.owner_name,
          type_label: {
            value: InventoryMovementTypeLabels[m.type as keyof typeof InventoryMovementTypeLabels] || m.type,
            color: this.getMovementColor(m.type)
          }
        }));
      }
    } else {
      // Todos los dueños
      report.owners.forEach(owner => {
        const ownerMovements = owner.movements.map(m => ({
          ...m,
          owner_name: owner.owner_name,
          type_label: {
            value: InventoryMovementTypeLabels[m.type as keyof typeof InventoryMovementTypeLabels] || m.type,
            color: this.getMovementColor(m.type)
          }
        }));
        movements = movements.concat(ownerMovements);
      });
    }

    // Ordenar por fecha descendente
    return movements.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'created_at', header: 'Fecha', type: 'datetime', filterable: true },
      { key: 'owner_name', header: 'Propietario', filterable: true },
      { key: 'type_label', header: 'Tipo', type: 'badge', filterable: true },
      { key: 'quantity', header: 'Cantidad', filterable: false },
      { key: 'reason', header: 'Razón', filterable: true },
    ],
    searchableFields: ['owner_name', 'reason', 'type_label'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true, // Para ver el documento origen (venta o entrada) si implementamos el link
      edit: false,
      delete: false
    }
  };

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId.set(Number(params['productId']));
      this.userId.set(Number(params['userId']));
    });
  }

  onViewDocument(row: any): void {
    if (row.sale_item_id) {
        this.router.navigate(['/sales']);
    } else if (row.stock_entry_id) {
        this.router.navigate(['/inventory/inbound']);
    }
  }

  private getMovementColor(type: string): string {
    const context = "getMovementColor";
    let result = '#6b7280';
    switch (type) {
      case InventoryMovementType.OUT: result = '#ef4444'; break; // Red
      case InventoryMovementType.IN: result = '#10b981'; break; // Green
      case InventoryMovementType.RETURN: result = '#3b82f6'; break; // Blue
      case InventoryMovementType.ADJUSTMENT: result = '#6b7280'; break; // Gray
      default: result = '#6b7280'; break;
    }
    this.loggerService.trace(`Movement color: ${result} for type: ${type}`,this.CLASS_NAME,context);
    return result;
  }

  goBack(): void {
    this.router.navigate(['/inventory/movements']);
  }
}
