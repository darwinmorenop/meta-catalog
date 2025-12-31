import { inject, Injectable } from "@angular/core";
import { ProductDaoSupabaseService } from "src/app/core/services/products/dao/product.dao.supabase.service";
import { map, Observable } from "rxjs";
import { Product } from "src/app/core/models/products/product.model";
import { ProductUtilsService } from "src/app/core/services/products/utils/product.utils.service";

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private productDaoSupabaseService: ProductDaoSupabaseService = inject(ProductDaoSupabaseService);
    private productUtilsService: ProductUtilsService = inject(ProductUtilsService);
    
    constructor() { }

    getAll(): Observable<Product[]> {
        return this.productDaoSupabaseService.getProducts().pipe(
            map(products => products.map(product => this.productUtilsService.mapProduct(product)))
        );
    }
}