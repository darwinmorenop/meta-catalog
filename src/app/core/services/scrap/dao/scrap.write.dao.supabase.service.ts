import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ScrapWriteDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private logger = inject(LoggerService);
  private readonly CLASS_NAME = ScrapWriteDaoSupabaseService.name;

  constructor() {
  }


  delete(id: number): Observable<any> {
    const context = 'delete'
    this.logger.info(`Deleting with id:${id}`, this.CLASS_NAME, context)
    return from(
      this.supabaseService.getSupabaseClient()
        .from('scrap')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }

}