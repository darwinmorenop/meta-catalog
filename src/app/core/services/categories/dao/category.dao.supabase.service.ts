import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CategoryEntity } from 'src/app/shared/entity/category.entity';
import { CategoryHierarchyEntity } from 'src/app/shared/entity/view/category.hierarchy.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
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
      this.supabase
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
      this.supabase
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
      this.supabase
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
      this.supabase
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
      this.supabase
        .from('category')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }
}