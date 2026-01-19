import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CampaignEntity } from 'src/app/shared/entity/view/campaign.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private dateUtils = inject(DateUtilsService);

  constructor() {
  }

  private mapCampaign(item: any): CampaignEntity {
    return {
      ...item,
      started_at: this.dateUtils.parseDbDate(item.started_at),
      finished_at: this.dateUtils.parseDbDate(item.finished_at),
      created_at: this.dateUtils.parseDbDate(item.created_at),
      updated_at: this.dateUtils.parseDbDate(item.updated_at)
    };
  }

  /**
   * Obtiene todas las campañas actuales
   */
  getCurrent(): Observable<CampaignEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('v_campaign_current')
        .select('*')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapCampaign(item)))
    );
  }

  /**
   * Obtiene todas las campañas
   */
  getAll(): Observable<CampaignEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('campaign')
        .select('*')
        .order('name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapCampaign(item)))
    );
  }

  /**
   * Crea una nueva campaña
   */
  create(campaign: Partial<CampaignEntity>): Observable<CampaignEntity | null> {
    const { id, ...dataToInsert } = campaign;
    return from(
      this.supabaseService.getSupabaseClient()
        .from('campaign')
        .insert([dataToInsert])
        .select()
        .single()
    ).pipe(
      map(res => res.data ? this.mapCampaign(res.data) : null)
    );
  }

  /**
   * Actualiza una campaña existente
   */
  update(id: number, updates: Partial<CampaignEntity>): Observable<CampaignEntity | null> {
    const { id: _, ...dataToUpdate } = updates as any;
    return from(
      this.supabaseService.getSupabaseClient()
        .from('campaign')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(res => res.data ? this.mapCampaign(res.data) : null)
    );
  }

  /**
   * Elimina una campaña por ID
   */
  delete(id: number): Observable<any> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('campaign')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }
}