import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryEntity } from 'src/app/shared/entity/category.entity';
import { CategoryHierarchyEntity } from 'src/app/shared/entity/view/category.hierarchy.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);

  constructor() {
  }

  private mapCategory(item: any): any {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at)
    };
  }

  /**
   * Obtiene todas las categorías con su jerarquía calculada en la vista
   */
  getHierarchy(): Observable<CategoryHierarchyEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('v_categories_hierarchy')
        .select('*')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapCategory(item)))
    );
  }

  /**
   * Obtiene categorías planas para selectores de padres
   */
  getAll(): Observable<CategoryEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('category')
        .select('*')
        .order('name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapCategory(item)))
    );
  }

  /**
   * Crea una nueva categoría
   */
  create(category: Partial<CategoryEntity>): Observable<CategoryEntity | null> {
    const { id, ...dataToInsert } = category;
    return from(
      this.supabaseService.getSupabaseClient()
        .from('category')
        .insert([dataToInsert])
        .select()
        .single()
    ).pipe(
      map(res => res.data ? this.mapCategory(res.data) : null)
    );
  }

  /**
   * Actualiza una categoría existente
   */
  update(id: number, updates: Partial<CategoryEntity>): Observable<CategoryEntity | null> {
    const { id: _, ...dataToUpdate } = updates as any;
    return from(
      this.supabaseService.getSupabaseClient()
        .from('category')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(res => res.data ? this.mapCategory(res.data) : null)
    );
  }


  /**
   * Elimina una categoría por ID
   */
  delete(id: number): Observable<any> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('category')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }
}