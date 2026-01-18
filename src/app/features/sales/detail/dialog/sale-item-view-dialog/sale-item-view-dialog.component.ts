import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { SaleDetailedEntity } from 'src/app/shared/entity/view/sale.dashboard.entity';
import { SaleStatusLabels } from 'src/app/shared/entity/sale.entity';

@Component({
  selector: 'app-sale-item-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sale-item-view-dialog.component.html',
  styleUrl: './sale-item-view-dialog.component.scss'
})
export class SaleItemViewDialogComponent {
  private router = inject(Router);
  dialogRef = inject(MatDialogRef<SaleItemViewDialogComponent>);
  data = inject<SaleDetailedEntity>(MAT_DIALOG_DATA);

  statusLabel = SaleStatusLabels[this.data.item_status] || this.data.item_status;

  goToProduct() {
    this.router.navigate(['/products', this.data.product_id]);
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
