import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductEditComponent } from '../edit/product-edit.component';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';

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
    MatIconModule,
    MatTabsModule,
    MatSelectModule
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
  
  purchaseForm!: FormGroup;
  saleForm!: FormGroup;

  ngOnInit() {
    this.initForms();
  }

  private initForms() {
    const p = this.product();
    
    this.purchaseForm = this.fb.group({
      parent: [p?.id || null],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unit_cost: [0, [Validators.required, Validators.min(0)]],
      source: ['', [Validators.required]],
      received_at: [new Date().toISOString().substring(0, 16)], // datetime-local format
      expiry_date: [''],
      batch_number: ['']
    });

    this.saleForm = this.fb.group({
      parent: [p?.id || null],
      target: ['', [Validators.required]],
      total_amount: [0, [Validators.required, Validators.min(0)]],
      payment_method: ['Efectivo', [Validators.required]],
      status: ['completed', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]],
      unit_cost_at_sale: [0],
      discount_amount: [0, [Validators.min(0)]]
    });
  }

  onSavePurchase() {
    if (this.purchaseForm.valid) {
      this.loggerService.info('Saving Purchase (Inbound):', this.purchaseForm.getRawValue(), this.CLASS_NAME, 'onSavePurchase');
    }
  }

  onSaveSale() {
    if (this.saleForm.valid) {
      this.loggerService.info('Saving Sale (Outbound):', this.saleForm.getRawValue(), this.CLASS_NAME, 'onSaveSale');
    }
  }
}
