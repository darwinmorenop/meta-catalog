import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';

@Component({
  selector: 'app-scrap-change-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './scrap-change-detail-dialog.component.html',
  styleUrls: ['./scrap-change-detail-dialog.component.scss']
})
export class ScrapChangeDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ScrapChangeDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductScrapSyncPendingChange
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
