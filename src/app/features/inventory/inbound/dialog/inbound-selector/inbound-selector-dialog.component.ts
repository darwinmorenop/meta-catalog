import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { InventoryInboundService } from 'src/app/core/services/inventory/inventory-inbound.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { InventoryInboundStatusEnum } from 'src/app/shared/entity/inventory.inbound.entity';

export interface InboundSelectorDialogData {
  statusFiltered?: boolean;
}

@Component({
  selector: 'app-inbound-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    SmartTableComponent
  ],
  templateUrl: './inbound-selector-dialog.component.html',
  styleUrl: './inbound-selector-dialog.component.scss'
})
export class InboundSelectorDialogComponent {
  private inboundService = inject(InventoryInboundService);
  public dialogRef = inject(MatDialogRef<InboundSelectorDialogComponent>);
  private data = inject<InboundSelectorDialogData>(MAT_DIALOG_DATA, { optional: true });

  inboundResource = rxResource({
    stream: () => this.inboundService.getAll()
  });

  tableData = computed(() => {
    const raw = this.inboundResource.value() ?? [];
    if (this.data?.statusFiltered) {
      return raw.filter(item => item.status !== InventoryInboundStatusEnum.deleted);
    }
    return raw;
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'id', header: 'ID', filterable: true },
      { key: 'reference_number', header: 'Referencia', filterable: true },
      { key: 'status', header: 'Estado', filterable: true },
      { key: 'created_at', header: 'Fecha Creación', type: 'date' }
    ],
    searchableFields: ['reference_number'],
    actions: {
      show: false
    },
    pageSizeOptions: [5, 10]
  };

  onSelectionChange(inbound: any) {
    this.dialogRef.close(inbound);
  }
}
