import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum } from 'src/app/core/models/users/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserDaoSupabaseService {
  private supabase: SupabaseClient;
  private dateUtils = inject(DateUtilsService);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  private mapEntity(item: any): UserEntity {
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
      image: item.image
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
      path: user.path,
      image: user.image,
      external_auth_id: user.externalAuthId
    };
  }

  getAll(): Observable<UserEntity[]> {
    return from(
      this.supabase
        .from('user')
        .select('*')
        .order('first_name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapEntity(item)))
    );
  }

  getAvailableSponsorsRpc(editingUserId: number): Observable<UserSponsorEntity[]> {
    return from(
      this.supabase.rpc('get_available_sponsors', { p_edit_user_id: editingUserId })
    ).pipe(
      map(res => (res.data || []).map((item: any) => {
        return {
          id: item.id,
          fullName: item.full_name,
          email: item.email,
          rank: item.rank as UserRankEnum,
          isEligible: item.is_eligible,
          reason: item.reason
        };
      }))
    );
  }

  getUserDetailWithNetwork(userId: number): Observable<UserNetworkDetail[]> {
    return from(
      this.supabase.rpc('get_user_network_details', { p_user_id: userId })
    ).pipe(
      map(res => (res.data || []).map((item: any) => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        fullName: item.full_name,
        email: item.email,
        phone: item.phone,
        rank: item.rank as UserRankEnum,
        image: item.image,
        isManual: item.is_manual,
        pathStr: item.path_str,
        relativeLevel: item.relative_level,
        sponsorId: item.sponsor_id,
        sponsorFirstName: item.sponsor_first_name,
        sponsorLastName: item.sponsor_last_name,
        sponsorFullName: item.sponsor_full_name,
        sponsorEmail: item.sponsor_email,
        sponsorPhone: item.sponsor_phone,
        sponsorRank: item.sponsor_rank as UserRankEnum,
        sponsorImage: item.sponsor_image
      })))
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
        return this.mapEntity(res.data);
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
        return this.mapEntity(res.data);
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