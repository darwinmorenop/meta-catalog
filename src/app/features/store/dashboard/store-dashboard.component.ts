import { Component, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { ProductService } from 'src/app/core/services/products/product.service';
import { CartService } from 'src/app/core/services/cart/cart.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserListService } from 'src/app/core/services/users/user.list.service';
import { Product } from 'src/app/core/models/products/product.model';
import { CartItemEntity } from 'src/app/shared/entity/cart.entity';
import { ListSlugEnum, ListItemTrackingTypeEnum } from 'src/app/shared/entity/list.entity';
import { ListViewEntity, ListItemViewEntity } from 'src/app/shared/entity/view/list.view.entity';
import { HasPermissionDirective } from 'src/app/shared/directives/has-permission.directive';
import { Resource, Action } from 'src/app/shared/entity/user.profile.entity';

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
    MatSnackBarModule,
    HasPermissionDirective
  ],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.scss'
})
export class StoreDashboardComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private userService = inject(UserService);
  private listService = inject(UserListService);
  private snackBar = inject(MatSnackBar);

  // Expose enums for template
  eResource = Resource;
  eAction = Action;

  currentUser = computed(() => this.userService.currentUser());

  // Products
  productsResource = rxResource({
    stream: () => this.productService.getAll()
  });

  // Cart Items for current user
  cartResource = rxResource({
    stream: () => {
      const user = this.currentUser();
      return user ? this.cartService.getAll([user.id]) : of([]);
    }
  });

  // User Lists (for favorites and tracking)
  listsResource = rxResource({
    stream: () => {
      const user = this.currentUser();
      return user ? this.listService.getAll([user.id]) : of([]);
    }
  });

  // Helper to find specific lists IDs
  favoritesListId = computed(() => {
    const lists = this.listsResource.value() || [];
    return lists.find(l => l.slug === ListSlugEnum.favorites)?.id;
  });

  trackingListId = computed(() => {
    const lists = this.listsResource.value() || [];
    return lists.find(l => l.slug === ListSlugEnum.price_tracking)?.id;
  });

  // Items in lists
  favoritesItems = rxResource({
    stream: () => {
      const id = this.favoritesListId();
      return id ? this.listService.getAllItems(id) : of([]);
    }
  });

  trackingItems = rxResource({
    stream: () => {
      const id = this.trackingListId();
      return id ? this.listService.getAllItems(id) : of([]);
    }
  });

  constructor() {
    // Reactivity via effects as used in other components
    effect(() => {
      this.currentUser();
      this.cartResource.reload();
      this.listsResource.reload();
    });

    effect(() => {
      this.favoritesListId();
      this.favoritesItems.reload();
    });

    effect(() => {
      this.trackingListId();
      this.trackingItems.reload();
    });
  }

  products = computed(() => this.productsResource.value() || []);

  getCartItem(productId: number): CartItemEntity | undefined {
    return this.cartResource.value()?.find(item => item.product_id === productId);
  }

  isInList(productId: number, items: Partial<ListItemViewEntity>[] | undefined): boolean {
    return !!items?.find(item => item.product_id === productId);
  }

  isFavorite(productId: number): boolean {
    return this.isInList(productId, this.favoritesItems.value());
  }

  isTracking(productId: number): boolean {
    return this.isInList(productId, this.trackingItems.value());
  }

  // Actions
  toggleFavorite(product: Product) {
    const user = this.currentUser();
    const listId = this.favoritesListId();
    if (!user || !listId) {
      this.snackBar.open('Error: No se pudo encontrar la lista de favoritos', 'Cerrar', { duration: 3000 });
      return;
    }

    const favoriteItem = this.favoritesItems.value()?.find(i => i.product_id === product.id);
    
    if (favoriteItem) {
      this.listService.removeItem(listId, favoriteItem.item_id!.toString()).subscribe({
        next: () => {
          this.snackBar.open('Eliminado de favoritos', 'Cerrar', { duration: 2000 });
          this.favoritesItems.reload();
        }
      });
    } else {
      this.listService.upsertItem({
        p_list_id: listId,
        p_product_id: product.id,
        p_tracking_type: ListItemTrackingTypeEnum.none
      }).subscribe({
        next: () => {
          this.snackBar.open('Añadido a favoritos', 'Cerrar', { duration: 2000 });
          this.favoritesItems.reload();
        }
      });
    }
  }

  toggleTracking(product: Product) {
    const user = this.currentUser();
    const listId = this.trackingListId();
    if (!user || !listId) {
      this.snackBar.open('Error: No se pudo encontrar la lista de seguimiento', 'Cerrar', { duration: 3000 });
      return;
    }

    const trackingItem = this.trackingItems.value()?.find(i => i.product_id === product.id);
    
    if (trackingItem) {
      this.listService.removeItem(listId, trackingItem.item_id!.toString()).subscribe({
        next: () => {
          this.snackBar.open('Eliminado de seguimiento', 'Cerrar', { duration: 2000 });
          this.trackingItems.reload();
        }
      });
    } else {
      this.listService.upsertItem({
        p_list_id: listId,
        p_product_id: product.id,
        p_tracking_type: ListItemTrackingTypeEnum.target,
        p_target_price: product.pricing?.price
      }).subscribe({
        next: () => {
          this.snackBar.open('Añadido a seguimiento', 'Cerrar', { duration: 2000 });
          this.trackingItems.reload();
        }
      });
    }
  }

  addToCart(product: Product) {
    const user = this.currentUser();
    if (!user) {
      this.snackBar.open('Debe seleccionar un usuario activo', 'Cerrar', { duration: 3000 });
      return;
    }

    const cartItem = this.getCartItem(product.id);
    const newQty = (cartItem?.quantity || 0) + 1;

    this.cartService.changeQuantity(user.id, product.id, newQty).subscribe({
      next: () => {
        this.snackBar.open('Producto añadido al carrito', 'Cerrar', { duration: 2000 });
        this.cartResource.reload();
      },
      error: () => this.snackBar.open('Error al añadir al carrito', 'Cerrar', { duration: 3000 })
    });
  }

  addToList(product: Product) {
    this.snackBar.open('Funcionalidad de añadir a lista personalizada en construcción', 'Cerrar', { duration: 3000 });
  }
}
