import { Component, Inject, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MetaProduct } from 'src/app/core/models/meta-model';

@Component({
    selector: 'app-product-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    templateUrl: './product-dialog.component.html',
    styles: [`
    .full-width {
      width: 100%;
      padding-top: 5px; /* Evitar corte del label */
    }
    .col-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding-top: 5px; /* Evitar corte del label en la primera fila */
    }
    .stepper-actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class ProductDialogComponent {
    private fb = inject(FormBuilder);
    dialogRef = inject(MatDialogRef<ProductDialogComponent>);

    form: FormGroup;
    isEditMode: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { product: MetaProduct | null }) {
        this.isEditMode = !!data.product;
        this.form = this.fb.group({
            // Step 1: Detalles Básicos
            id: [data.product?.id || '', Validators.required],
            title: [data.product?.title || '', Validators.required],
            description: [data.product?.description || ''],
            brand: [data.product?.brand || ''],
            condition: [data.product?.condition || 'new'],

            // Step 2: Precios y Stock
            price: [data.product?.price || ''],
            sale_price: [data.product?.sale_price || ''],
            availability: [data.product?.availability || 'in stock'],
            quantity_to_sell_on_facebook: [data.product?.quantity_to_sell_on_facebook || 0],

            // Step 3: Multimedia y Links
            link: [data.product?.link || ''],
            image_link: [data.product?.image_link || ''],

            // Step 4: Categorización y Atributos
            google_product_category: [data.product?.google_product_category || ''],
            fb_product_category: [data.product?.fb_product_category || ''],
            gender: [data.product?.gender || ''],
            color: [data.product?.color || ''],
            size: [data.product?.size || ''],
            age_group: [data.product?.age_group || ''],
            material: [data.product?.material || ''],

            // Step 5: Envio y Otros
            shipping: [data.product?.shipping || ''],
            shipping_weight: [data.product?.shipping_weight || ''],
            gtin: [data.product?.gtin || ''],
            product_tags_0: [data.product?.['product_tags[0]'] || ''],
        });
    }

    @HostListener('window:keyup.esc') onKeyUp() {
        this.close();
    }

    save() {
        if (this.form.valid) {
            // Reconstuir el objeto con la estructura correcta (mapeo inverso de campos planos a especiales si fuera necesario)
            const formValue = this.form.value;
            const product: MetaProduct = {
                ...formValue,
                // Mapeo manual de campos con nombres especiales si se usaron temporalmente con otro nombre en el form
                'product_tags[0]': formValue.product_tags_0
            };
            // Limpiar campos temporales del form
            delete product['product_tags_0'];

            this.dialogRef.close(product);
        }
    }

    close() {
        if (this.form.dirty && !confirm('¿Estás seguro de que quieres salir sin guardar los cambios?')) {
            return;
        }
        this.dialogRef.close();
    }
}
