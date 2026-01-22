import { inject, Injectable, signal } from "@angular/core";
import { map, Observable } from "rxjs";
import { ProductUtilsService } from "src/app/core/services/products/utils/product.utils.service";
import { LoggerService } from "src/app/core/services/logger/logger.service";
import { ProductStore } from "../../models/products/product.store.model";
import { ProductStoreDaoSupabaseService } from "./dao/product.store.dao.supabase.service";

@Injectable({
    providedIn: 'root'
})
export class ProductStoreService {

    private dao: ProductStoreDaoSupabaseService = inject(ProductStoreDaoSupabaseService);
    private productUtilsService: ProductUtilsService = inject(ProductUtilsService);
    private loggerService: LoggerService = inject(LoggerService);
    private readonly CLASS_NAME = ProductStoreService.name;

    private _products = signal<ProductStore[]>([]);
    public products = this._products.asReadonly();

    private _isLoading = signal<boolean>(false);
    public isLoading = this._isLoading.asReadonly();

    loadProducts(userId: number): void {
        this._isLoading.set(true);
        this.get(userId).subscribe({
            next: (entities) => {
                this._products.set(entities);
                this._isLoading.set(false);
            },
            error: () => {
                this._isLoading.set(false);
            }
        });
    }

    get(userId: number): Observable<ProductStore[]> {
        return this.dao.get(userId).pipe(
            map(products => products.map(product => {
                const p = this.productUtilsService.mapProduct(product);
                const res: ProductStore = {
                    ...p,
                    is_favorite: product.is_favorite,
                    is_price_tracked: product.is_price_tracked,
                    is_in_custom_list: product.is_in_custom_list,
                    cart_quantity: product.cart_quantity,
                    is_stock_notified: product.is_stock_notified
                };
                return res;
            }))
        );
    }

    toggleFav(userId: number, productId: number) {
        const currentProducts = this._products();
        const productIndex = currentProducts.findIndex(p => p.id === productId);

        if (productIndex === -1) return;

        // 1. Clonamos y modificamos localmente (Update Optimista)
        const previousState = currentProducts[productIndex].is_favorite;
        const newState = !previousState;

        // Creamos el nuevo array para disparar la reactividad del Signal
        const updatedProducts = [...currentProducts];
        updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            is_favorite: newState
        };

        // Actualizamos el Signal inmediatamente
        this._products.set(updatedProducts);

