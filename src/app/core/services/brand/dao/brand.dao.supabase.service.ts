import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrandEntity } from 'src/app/shared/entity/brand.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class BrandDaoSupabaseService {
  private dateUtils = inject(DateUtilsService);
  private supabaseService = inject(SupabaseService);

  constructor() {
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
      this.supabaseService.getSupabaseClient()
        .from('brand')
        .select('*')
        .order('name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapBrand(item)))
    );
  }

}