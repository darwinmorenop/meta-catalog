import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductService } from 'src/app/core/services/products/product.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { SaleStatus, SaleStatusLabels } from 'src/app/shared/entity/sale.entity';
import { MatSelectModule } from '@angular/material/select';

export interface SaleProductDialogData {
  product?: any; 
  isEdit: boolean;
}

@Component({
  selector: 'app-sale-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    SmartTableComponent
  ],
  templateUrl: './sale-product-dialog.component.html',
  styleUrl: './sale-product-dialog.component.scss'
})
export class SaleProductDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  dialogRef = inject(MatDialogRef<SaleProductDialogComponent>);
  data = inject<SaleProductDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  selectedProduct = signal<any>(null);
  
  statusOptions = Object.values(SaleStatus).map(s => ({ key: s, value: SaleStatusLabels[s] }));

  productsResource = rxResource({
    stream: () => this.productService.getAll()
  });

  tableData = computed(() => {
    const products = this.productsResource.value() ?? [];
    return products.map(p => ({
      ...p,
      img_main: p.media?.find(m => m.is_main)?.url || p.media?.[0]?.url || '',
      category_name: p.category.full_path,
      stock_internal: p.stock.internal_stock ?? 0,
      price: p.pricing?.price ?? 0,
      price_sale: p.pricing?.sale_price ?? 0
    }));
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'img_main', header: 'Imagen', type: 'image' },
      { key: 'name', header: 'Producto', filterable: true },
      { key: 'sku', header: 'SKU', filterable: true },
      { key: 'stock_internal', header: 'Stock interno' },
      { key: 'price', header: 'Precio', type: 'currency' },
      { key: 'price_sale', header: 'Precio en oferta', type: 'currency' }
    ],
    searchableFields: ['name', 'sku'],
    actions: { show: false },
    pageSizeOptions: [5, 10]
  };

  ngOnInit() {
    this.form = this.fb.group({
      description: [this.data.product?.description || this.data.product?.item_description || ''],
      status: [this.data.product?.status || this.data.product?.item_status || SaleStatus.pending],
      quantity: [this.data.product?.quantity || 1, [Validators.required, Validators.min(1)]],
      unit_price: [this.data.product?.unit_price || '', [Validators.required, Validators.min(0)]],
      discount_amount: [this.data.product?.discount_amount || this.data.product?.discount || 0, [Validators.min(0)]]
    });

    if (this.data.isEdit) {
      this.selectedProduct.set(this.data.product);
    }
  }

  onSelectionChange(event: any) {
    this.selectedProduct.set(event);
    if (!this.data.isEdit) {
      this.form.patchValue({
        unit_price: event.price
      });
    }
  }

  save() {
    if (this.form.valid && this.selectedProduct()) {
      const val = this.form.value;
      const result: any = {
        ...val,
        product_id: this.selectedProduct().id || this.selectedProduct().product_id,
        product_name: this.selectedProduct().name || this.selectedProduct().product_name,
        product_sku: this.selectedProduct().sku || this.selectedProduct().product_sku,
        product_image: this.selectedProduct().img_main || this.selectedProduct().product_image,
        line_revenue: (val.quantity * val.unit_price) - (val.discount_amount || 0),
        item_id: this.selectedProduct().item_id,
        item_status: val.status,
        item_description: val.description
      };
      this.dialogRef.close(result);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
