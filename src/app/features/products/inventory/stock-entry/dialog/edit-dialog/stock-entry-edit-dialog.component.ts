import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

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
  templateUrl: './stock-entry-edit-dialog.component.html',
  styleUrl: './stock-entry-edit-dialog.component.scss'
})
export class StockEntryEditDialogComponent {
  private fb = inject(FormBuilder);
  private dateUtils = inject(DateUtilsService);
  dialogRef = inject(MatDialogRef<StockEntryEditDialogComponent>);
  data = inject<any>(MAT_DIALOG_DATA);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [this.data.entry.id],
      quantity: [this.data.entry.quantity, [Validators.required, Validators.min(0)]],
      unit_cost: [this.data.entry.unit_cost, [Validators.required, Validators.min(0)]],
      batch_number: [this.data.entry.batch_number],
      expiry_date: [this.data.entry.expiry_date ? new Date(this.data.entry.expiry_date).toISOString().substring(0, 10) : '']
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
