import { inject, Injectable, signal } from "@angular/core";
import { ProductDaoSupabaseService } from "src/app/core/services/products/dao/product.dao.supabase.service";
import { map, Observable } from "rxjs";
import { Product } from "src/app/core/models/products/product.model";
import { ProductUtilsService } from "src/app/core/services/products/utils/product.utils.service";
import { LoggerService } from "src/app/core/services/logger/logger.service";

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private productDaoSupabaseService: ProductDaoSupabaseService = inject(ProductDaoSupabaseService);
    private productUtilsService: ProductUtilsService = inject(ProductUtilsService);
    private loggerService: LoggerService = inject(LoggerService);
    private readonly CLASS_NAME = ProductService.name;

    private currentProduct = signal<Product | null>(null);

    constructor() { }

    setCurrentProduct(product: Product | null) {
        const context = 'setCurrentProduct';
        this.loggerService.debug(`Setting current product: ${JSON.stringify(product)}`, this.CLASS_NAME, context);
        this.currentProduct.set(product);
    }

    getAndClearCurrentProduct(): Product | null {
        const product = this.currentProduct();
        this.currentProduct.set(null);
        return product;
    }

    getAll(): Observable<Product[]> {
        return this.productDaoSupabaseService.getProductsComplete().pipe(
            map(products => products.map(product => this.productUtilsService.mapProduct(product)))
            );
    }

    getById(id: number): Observable<Product | null> {
        return this.productDaoSupabaseService.getProductCompleteById(id).pipe(
            map(product => product ? this.productUtilsService.mapProduct(product) : null)
        );
    }

}