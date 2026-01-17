import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stock-entry-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './stock-entry-view-dialog.component.html',
  styleUrl: './stock-entry-view-dialog.component.scss'
})
export class StockEntryViewDialogComponent {
  data = inject<any>(MAT_DIALOG_DATA);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<StockEntryViewDialogComponent>);

  goToInbound() {
    if (this.data.inbound_id) {
      this.router.navigate(['/inventory/inbound', this.data.inbound_id]);
      this.dialogRef.close();
    }
  }
}
