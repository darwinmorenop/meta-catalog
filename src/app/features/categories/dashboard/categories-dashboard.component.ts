import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryService } from 'src/app/core/services/categories/category.service';
import { CategoryHierarchyEntity } from 'src/app/shared/entity/view/category.hierarchy.entity';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { CategoryDialogComponent } from 'src/app/features/categories/dialog/category.dialog.component';
import { CategoryEntity } from 'src/app/shared/entity/category.entity';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-categories-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SmartTableComponent,
    MatCardModule,
    RouterModule
  ],
  templateUrl: 'categories-dashboard.component.html',
  styleUrls: ['categories-dashboard.component.scss']
})
export class CategoriesDashboardComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private loggerService = inject(LoggerService)
  private readonly CLASS_NAME = CategoriesDashboardComponent.name

  categories = signal<CategoryHierarchyEntity[]>([]);
  isLoading = signal<boolean>(false);

  tableConfig: TableConfig = {
    columns: [
      { key: 'id', header: 'ID', filterable: true },
      { key: 'name', header: 'Nombre', filterable: true },
      { key: 'full_path', header: 'Ruta Completa', filterable: true },
      { key: 'slug', header: 'Slug', filterable: true },
      { key: 'level', header: 'Nivel', filterable: true }
    ],
    searchableFields: ['name', 'full_path', 'slug'],
    pageSizeOptions: [10, 20, 50]
  };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    const  context = 'loadCategories';
    this.isLoading.set(true);
    this.categoryService.getCategoriesHierarchy().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loggerService.error('Error loading categories:', err, this.CLASS_NAME, context);
        this.isLoading.set(false);
      }
    });
  }

  addCategory() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { category: null }
    });

    dialogRef.afterClosed().subscribe((result: Partial<CategoryEntity>) => {
      if (result) {
        this.categoryService.createCategory(result).subscribe(() => {
          this.loadCategories();
        });
      }
    });
  }

  editCategory(category: CategoryHierarchyEntity) {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { category: { ...category } }
    });

    dialogRef.afterClosed().subscribe((result: Partial<CategoryEntity>) => {
      if (result && category.id) {
        this.categoryService.updateCategory(category.id, result).subscribe(() => {
          this.loadCategories();
        });
      }
    });
  }

  deleteCategory(category: CategoryHierarchyEntity) {
    if (confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
