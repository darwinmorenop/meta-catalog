import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { CartService } from 'src/app/core/services/cart/cart.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { CartItemEntity } from 'src/app/shared/entity/cart.entity';
import { UserNetworkDetail } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { CartItemEditDialogComponent } from 'src/app/features/cart/dialogs/edit/cart-item-edit-dialog.component';
import { CartItemDetailDialogComponent } from 'src/app/features/cart/dialogs/view/cart-item-detail-dialog.component';

export type CartScopeType = 'Personal' | 'Grupal' | 'Todos';

@Component({
  selector: 'app-cart-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    SmartTableComponent
  ],
  templateUrl: './cart-dashboard.component.html',
  styleUrl: './cart-dashboard.component.scss'
})
export class CartDashboardComponent {
  private cartService = inject(CartService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  scopeControl = new FormControl<CartScopeType>('Personal', { nonNullable: true });
  scope = toSignal(this.scopeControl.valueChanges, { initialValue: this.scopeControl.value });

  filteredUserIds = computed(() => {
    const scope = this.scope();
    const currentUser = this.userService.currentUser();
    const network = this.userService.currentUserNetwork() || [];

    if (!currentUser) return [];

    switch (scope) {
      case 'Personal':
        return [currentUser.id];
      case 'Grupal':
        return network.map((u: UserNetworkDetail) => u.id);
      case 'Todos':
        return [];
      default:
        return [];
    }
  });

  cartResource = rxResource({
    stream: () => this.cartService.getAll(this.filteredUserIds())
  });

  constructor() {
    effect(() => {
      this.filteredUserIds();
      this.cartResource.reload();
    });
  }

  tableData = computed(() => {
    return this.cartResource.value() || [];
  });

  tableConfig: TableConfig = {
    columns: [
      { key: 'owner_image', header: 'Usuario', type: 'image', filterable: true },
      { key: 'owner_full_name', header: 'Nombre Usuario', filterable: true },
      { key: 'product_image', header: 'Producto', type: 'image' },
      { key: 'product_name', header: 'Nombre Producto', filterable: true },
      { key: 'quantity', header: 'Cantidad', type: 'text' },
      { key: 'is_selected', header: 'Seleccionado', type: 'boolean' },
      { key: 'is_saved_for_later', header: 'Más tarde', type: 'boolean' },
      { key: 'updated_at', header: 'Actualizado', type: 'datetime' }
    ],
    searchableFields: ['product_name', 'owner_full_name'],
    pageSizeOptions: [10, 20, 50],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  onViewItem(item: CartItemEntity) {
    this.dialog.open(CartItemDetailDialogComponent, {
      width: '500px',
      data: item
    });
  }

  onEditItem(item: CartItemEntity) {
    const dialogRef = this.dialog.open(CartItemEditDialogComponent, {
      width: '400px',
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cartService.update(item.user_id, item.product_id, result).subscribe({
          next: () => {
            this.snackBar.open('Item actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.cartResource.reload();
          },
          error: () => this.snackBar.open('Error al actualizar item', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  onDeleteItem(item: CartItemEntity) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto del carrito?')) {
      this.cartService.delete(item.user_id, item.product_id).subscribe({
        next: () => {
          this.snackBar.open('Producto eliminado del carrito', 'Cerrar', { duration: 3000 });
          this.cartResource.reload();
        },
        error: () => this.snackBar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 })
      });
    }
  }
}
