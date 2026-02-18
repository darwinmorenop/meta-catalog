import { Component, inject, signal, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryInboundEntity } from 'src/app/shared/entity/inventory.inbound.entity';
import { InboundSelectorDialogComponent, InboundSelectorDialogData } from 'src/app/features/inventory/inbound/dialog/inbound-selector/inbound-selector-dialog.component';

export interface StockEntryCreateDialogData {
  product_id: number;
  user_owner_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_cost: number;
}

@Component({
  selector: 'app-link-stock-to-inbound-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  templateUrl: 'stock-entry-create-dialog.component.html',
  styleUrl: 'stock-entry-create-dialog.component.scss',
  encapsulation: ViewEncapsulation.None // To ensure our container resets work correctly
})
export class StockEntryCreateDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<StockEntryCreateDialogComponent>);
  data = inject<StockEntryCreateDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  selectedInbound = signal<InventoryInboundEntity | null>(null);

  ngOnInit() {
    this.form = this.fb.group({
      quantity: [this.data.quantity || 1, [Validators.required, Validators.min(1)]],
      unit_cost: [this.data.unit_cost || 0, [Validators.required, Validators.min(0)]],
      batch_number: [''],
      expiry_date: [new Date()]
    });
  }

  openSelector() {
    const dataInput: InboundSelectorDialogData = { statusFiltered: true }
    const dialogRef = this.dialog.open(InboundSelectorDialogComponent, {
      width: '850px',
      panelClass: 'inbound-selector-panel',
      data: dataInput
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.selectedInbound.set(res);
      }
    });
  }

  save() {
    if (this.form.valid && this.selectedInbound()) {
      const val = this.form.value;
      const result = {
        ...val,
        inbound_id: this.selectedInbound()!.id,
        user_owner_id: this.selectedInbound()!.user_target_id,
        expiry_date: val.expiry_date ? val.expiry_date.toISOString().split('T')[0] : null
      };
      this.dialogRef.close(result);
    }
  }
}
