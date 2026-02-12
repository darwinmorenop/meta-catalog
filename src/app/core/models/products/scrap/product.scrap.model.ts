import { ProductDetails } from "../product.attributes.model";

export interface ProductScrap {
    code: string;
    totalStock: number;
    name: string;
    description: string;
    details?: ProductDetails;
    summary: string;
    salePrice: number;
    originalPrice: number;
    url: string;
    urlBase: string;
    urlSource: string;
    imageUrl: string;
    secondImageUrl: string;
    productCommercialCode: string;
}
