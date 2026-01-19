import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

export interface StockEntryEditDialogData {
  quantity: number;
  unit_cost: number;
  batch_number: string;
  expiry_date: Date;
  description: string;
}

@Component({
  selector: 'app-stock-entry-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: 'stock-entry-edit-dialog.component.html',
  styleUrl: 'stock-entry-edit-dialog.component.scss'
})
export class StockEntryEditDialogComponent {
  private fb = inject(FormBuilder);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = StockEntryEditDialogComponent.name;
  dialogRef = inject(MatDialogRef<StockEntryEditDialogComponent>);
  data = inject<StockEntryEditDialogData>(MAT_DIALOG_DATA);
  form: FormGroup;

  constructor() {
    this.logger.debug(`Unit form with data:${JSON.stringify(this.data)}`, this.CLASS_NAME);
    this.form = this.fb.group({
      quantity: [this.data.quantity, [Validators.required]],
      unit_cost: [this.data.unit_cost, [Validators.required]],
      batch_number: [this.data.batch_number],
      expiry_date: [this.data.expiry_date ? new Date(this.data.expiry_date).toISOString().substring(0, 10) : ''],
      description: [this.data.description]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
