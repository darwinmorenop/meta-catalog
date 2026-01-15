import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BrandEntity } from 'src/app/shared/entity/brand.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

@Injectable({
  providedIn: 'root'
})
export class BrandDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  private mapBrand(item: any): any {
    return {
      ...item,
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at)
    };
  }

  getAll(): Observable<BrandEntity[]> {
    return from(
      this.supabase
        .from('brand')
        .select('*')
        .order('name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapBrand(item)))
    );
  }

}