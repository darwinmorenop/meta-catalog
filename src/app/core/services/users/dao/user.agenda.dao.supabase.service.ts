import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';
import { UserAgendaDashboardEntity } from 'src/app/shared/entity/view/user.agenda.dashboard.entity';
import { UserAgendaEntity, UserAgendaHistory } from 'src/app/shared/entity/user.agenda.entity';
import { UserAgendaCreateRcpEntity, UserAgendaCreateRcpResponseEntity, UserAgendaLinkRcpEntity, UserAgendaLinkRcpResponseEntity } from 'src/app/shared/entity/rcp/user.agenda.rcp.entity';
import { ProductStatusEnum } from 'src/app/core/models/products/product.status.enum';

@Injectable({
  providedIn: 'root'
})
export class UserAgendaDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private loggerService: LoggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserAgendaDaoSupabaseService.name;

  constructor() {
  }

  getAll(userIds?: string[]): Observable<UserAgendaDashboardEntity[]> {
    let query = this.supabaseService.getSupabaseClient()
      .from('v_user_agenda')
      .select('*')
      .eq('agenda_status', ProductStatusEnum.active)
      .order('first_name');

    if (userIds && userIds.length > 0) {
      query = query.in('owner_id', userIds);
    }

    return from(query).pipe(
      map(res => (res.data || []).map(item => this.mapToDashboardEntity(item)))
    );
  }

  create(data: UserAgendaCreateRcpEntity): Observable<UserAgendaCreateRcpResponseEntity> {
    return from(
      this.supabaseService.getSupabaseClient()
        .rpc('add_user_agenda_flow', data)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as UserAgendaCreateRcpResponseEntity;
      })
    );
  }

  link(userAgendaLink: UserAgendaLinkRcpEntity): Observable<UserAgendaLinkRcpResponseEntity> {
    return from(
      this.supabaseService.getSupabaseClient()
        .rpc('link_existing_user_agenda', userAgendaLink)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as UserAgendaLinkRcpResponseEntity;
      })
    );
  }

  update(userAgenda: Partial<UserAgendaEntity>): Observable<UserAgendaEntity> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_agenda')
        .update(userAgenda)
        .eq('owner_id', userAgenda.owner_id)
        .eq('contact_id', userAgenda.contact_id)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.mapToEntity(res.data);
      })
    );
  }

  unlink(owner_id: string, contact_id: string): Observable<boolean> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_agenda')
        .update({ status: ProductStatusEnum.archived })
        .eq('owner_id', owner_id)
        .eq('contact_id', contact_id)
    ).pipe(
      map(res => !res.error)
    );
  }

  getHistory(owner_id: string, contact_id: string): Observable<{ follow_up_history: UserAgendaHistory[], last_contact_history: UserAgendaHistory[] }> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_agenda')
        .select('follow_up_history, last_contact_history')
        .eq('owner_id', owner_id)
        .eq('contact_id', contact_id)
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return {
          follow_up_history: res.data.follow_up_history || [],
          last_contact_history: res.data.last_contact_history || []
        };
      })
    );
  }

  addHistoryEntry(owner_id: string, contact_id: string, type: 'contact' | 'follow_up', entry: UserAgendaHistory): Observable<boolean> {
    const column = type === 'contact' ? 'last_contact_history' : 'follow_up_history';
    
    return this.getHistory(owner_id, contact_id).pipe(
      map(history => {
        const current = type === 'contact' ? history.last_contact_history : history.follow_up_history;
        return [...current, entry];
      }),
      switchMap((updatedHistory: UserAgendaHistory[]) => {
        return from(
          this.supabaseService.getSupabaseClient()
            .from('user_agenda')
            .update({ [column]: updatedHistory })
            .eq('owner_id', owner_id)
            .eq('contact_id', contact_id)
        );
      }),
      map((res: any) => !res.error)
    );
  }

  private mapToEntity(item: any): UserAgendaEntity {
    return {
      owner_id: item.owner_id,
      contact_id: item.contact_id,
      alias: item.alias,
      tags: item.tags,
      lead: item.lead,
      created_at: item.created_at,
      updated_at: item.updated_at,
      notes: item.notes,
      follow_up_history: item.follow_up_history,
      last_contact_history: item.last_contact_history
    };
  }

  private mapToDashboardEntity(item: any): UserAgendaDashboardEntity {
    return {
      owner_id: item.owner_id,
      user_owner_id: item.user_owner_id,
      contact_id: item.contact_id,
      alias: item.alias,
      tags: item.tags,
      lead: item.lead,
      created_at: item.created_at,
      updated_at: item.updated_at,
      agenda_notes: item.agenda_notes,
      last_contact_at: item.last_contact_at,
      last_contact_result: item.last_contact_result,
      last_contact_history_notes: item.last_contact_history_notes,
      last_follow_up_at: item.last_follow_up_at,
      last_follow_up_result: item.last_follow_up_result,
      last_follow_up_history_notes: item.last_follow_up_history_notes,
      first_name: item.first_name,
      last_name: item.last_name,
      email: item.email,
      phone: item.phone,
      profile: item.profile,
      birthday: item.birthday,
      image: item.image,
      user_status: item.user_status,
      user_general_notes: item.user_general_notes,
      is_manual: item.is_manual
    };
  }
}