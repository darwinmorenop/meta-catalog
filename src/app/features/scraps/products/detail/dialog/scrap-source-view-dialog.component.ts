import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ProductSourceDetail } from 'src/app/shared/entity/view/product.scrap.entity';

@Component({
  selector: 'app-scrap-source-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: 'scrap-source-view-dialog.component.html',
  styleUrl: 'scrap-source-view-dialog.component.scss'
})
export class ScrapSourceViewDialogComponent {
  readonly data = inject<ProductSourceDetail>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ScrapSourceViewDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }

  openUrl(): void {
    if (this.data.url_source) {
      window.open(this.data.url_source, '_blank');
    }
  }
}
