import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAgendaDaoSupabaseService } from 'src/app/core/services/users/dao/user.agenda.dao.supabase.service';
import { UserAgendaDashboardEntity } from 'src/app/shared/entity/view/user.agenda.dashboard.entity';
import { UserAgendaEntity, UserAgendaHistory } from 'src/app/shared/entity/user.agenda.entity';
import { UserAgendaCreateRcpEntity, UserAgendaCreateRcpResponseEntity, UserAgendaLinkRcpEntity, UserAgendaLinkRcpResponseEntity } from 'src/app/shared/entity/rcp/user.agenda.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class UserAgendaService {
  private userAgendaDaoSupabaseService = inject(UserAgendaDaoSupabaseService);

  getAll(userIds?: number[]): Observable<UserAgendaDashboardEntity[]> {
    return this.userAgendaDaoSupabaseService.getAll(userIds);
  }

  create(userAgenda: UserAgendaCreateRcpEntity): Observable<UserAgendaCreateRcpResponseEntity> {
    return this.userAgendaDaoSupabaseService.create(userAgenda);
  }

  link(userAgenda: UserAgendaLinkRcpEntity): Observable<UserAgendaLinkRcpResponseEntity> {
    return this.userAgendaDaoSupabaseService.link(userAgenda);
  }

  update(userAgenda: UserAgendaEntity): Observable<UserAgendaEntity> {
    return this.userAgendaDaoSupabaseService.update(userAgenda);
  }

  unlink(owner_id: number, contact_id: number): Observable<boolean> {
    return this.userAgendaDaoSupabaseService.unlink(owner_id, contact_id);
  }

  getHistory(owner_id: number, contact_id: number): Observable<{ follow_up_history: UserAgendaHistory[], last_contact_history: UserAgendaHistory[] }> {
    return this.userAgendaDaoSupabaseService.getHistory(owner_id, contact_id);
  }

  addHistoryEntry(owner_id: number, contact_id: number, type: 'contact' | 'follow_up', entry: UserAgendaHistory): Observable<boolean> {
    return this.userAgendaDaoSupabaseService.addHistoryEntry(owner_id, contact_id, type, entry);
  }

}
