import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductEditComponent } from '../../product-edit.component';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { DateTimeRangeComponent } from 'src/app/shared/components/date-time-range/date-time-range.component';

@Component({
  selector: 'app-product-pricing-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    DateTimeRangeComponent
  ],
  templateUrl: './product-pricing-edit.component.html',
  styleUrl: './product-pricing-edit.component.scss'
})
export class ProductPricingEditComponent implements OnInit {
  private parent = inject(ProductEditComponent);
  private readonly fb = inject(FormBuilder);
  private readonly loggerService = inject(LoggerService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly CLASS_NAME = ProductPricingEditComponent.name;
  
  product = this.parent.product;
  form!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const p = this.product()?.pricing;
    this.form = this.fb.group({
      price: [p?.price || 0, [Validators.required, Validators.min(0)]],
      sale_price: [p?.sale_price || null, [Validators.min(0)]],
      currency: [p?.currency || 'EUR', [Validators.required]],
      offer_start_date: [this.dateUtils.formatDateForInput(p?.offer_start_date)],
      offer_end_date: [this.dateUtils.formatDateForInput(p?.offer_end_date)]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.loggerService.info('Saving pricing data:', this.form.getRawValue(), this.CLASS_NAME, 'onSave');
    }
  }
}
