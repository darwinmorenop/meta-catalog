import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, first } from 'rxjs/operators';

import { ProductService } from 'src/app/core/services/products/product.service';
import { Product } from 'src/app/core/models/products/product.model';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';

export interface ProductSelectorData {
  existingIds: number[];
}

@Component({
  selector: 'app-product-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SmartTableComponent,
    FormsModule
  ],
  templateUrl: './product-selector-dialog.component.html',
  styleUrl: './product-selector-dialog.component.scss'
})
export class ProductSelectorDialogComponent {
  private dialogRef = inject(MatDialogRef<ProductSelectorDialogComponent>);
  private data = inject<ProductSelectorData>(MAT_DIALOG_DATA);
  private productService = inject(ProductService);

  addedProducts = signal<Product[]>([]);
  removedIds = signal<number[]>([]);
  
  selectionCount = computed(() => this.addedProducts().length + this.removedIds().length);

  tableConfig: TableConfig = {
    columns: [
      { key: 'product_main_image', header: 'Imagen', type: 'image' },
      { key: 'name', header: 'Nombre', filterable: true },
      { key: 'sku', header: 'SKU', filterable: true },
      { key: 'status_label', header: 'Estado', type: 'badge' }
    ],
    searchableFields: ['name', 'sku'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      viewIcon: 'add_circle',
      edit: false,
      delete: false
    }
  };
  
  productsResource = rxResource({
    stream: () => this.productService.getAll().pipe(first())
  });

  tableData = computed(() => {
    const products = (this.productsResource.value() as Product[]) || [];
    const added = this.addedProducts();
    const removed = this.removedIds();
    const existingIds = this.data.existingIds;

    return products.map(p => {
      const isAlreadyAdded = existingIds.includes(p.id); // Was in parent list
      const isMarkedForRemoval = removed.includes(p.id); // Marked to be deleted
      const isNewlySelected = added.some(sp => sp.id === p.id); // New selection to add
      
      let status: { value: string, color: string };
      let icon: string;
      let tooltip: string;

      if (isAlreadyAdded) {
        if (isMarkedForRemoval) {
          status = { value: 'Por Eliminar', color: '#f44336' };
          icon = 'undo';
          tooltip = 'Mantener en lista';
        } else {
          status = { value: 'En Lista', color: '#9e9e9e' };
          icon = 'remove_circle';
          tooltip = 'Quitar de la lista';
        }
      } else {
        if (isNewlySelected) {
          status = { value: 'Seleccionado', color: '#4caf50' };
          icon = 'check_circle';
          tooltip = 'Deseleccionar';
        } else {
          status = { value: 'Disponible', color: '#2196f3' };
          icon = 'add_circle';
          tooltip = 'Seleccionar';
        }
      }

      return {
        ...p,
        product_id: p.id,
        product_main_image: p.media?.find(m => m.is_main)?.url || 'assets/images/placeholder.png',
        status_label: status,
        smart_table_view_icon: icon,
        smart_table_view_tooltip: tooltip
      };
    });
  });

  onSelectRow(product: any) {
    const isAlreadyAdded = this.data.existingIds.includes(product.id);

    if (isAlreadyAdded) {
      // Toggle removal
      this.removedIds.update(ids => 
        ids.includes(product.id) ? ids.filter(id => id !== product.id) : [...ids, product.id]
      );
    } else {
      // Toggle selection for new products
      this.addedProducts.update(prev => {
        const index = prev.findIndex(p => p.id === product.id);
        return index > -1 ? prev.filter(p => p.id !== product.id) : [...prev, product];
      });
    }
  }

  onConfirm() {
    this.dialogRef.close({
      added: this.addedProducts(),
      removedIds: this.removedIds()
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
