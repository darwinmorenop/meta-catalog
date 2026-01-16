import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';

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
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>Editar Registro de Precio</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Precio Original</mat-label>
            <input matInput type="number" formControlName="original_price" placeholder="0.00">
            <mat-icon matSuffix>euro_symbol</mat-icon>
            <mat-error *ngIf="form.get('original_price')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Precio Oferta</mat-label>
            <input matInput type="number" formControlName="sale_price" placeholder="0.00">
            <mat-icon matSuffix>euro_symbol</mat-icon>
            <mat-error *ngIf="form.get('sale_price')?.hasError('required')">Requerido</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha Inicio Oferta</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="offer_start_date">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha Fin Oferta</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="offer_end_date">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo / Razón del cambio</mat-label>
          <textarea matInput formControlName="reason" rows="3" placeholder="Ej: Nueva campaña, ajuste de mercado..."></textarea>
        </mat-form-field>

        <mat-checkbox formControlName="is_active" color="primary">¿Precio Activo?</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSave()" [disabled]="form.invalid">Guardar Cambios</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      & > * { flex: 1; }
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class PriceHistoryEditDialogComponent {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<PriceHistoryEditDialogComponent>);
  form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { price: PriceHistoryEntity }) {
    this.form = this.fb.group({
      id: [data.price.id],
      original_price: [data.price.original_price, Validators.required],
      sale_price: [data.price.sale_price, Validators.required],
      offer_start_date: [data.price.offer_start],
      offer_end_date: [data.price.offer_end],
      reason: [data.price.reason],
      is_active: [data.price.is_active]
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
