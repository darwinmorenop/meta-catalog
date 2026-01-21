import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-list-tracking-sale-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './user-list-tracking-sale-dialog.component.html',
  styleUrl: './user-list-tracking-sale-dialog.component.scss'
})
export class UserListTrackingSaleDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserListTrackingSaleDialogComponent>
  ) {}

  get hasDiscount(): boolean {
    return this.data.price_difference < 0;
  }
}
