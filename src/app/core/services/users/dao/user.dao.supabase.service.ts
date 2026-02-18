import { inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum } from 'src/app/core/models/users/user.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private loggerService: LoggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserDaoSupabaseService.name;

  constructor() {
  }

  private mapToEntity(item: any): UserEntity {
    return {
      id: item.id,
      user_owner_id: item.user_owner_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      externalAuthId: item.external_auth_id || item.externalAuthId,
      email: item.email,
      phone: item.phone,
      isManual: item.is_manual ?? item.isManual ?? true,
      firstName: item.first_name || item.firstName,
      lastName: item.last_name || item.lastName,
      rank: item.rank,
      sponsorId: item.sponsor_id || item.sponsorId,
      path: item.path,
      identifier: item.identifier,
      image: item.image,
      user_profile_id: item.user_profile_id,
      settings: item.settings,
      profile: item.profile,
      birthday: item.birthday,
      status: item.status,
      notes: item.notes,
    };
  }

  private mapToDetailedEntity(item: any): UserNetworkDetail {
    return {
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      rank: item.rank as UserRankEnum,
      image: item.image,
      isManual: item.is_manual,
      identifier: item.identifier,
      pathStr: item.path_str,
      relativeLevel: item.relative_level,
      sponsorId: item.sponsor_id,
      sponsorFirstName: item.sponsor_first_name,
      sponsorLastName: item.sponsor_last_name,
      sponsorFullName: item.sponsor_full_name,
      sponsorEmail: item.sponsor_email,
      sponsorIdentifier: item.sponsor_identifier,
      sponsorPhone: item.sponsor_phone,
      sponsorRank: item.sponsor_rank as UserRankEnum,
      sponsorImage: item.sponsor_image,
      user_profile_id: item.profile_id,
      user_profile_name: item.profile_name,
      settings: item.settings
    };
  }

  private mapToDb(user: Partial<UserEntity>): any {
    return {
      email: user.email,
      phone: user.phone,
      is_manual: user.isManual,
      first_name: user.firstName,
      last_name: user.lastName,
      rank: user.rank,
      sponsor_id: user.sponsorId,
      identifier: user.identifier,
      image: user.image,
      external_auth_id: user.externalAuthId,
      user_profile_id: user.user_profile_id
    };
  }

  private mapToSponsor(item: any): UserSponsorEntity {
    return {
      id: item.id,
      fullName: item.full_name,
      email: item.email,
      rank: item.rank as UserRankEnum,
      isEligible: item.is_eligible,
      reason: item.reason
    }
  }

  getAll(): Observable<UserEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user')
        .select('*')
        .order('first_name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapToEntity(item)))
    );
  }

  getById(userId: string): Observable<UserEntity | null> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user')
        .select('*')
        .eq('id', userId)
        .single()
    ).pipe(
      map(res => res.data ? this.mapToEntity(res.data) : null),
      catchError(() => of(null))
    );
  }

  getAvailableSponsorsRpc(editingUserId: string): Observable<UserSponsorEntity[]> {
    return from(
      this.supabaseService.getSupabaseClient().rpc('get_available_sponsors', { p_edit_user_id: editingUserId })
    ).pipe(
      map(res => (res.data || []).map((item: any) => this.mapToSponsor(item)))
    );
  }

  getUserDetailWithNetwork(userId: string): Observable<UserNetworkDetail[]> {
    const context = 'getUserDetailWithNetwork';
    this.loggerService.debug(`Recovering data for user ${userId}`, this.CLASS_NAME, context);
    return from(
      this.supabaseService.getSupabaseClient().rpc('get_user_network_details', { p_user_id: userId })
    ).pipe(
      tap(res => this.loggerService.debug(`Recovered data for user ${userId} with data ${JSON.stringify(res.data)}`, this.CLASS_NAME, context)),
      map(res => (res.data || []).map((item: any) => this.mapToDetailedEntity(item)))
    );
  }

  insert(user: UserEntity): Observable<UserEntity> {
    const dbData = this.mapToDb(user);
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user')
        .insert(dbData)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.mapToEntity(res.data);
      })
    );
  }

  update(user: UserEntity): Observable<UserEntity> {
    const dbData = this.mapToDb(user);
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user')
        .update(dbData)
        .eq('id', user.id)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.mapToEntity(res.data);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user')
        .delete()
        .eq('id', id)
    ).pipe(
      map(res => !res.error)
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
      this.supabaseService.getSupabaseClient()
        .from('user')
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