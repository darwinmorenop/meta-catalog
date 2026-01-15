import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductMedia, ProductMediaType } from 'src/app/core/models/products/media/product.media.model';

@Component({
  selector: 'app-product-media-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-media.dialog.component.html',
  styleUrl: './product-media.dialog.component.scss'
})
export class ProductMediaDialogComponent {
  mediaForm: FormGroup;
  types = ProductMediaType;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductMediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { media: ProductMedia | null, product_id: string }
  ) {
    this.mediaForm = this.fb.group({
      product_id: [data.product_id, Validators.required],
      url: [data.media?.url || '', [Validators.required]],
      type: [data.media?.type || ProductMediaType.IMAGE, Validators.required],
      is_main: [data.media?.is_main || false],
      display_order: [data.media?.display_order || 0],
      alt_text: [data.media?.alt_text || ''],
      title: [data.media?.title || ''],
      description: [data.media?.description || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.mediaForm.valid) {
      this.dialogRef.close(this.mediaForm.value);
    }
  }
}
