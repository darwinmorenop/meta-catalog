import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CampaignEntity } from 'src/app/shared/entity/view/campaign.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';

@Injectable({
  providedIn: 'root'
})
export class CampaignDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
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
      this.supabase
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
      this.supabase
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
      this.supabase
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
      this.supabase
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
      this.supabase
        .from('campaign')
        .delete()
        .eq('id', id)
    ).pipe(map(res => res.data));
  }
}