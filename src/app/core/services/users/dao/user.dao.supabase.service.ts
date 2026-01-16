import { inject, Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum } from 'src/app/core/models/users/user.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class UserDaoSupabaseService {
  private supabase: SupabaseClient;
  private loggerService: LoggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserDaoSupabaseService.name;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  private mapToEntity(item: any): UserEntity {
    return {
      id: item.id,
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
      permissions: item.permissions,
      settings: item.settings
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
      permissions: item.permissions,
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
      permissions: user.permissions
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
      this.supabase
        .from('user')
        .select('*')
        .order('first_name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapToEntity(item)))
    );
  }

  getAvailableSponsorsRpc(editingUserId: number): Observable<UserSponsorEntity[]> {
    return from(
      this.supabase.rpc('get_available_sponsors', { p_edit_user_id: editingUserId })
    ).pipe(
      map(res => (res.data || []).map((item: any) => this.mapToSponsor(item)))
    );
  }

  getUserDetailWithNetwork(userId: number): Observable<UserNetworkDetail[]> {
    const context = 'getUserDetailWithNetwork';
    this.loggerService.debug(`Recovering data for user ${userId}`, this.CLASS_NAME, context);
    return from(
      this.supabase.rpc('get_user_network_details', { p_user_id: userId })
    ).pipe(
      tap(res => this.loggerService.debug(`Recovered data for user ${userId} with data ${JSON.stringify(res.data)}`, this.CLASS_NAME, context)),
      map(res => (res.data || []).map((item: any) => this.mapToDetailedEntity(item)))
    );
  }

  insert(user: UserEntity): Observable<UserEntity> {
    const dbData = this.mapToDb(user);
    return from(
      this.supabase
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
      this.supabase
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

  delete(id: number): Observable<boolean> {
    return from(
      this.supabase
        .from('user')
        .delete()
        .eq('id', id)
    ).pipe(
      map(res => !res.error)
    );
  }
}