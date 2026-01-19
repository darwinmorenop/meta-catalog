import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductService } from 'src/app/core/services/products/product.service';
import { rxResource } from '@angular/core/rxjs-interop';

export interface StockEntryCreateEditWithoutProductDialogData {
  product?: any; 
  isEdit: boolean;
}

@Component({
  selector: 'app-inventory-inbound-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    SmartTableComponent
  ],
  templateUrl: 'stock-entry-create-edit-without-product-dialog.component.html',
  styleUrl: 'stock-entry-create-edit-without-product-dialog.component.scss'
})
export class StockEntryCreateEditWithoutProductDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  dialogRef = inject(MatDialogRef<StockEntryCreateEditWithoutProductDialogComponent>);
  data = inject<StockEntryCreateEditWithoutProductDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  selectedProduct = signal<any>(null);
  
  productsResource = rxResource({
    stream: () => this.productService.getAll()
  });

  tableData = computed(() => {
    const products = this.productsResource.value() ?? [];
    return products.map(p => ({
      ...p,
      img_main: p.media?.find(m => m.is_main)?.url || p.media?.[0]?.url || '',
      category_name: p.category.full_path,
      stock_internal: p.stock.internal_stock ?? 0
    }));
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'img_main', header: 'Imagen', type: 'image' },
      { key: 'name', header: 'Producto', filterable: false },
      { key: 'category_name', header: 'Categoría', filterable: true }
    ],
    searchableFields: ['name', 'category_name'],
    actions: {
      show: false,
      edit: false,
      delete: false,
      view: false
    },
    pageSizeOptions: [5, 10]
  };

  ngOnInit() {
    this.form = this.fb.group({
      quantity: [this.data.product?.quantity || '', [Validators.required, Validators.min(1)]],
      unit_cost: [this.data.product?.unit_cost || '', [Validators.required, Validators.min(0)]],
      batch_number: [this.data.product?.batch_number || ''],
      expiry_date: [this.data.product?.expiry_date ? new Date(this.data.product.expiry_date) : null],
      description: [this.data.product?.description || '']
    });

    if (this.data.isEdit) {
      this.selectedProduct.set(this.data.product);
    }
  }

  onSelectionChange(event: any ) {
      this.selectedProduct.set(event);
  }

  save() {
    if (this.form.valid && this.selectedProduct()) {
      const val = this.form.value;
      const result: any = {
        ...val,
        product_id: this.selectedProduct().id || this.selectedProduct().product_id,
        // Carry over display info for the main table
        product_name: this.selectedProduct().name || this.selectedProduct().product_name,
        product_sku: this.selectedProduct().sku || this.selectedProduct().product_sku,
        product_image: this.selectedProduct().img_main || this.selectedProduct().product_image,
        expiry_date: val.expiry_date ? val.expiry_date.toISOString().split('T')[0] : null,
        description: val.description
      };
      this.dialogRef.close(result);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
