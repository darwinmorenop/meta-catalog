import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Models
import { ProductMediaService } from 'src/app/core/services/products/product-media.service';
import { ProductMedia } from 'src/app/core/models/products/media/product.media.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductMediaDialogComponent } from '../dialog/product-media.dialog.component';
import { ProductDashboardMediaEntity } from 'src/app/shared/entity/view/product.media.dashboard.entity';
import { MediaReorderDialogComponent } from '../reorder-dialog/media-reorder.dialog.component';

@Component({
  selector: 'app-media-list-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: './media-list-dashboard.component.html',
  styleUrl: './media-list-dashboard.component.scss'
})
export class MediaListDashboardComponent {
  private readonly mediaService = inject(ProductMediaService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = MediaListDashboardComponent.name;

  productId = signal<string>(
    this.route.snapshot.params['productId'] || 
    this.route.snapshot.parent?.params['id'] || 
    this.route.snapshot.params['id']
  );
  productData = signal<ProductDashboardMediaEntity | null>(this.mediaService.getAndClearCurrentProduct());

  isChildRoute = computed(() => !!this.route.snapshot.parent?.params['id']);

  mediaResource = rxResource({
    stream: () => this.mediaService.getMediaByProductId(this.productId())
  });

  productName = computed(() => this.productData()?.product_name || 'Producto');

  tableData = computed<any[]>(() => {
    return this.mediaResource.value() ?? [];
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'url', header: 'Imagen', type: 'image' },
      { key: 'display_order', header: 'Orden', filterable: false },
      { key: 'title', header: 'Título', filterable: true },
      { key: 'type', header: 'Tipo', filterable: true },
      { key: 'is_main', header: 'Principal', type: 'boolean', filterable: true },
    ],
    searchableFields: ['title'],
    pageSizeOptions: [5, 10, 20],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  addMedia(): void {
    const context = 'addMedia';
    const dialogRef = this.dialog.open(ProductMediaDialogComponent, {
      width: '500px',
      data: { media: null, product_id: this.productId() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mediaService.createMedia(result).subscribe({
          next: () => this.mediaResource.reload(),
          error: (err) => this.loggerService.error('Error creating media', err, this.CLASS_NAME, context)
        });
      }
    });
  }

  onView(media: ProductMedia): void {
    window.open(media.url, '_blank');
  }

  onEdit(media: ProductMedia): void {
    const context = 'onEdit';
    const dialogRef = this.dialog.open(ProductMediaDialogComponent, {
      width: '500px',
      data: { media: { ...media }, product_id: this.productId() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && media.id) {
        this.mediaService.updateMedia(media.id, result).subscribe({
          next: () => this.mediaResource.reload(),
          error: (err) => this.loggerService.error('Error updating media', err, this.CLASS_NAME, context)
        });
      }
    });
  }

  onDelete(media: ProductMedia): void {
    const context = 'onDelete';
    if (confirm(`¿Estás seguro de eliminar esta media "${media.title || media.url}"?`)) {
      this.mediaService.deleteMedia(media.id).subscribe({
        next: () => this.mediaResource.reload(),
        error: (err) => this.loggerService.error('Error deleting media', err, this.CLASS_NAME, context)
      });
    }
  }

  openReorderDialog(): void {
    const context = 'openReorderDialog';
    const dialogRef = this.dialog.open(MediaReorderDialogComponent, {
      width: '600px',
      data: { media: this.tableData() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loggerService.info('Reorder result received:', result, this.CLASS_NAME, context);
        // El usuario implementará el método del backend después
        // Por ahora recargamos para asegurar consistencia
        this.mediaResource.reload();
      }
    });
  }
}
