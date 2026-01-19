import { Component, inject, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProductMedia } from 'src/app/core/models/products/media/product.media.model';
import { ProductMediaService } from 'src/app/core/services/products/product-media.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { C } from '@angular/cdk/keycodes';
@Component({
  selector: 'app-media-reorder-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule
  ],
  templateUrl: 'media-reorder.dialog.component.html',
  styleUrl: 'media-reorder.dialog.component.scss'
})
export class MediaReorderDialogComponent {
  mediaItems = signal<ProductMedia[]>([]);
  productMediaService = inject(ProductMediaService);
  loggerService = inject(LoggerService);
  private readonly CLASS_NAME = MediaReorderDialogComponent.name;

  constructor(
    private dialogRef: MatDialogRef<MediaReorderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { media: ProductMedia[] }
  ) {
    // Clone the array to avoid direct mutation
    this.mediaItems.set([...data.media].sort((a, b) => a.display_order - b.display_order));
  }

  drop(event: CdkDragDrop<ProductMedia[]>) {
    const items = [...this.mediaItems()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    
    // Update display_order based on new index
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index
    }));
    
    this.mediaItems.set(updatedItems);
  }

  markAsMain(selectedItem: ProductMedia) {
    const updatedItems = this.mediaItems().map(item => ({
      ...item,
      is_main: item.id === selectedItem.id
    }));
    this.mediaItems.set(updatedItems);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const context = 'onSave';
    this.loggerService.debug('Updating media order', this.CLASS_NAME, context);
    this.productMediaService.updateOrderMedia(this.mediaItems()).subscribe({
      next: (response) => {
        this.dialogRef.close(this.mediaItems());
      },
      error: (error) => {
        this.loggerService.error('Error updating media order:', error, this.CLASS_NAME, context);
      }
    });
  }
}
