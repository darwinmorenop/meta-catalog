import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BrandDaoSupabaseService } from 'src/app/core/services/brand/dao/brand.dao.supabase.service';
import { BrandEntity } from 'src/app/shared/entity/brand.entity';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private brandDao = inject(BrandDaoSupabaseService);

  
  getAll(): Observable<BrandEntity[]> {
    return this.brandDao.getAll();
  }

}
