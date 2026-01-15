import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductEditComponent } from '../../product-edit.component';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-product-stock-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './product-stock-edit.component.html',
  styleUrl: './product-stock-edit.component.scss'
})
export class ProductStockEditComponent implements OnInit {
  private parent = inject(ProductEditComponent);
  private fb = inject(FormBuilder);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductStockEditComponent.name;
  
  product = this.parent.product;
  form!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const s = this.product()?.stock;
    this.form = this.fb.group({
      internal_stock: [s?.internal_stock || 0, [Validators.required, Validators.min(0)]],
      manufacturer_stock: [s?.manufacturer_stock || 0, [Validators.min(0)]],
      min_stock_alert: [s?.min_stock_alert || 10, [Validators.required, Validators.min(0)]]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.loggerService.info('Saving stock data:', this.form.getRawValue(), this.CLASS_NAME, 'onSave');
    }
  }
}
