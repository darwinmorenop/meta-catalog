import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-cart-item-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './cart-item-detail-dialog.component.html',
  styleUrl: './cart-item-detail-dialog.component.scss'
})
export class CartItemDetailDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<CartItemDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose() {
    this.dialogRef.close();
  }
}
