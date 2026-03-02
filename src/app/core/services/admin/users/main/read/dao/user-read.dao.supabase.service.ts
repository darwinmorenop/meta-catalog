import { inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum } from 'src/app/core/models/users/user.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/admin/supabase/supabase.service';
import { UserUtilsService } from 'src/app/core/services/admin/users/main/utils/user.utils.service';

@Injectable({
  providedIn: 'root'
})
export class UserDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private userUtilsService = inject(UserUtilsService);
  private loggerService: LoggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserDaoSupabaseService.name;

  constructor() {
  }

  getAll(): Observable<UserEntity[]> {
    return from(
      this.supabaseService.fromUsers('user')
        .select('*')
        .order('first_name')
    ).pipe(
      map(res => (res.data || []).map(item => this.userUtilsService.mapToEntity(item)))
    );
  }

  getById(userId: string): Observable<UserEntity | null> {
    return from(
      this.supabaseService.fromUsers('user')
        .select('*')
        .eq('id', userId)
        .single()
    ).pipe(
      map(res => res.data ? this.userUtilsService.mapToEntity(res.data) : null),
      catchError(() => of(null))
    );
  }

  getAvailableSponsorsRpc(editingUserId: string): Observable<UserSponsorEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient().rpc('get_available_sponsors', { p_edit_user_id: editingUserId })
    ).pipe(
      map(res => (res.data || []).map((item: any) => this.userUtilsService.mapToSponsor(item)))
    );
  }

  getUserDetailWithNetwork(userId: string): Observable<UserNetworkDetail[]> {
    const context = 'getUserDetailWithNetwork';
    this.loggerService.debug(`Recovering data for user ${userId}`, this.CLASS_NAME, context);
    return from(
      this.supabaseService.getSupabaseClient().rpc('get_user_network_details', { p_user_id: userId })
    ).pipe(
      tap(res => this.loggerService.debug(`Recovered data for user ${userId} with data ${JSON.stringify(res.data)}`, this.CLASS_NAME, context)),
      map(res => (res.data || []).map((item: any) => this.userUtilsService.mapToDetailedEntity(item)))
    );
  }

  findByPhoneOrEmail(phone?: string, email?: string): Observable<Partial<UserEntity> | null> {
    const context = 'findByPhoneOrEmail';
    this.loggerService.debug(`Recovering data for user ${phone} or ${email}`, this.CLASS_NAME, context);
    const filters = [];
    if (phone) filters.push(`phone.eq.${phone}`);
    if (email) filters.push(`email.eq.${email}`);
    
    if (filters.length === 0) return of(null);

    return from(
      this.supabaseService.fromUsers('user')
        .select('id,first_name,last_name')
        .or(filters.join(','))
        .limit(1)
    ).pipe(
      map(res => {
        if (res.data && res.data.length > 0) {
          const item = res.data[0];
          return {
            id: item.id,
            firstName: item.first_name,
            lastName: item.last_name
          } as Partial<UserEntity>;
        }
        return null;
      }),
      catchError(err => {
        this.loggerService.error(`Error recovering data for user ${phone} or ${email}`, this.CLASS_NAME, context);
        return of(null);
      })
    );
  }
}