        // 2. Sincronización con el Servidor vía DAO
        this.dao.toggleFav(userId, productId).subscribe({
            next: (result) => {
                // Si el resultado es null, el catchError del DAO actuó por un fallo
                if (result === null) {
                    this.rollbackFavorite(productId, previousState);
                } else {
                    // Opcional: Aseguramos que el estado local coincide con el de la DB
                    // por si hubo cambios concurrentes (result es el valor real en DB)
                    if (result !== newState) {
                        // this.syncFavoriteState(productId, result);
                    }
                }
            },
            error: (err) => {
                // Manejo de errores de red o excepciones no controladas
                console.error('Critical error in toggleFav sync:', err);
                this.rollbackFavorite(productId, previousState);
            }
        });
    }

    /**
     * Revierte el estado de favorito a un valor específico
     */
    private rollbackFavorite(productId: number, originalState: boolean): void {
        const products = [...this._products()];
        const index = products.findIndex(p => p.id === productId);

        if (index !== -1) {
            products[index] = { ...products[index], is_favorite: originalState };
            this._products.set(products);
            // Aquí podrías disparar un aviso al usuario (Toast/Snackbar)
        }
    }

    /**
     * Sincroniza el estado local con el valor real retornado por Postgres
     */
    private syncFavoriteState(productId: number, realState: boolean): void {
        const products = [...this._products()];
        const index = products.findIndex(p => p.id === productId);

        if (index !== -1 && products[index].is_favorite !== realState) {
            products[index] = { ...products[index], is_favorite: realState };
            this._products.set(products);
        }
    }

    /**
 * Cambia la cantidad del carrito de forma optimista
 * @param delta 1 para sumar, -1 para restar
 */
    updateCartQuantity(userId: number, productId: number, delta: number): void {
        const currentProducts = this._products();
        const index = currentProducts.findIndex(p => p.id === productId);

        if (index === -1) return;

        // 1. Datos previos para posible Rollback
        const previousQty = currentProducts[index].cart_quantity || 0;
        // Calculamos la nueva cantidad localmente (mínimo 0)
        const optimisticQty = Math.max(0, previousQty + delta);

        // 2. Update Optimista del Signal
        const updatedProducts = [...currentProducts];
        updatedProducts[index] = {
            ...updatedProducts[index],
            cart_quantity: optimisticQty
        };
        this._products.set(updatedProducts);

        // 3. Sincronización con el servidor
        this.dao.changeQuantity(userId, productId, delta).subscribe({
            next: (finalQty) => {
                if (finalQty === null) {
                    // Falló el servidor: Rollback al estado anterior
                    this.rollbackCartQty(productId, previousQty);
                } else if (finalQty !== optimisticQty) {
                    // El servidor calculó algo distinto (ej: por falta de stock)
                    this.syncCartQty(productId, finalQty);
                }
            },
            error: () => this.rollbackCartQty(productId, previousQty)
        });
    }

    private rollbackCartQty(productId: number, originalQty: number) {
        const products = [...this._products()];
        const idx = products.findIndex(p => p.id === productId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], cart_quantity: originalQty };
            this._products.set(products);
        }
    }

    private syncCartQty(productId: number, realQty: number) {
        const products = [...this._products()];
        const idx = products.findIndex(p => p.id === productId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], cart_quantity: realQty };
            this._products.set(products);
        }
    }

    /**
 * Toggle del estado de seguimiento de precio (Campana)
 */
    toggleTrack(userId: number, productId: number): void {
        const currentProducts = this._products();
        const index = currentProducts.findIndex(p => p.id === productId);

        if (index === -1) return;

        // 1. Estado previo para Rollback
        const previousState = currentProducts[index].is_price_tracked;
        const newState = !previousState;

        // 2. Update Optimista (Cambiamos la campana al instante)
        const updatedProducts = [...currentProducts];
        updatedProducts[index] = {
            ...updatedProducts[index],
            is_price_tracked: newState
        };
        this._products.set(updatedProducts);

        // 3. Sincronización con DB
        this.dao.toggleTracking(userId, productId).subscribe({
            next: (result) => {
                if (result === null) {
                    this.rollbackTrack(productId, previousState);
                } else if (result !== newState) {
                    // Sincronía por si la DB devolvió algo distinto
                    this.syncTrack(productId, result);
                }
            },
            error: () => this.rollbackTrack(productId, previousState)
        });
    }

    private rollbackTrack(productId: number, originalState: boolean) {
        const products = [...this._products()];
        const idx = products.findIndex(p => p.id === productId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], is_price_tracked: originalState };
            this._products.set(products);
        }
    }

    private syncTrack(productId: number, realState: boolean) {
        const products = [...this._products()];
        const idx = products.findIndex(p => p.id === productId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], is_price_tracked: realState };
            this._products.set(products);
        }
    }
/**
 * Toggle para notificaciones de Stock (estilo campana/favoritos)
 */
toggleStockNotifier(userId: number, productId: number): void {
  const currentProducts = this._products();
  const index = currentProducts.findIndex(p => p.id === productId);

  if (index === -1) return;

  // 1. Guardar estado previo para posible Rollback
  const previousState = currentProducts[index].is_stock_notified;
  const newState = !previousState;

  // 2. Actualización Optimista inmediata del Signal
  const updatedProducts = [...currentProducts];
  updatedProducts[index] = {
    ...updatedProducts[index],
    is_stock_notified: newState
  };
  this._products.set(updatedProducts);

  // 3. Petición al servidor
  this.dao.toggleStockNotifier(userId, productId).subscribe({
    next: (result) => {
      if (result === null) {
        this.rollbackTrackState(productId, previousState);
      } else if (result !== newState) {
        // Si la DB devuelve algo distinto (ej: el item ya existía en price_tracking)
        this.syncTrackState(productId, true); // Si hay algo en alguna lista, debe ser true
      }
    },
    error: () => this.rollbackTrackState(productId, previousState)
  });
}

private rollbackTrackState(productId: number, originalState: boolean) {
  const products = [...this._products()];
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], is_stock_notified: originalState };
    this._products.set(products);
  }
}

private syncTrackState(productId: number, realState: boolean) {
  const products = [...this._products()];
  const idx = products.findIndex(p => p.id === productId);
  if (idx !== -1) {
    products[idx] = { ...products[idx], is_stock_notified: realState };
    this._products.set(products);
  }
}
}