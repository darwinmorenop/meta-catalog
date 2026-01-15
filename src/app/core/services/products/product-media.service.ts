import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductMediaDaoSupabaseService } from './dao/product-media.dao.supabase.service';
import { ProductMedia, ProductMediaType } from '../../models/products/media/product.media.model';
import { ProductMediaEntity } from 'src/app/shared/entity/product.media.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { ProductDashboardMediaEntity } from 'src/app/shared/entity/view/product.media.dashboard.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { MediaRcpOrderItemEntity, MediaRcpOrderRequestEntity, MediaRcpOrderResponseEntity } from 'src/app/shared/entity/rcp/media.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductMediaService {
  private mediaDao = inject(ProductMediaDaoSupabaseService);
  private dateUtils = inject(DateUtilsService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductMediaService.name;

  private currentProduct = signal<ProductDashboardMediaEntity | null>(null);

  setCurrentProduct(product: ProductDashboardMediaEntity | null) {
      const context = 'setCurrentProduct';
      this.loggerService.debug(`Setting current product: ${JSON.stringify(product)}`, this.CLASS_NAME, context);
      this.currentProduct.set(product);
  }

  getAndClearCurrentProduct(): ProductDashboardMediaEntity | null {
      const product = this.currentProduct();
      this.currentProduct.set(null);
      return product;
  }

  getAllMediaDashboardData(): Observable<ProductDashboardMediaEntity[]> {
    return this.mediaDao.getAllMediaDashboardData();
  }

  getMediaByProductId(productId: string): Observable<ProductMedia[]> {
    return this.mediaDao.getMediaByProductId(productId).pipe(
      map(entities => entities.map(entity => this.mapEntityToModel(entity)))
    );
  }

  createMedia(media: Partial<ProductMedia>): Observable<ProductMedia | null> {
    const entity = this.mapModelToEntity(media);
    return this.mediaDao.createMedia(entity).pipe(
      map(entity => entity ? this.mapEntityToModel(entity) : null)
    );
  }

  updateMedia(id: number, media: Partial<ProductMedia>): Observable<ProductMedia | null> {
    const entity = this.mapModelToEntity(media);
    return this.mediaDao.updateMedia(id, entity).pipe(
      map(entity => entity ? this.mapEntityToModel(entity) : null)
    );
  }

  updateOrderMedia(mediaData: ProductMedia[]): Observable<MediaRcpOrderResponseEntity> {
    if(mediaData.length === 0) return of({
      success: false,
      updated_count: 0
    });
    const media:MediaRcpOrderRequestEntity = {
      p_product_id: mediaData[0].product_id,
      p_media_items: mediaData.map(media => {
        return {
          id: media.id,
          display_order: media.display_order,
          is_main: media.is_main
        }
      })
    }
    return this.mediaDao.updateOrderMedia(media);
  }

  deleteMedia(id: number): Observable<boolean> {
    return this.mediaDao.deleteMedia(id);
  }

  private mapEntityToModel(entity: ProductMediaEntity): ProductMedia {
    return {
      id: entity.id,
      product_id: entity.product_id,
      url: entity.url,
      type: entity.type as ProductMediaType,
      is_main: entity.is_main,
      display_order: entity.display_order,
      alt_text: entity.alt_text,
      title: entity.title,
      description: entity.description,
      created_at: this.dateUtils.parseDbDate(entity.created_at),
      updated_at: this.dateUtils.parseDbDate(entity.updated_at)
    };
  }

  private mapModelToEntity(model: Partial<ProductMedia>): Partial<ProductMediaEntity> {
    const entity: any = { ...model };
    if (model.created_at) delete entity.created_at; // Managed by DB
    if (model.updated_at) delete entity.updated_at; // Managed by DB
    return entity;
  }
}
