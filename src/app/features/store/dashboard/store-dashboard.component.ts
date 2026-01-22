import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from 'src/app/core/services/users/user.service';
import { ProductStore } from 'src/app/core/models/products/product.store.model';
import { ProductStoreService } from 'src/app/core/services/products/product.store.service';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatSnackBarModule
  ],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.scss'
})
export class StoreDashboardComponent {
  private productStoreService = inject(ProductStoreService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);

  currentUser = computed(() => this.userService.currentUser());
  products = this.productStoreService.products;
  isLoading = this.productStoreService.isLoading;

  constructor() {
    // Load products when user changes
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.productStoreService.loadProducts(user.id);
      }
    });
  }

  // Refresh helper
  refresh() {
    const user = this.currentUser();
    if (user) this.productStoreService.loadProducts(user.id);
  }
  // Actions
  toggleFavorite(product: ProductStore) {
    const user = this.currentUser();
    if (!user) return;
    this.productStoreService.toggleFav(user.id, product.id);
  }

  toggleTracking(product: ProductStore) {
    const user = this.currentUser();
    if (!user) return;
    this.productStoreService.toggleTrack(user.id, product.id);
  }

  removeFromCart(product: ProductStore) {
    const user = this.currentUser();
    if (!user) return;
    this.productStoreService.updateCartQuantity(user.id, product.id, -1);
  }

  addToCart(product: ProductStore) {
    const user = this.currentUser();
    if (!user) {
      this.snackBar.open('Debe seleccionar un usuario activo', 'Cerrar', { duration: 3000 });
      return;
    }
    this.productStoreService.updateCartQuantity(user.id, product.id, 1);
  }

  toggleStockNotifier(product: ProductStore) {
    const user = this.currentUser();
    if (!user) {
      this.snackBar.open('Debe seleccionar un usuario activo', 'Cerrar', { duration: 3000 });
      return;
    }
    this.productStoreService.toggleStockNotifier(user.id, product.id);
    const message = product.is_stock_notified ? 'Aviso cancelado' : 'Te avisaremos cuando haya stock';
    this.snackBar.open(message, 'Cerrar', { duration: 2000 });
  }

  addToList(product: ProductStore) {
    this.snackBar.open('Funcionalidad de añadir a lista personalizada en construcción', 'Cerrar', { duration: 3000 });
  }
}
