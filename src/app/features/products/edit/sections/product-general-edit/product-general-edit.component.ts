import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductEditComponent } from 'src/app/features/products/edit/product-edit.component';
import { ProductStatusEnum } from 'src/app/core/models/products/product.status.enum';
import { CategoryService } from 'src/app/core/services/categories/category.service';
import { CategoryHierarchyEntity } from 'src/app/shared/entity/view/category.hierarchy.entity';
import { BrandService } from 'src/app/core/services/brand/brand.service';
import { BrandEntity } from 'src/app/shared/entity/brand.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-product-general-edit',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: 'product-general-edit.component.html',
  styleUrl: 'product-general-edit.component.scss'
})
export class ProductGeneralEditComponent implements OnInit {
  private parent = inject(ProductEditComponent);
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = ProductGeneralEditComponent.name;
  
  product = this.parent.product;
  form!: FormGroup;

  statusOptions = Object.values(ProductStatusEnum);
  categories = signal<CategoryHierarchyEntity[]>([]);
  brands = signal<BrandEntity[]>([]);

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    this.loadBrands();
  }

  private loadCategories() {
    this.categoryService.getCategoriesHierarchy().pipe(
      map(cats => cats.sort((a, b) => (a.full_path || '').localeCompare(b.full_path || '')))
    ).subscribe(cats => {
      this.categories.set(cats);
    });
  }

  private loadBrands() {
    this.brandService.getAll().subscribe(brands => {
      this.brands.set(brands);
    });
  }

  private initForm() {
    const p = this.product();
    this.form = this.fb.group({
      name: [p?.name || '', [Validators.required]],
      brand_id: [p?.brand_id || null, [Validators.required]],
      sku: [p?.sku || ''],
      ean: [p?.ean || ''],
      category_id: [p?.category?.id || null, [Validators.required]],
      status: [p?.status || ProductStatusEnum.active],
      description: [p?.description || ''],
      summary: [p?.summary || '']
    });
  }

  onSave() {
    if (this.form.valid) {
      this.loggerService.info('Saving general product data:', this.form.getRawValue(), this.CLASS_NAME, 'onSave');
    }
  }
}
