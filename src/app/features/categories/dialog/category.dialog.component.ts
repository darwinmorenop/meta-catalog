import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CategoryEntity } from 'src/app/shared/entity/category.entity';
import { CategoryService } from 'src/app/core/services/categories/category.service';

import { CategoryHierarchyEntity } from 'src/app/shared/entity/view/category.hierarchy.entity';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './category.dialog.component.html',
  styleUrls: ['./category.dialog.component.scss']
})
export class CategoryDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  dialogRef = inject(MatDialogRef<CategoryDialogComponent>);

  form: FormGroup;
  isEditMode: boolean;
  categories: CategoryHierarchyEntity[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { category: CategoryEntity | null }) {
    this.isEditMode = !!data.category;
    this.form = this.fb.group({
      id: [data.category?.id],
      name: [data.category?.name || '', Validators.required],
      slug: [data.category?.slug || ''],
      description: [data.category?.description || ''],
      parent_id: [data.category?.parent_id]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategoriesHierarchy().subscribe(categories => {
      // Evitar que una categoría sea su propio padre o hijos de ella (para evitar ciclos)
      // Por simplicidad ahora solo evitamos que sea ella misma
      this.categories = categories.filter(c => c.id !== this.data.category?.id);
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}