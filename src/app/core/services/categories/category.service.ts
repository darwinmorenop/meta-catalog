import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryDaoSupabaseService } from './dao/category.dao.supabase.service';
import { CategoryEntity } from 'src/app/shared/entity/category.entity';
import { CategoryHierarchyEntity } from 'src/app/shared/entity/view/category.hierarchy.entity';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryDao = inject(CategoryDaoSupabaseService);

  getCategoriesHierarchy(): Observable<CategoryHierarchyEntity[]> {
    return this.categoryDao.getHierarchy();
  }

  getAllCategories(): Observable<CategoryEntity[]> {
    return this.categoryDao.getAll();
  }

  createCategory(category: Partial<CategoryEntity>): Observable<CategoryEntity | null> {
    return this.categoryDao.create(category);
  }

  updateCategory(id: number, updates: Partial<CategoryEntity>): Observable<CategoryEntity | null> {
    return this.categoryDao.update(id, updates);
  }

  deleteCategory(id: number): Observable<any> {
    return this.categoryDao.delete(id);
  }
}
