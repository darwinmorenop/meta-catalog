import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';
import { DateTimeRangeComponent } from 'src/app/shared/components/date-time-range/date-time-range.component';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-price-history-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule,
    DateTimeRangeComponent
  ],
  templateUrl: 'price-history-edit-dialog.component.html',
  styleUrl: 'price-history-edit-dialog.component.scss'
})
export class PriceHistoryEditDialogComponent {
  private fb = inject(FormBuilder);
  private dateUtils = inject(DateUtilsService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = PriceHistoryEditDialogComponent.name;
  
  dialogRef = inject(MatDialogRef<PriceHistoryEditDialogComponent>);
  form: FormGroup;
  data = inject<{ price?: PriceHistoryEntity, productId?: string }>(MAT_DIALOG_DATA);

  get isEdit(): boolean {
    return !!this.data.price?.id;
  }

  get title(): string {
    return this.isEdit ? 'Editar Registro de Precio' : 'Nuevo Registro de Precio';
  }

  constructor() {
    const context = 'constructor';
    this.loggerService.debug(`PriceHistoryEditDialogComponent initialized with data: ${JSON.stringify(this.data)}`, this.CLASS_NAME, context);
    
    const formattedStartDate = this.isEdit ? this.dateUtils.formatDateForInput(this.data.price?.offer_start) : '';
    const formattedEndDate = this.isEdit ? this.dateUtils.formatDateForInput(this.data.price?.offer_end) : '';
    
    this.form = this.fb.group({
      id: [this.data.price?.id],
      product_id: [this.data.productId || ''],
      original_price: [this.data.price?.original_price || 0, Validators.required],
      sale_price: [this.data.price?.sale_price || 0, Validators.required],
      offer_start: [formattedStartDate],
      offer_end: [formattedEndDate],
      reason: [this.data.price?.reason || ''],
      is_active: [this.data.price?.is_active ?? true]
    });

    this.loggerService.debug(`Form values after initialization: ${JSON.stringify(this.form.value)}`, this.CLASS_NAME, context);
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
