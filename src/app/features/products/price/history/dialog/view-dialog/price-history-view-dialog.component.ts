import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PriceHistoryEntity } from 'src/app/shared/entity/price.history.entity';

@Component({
  selector: 'app-price-history-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: 'price-history-view-dialog.component.html',
  styleUrl: 'price-history-view-dialog.component.scss'
})
export class PriceHistoryViewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { price: PriceHistoryEntity }) {}
}
