import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserRankEnum } from 'src/app/core/models/users/user.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/supabase/supabase.service';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';

@Injectable({
  providedIn: 'root'
})
export class UserProfileDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private loggerService: LoggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserProfileDaoSupabaseService.name;

  constructor() {
  }

  getAll(): Observable<UserProfile[]> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_profile')
        .select('*')
        .order('name')
    ).pipe(
      map(res => (res.data || []).map(item => this.mapToEntity(item)))
    );
  }

  getById(id: string): Observable<UserProfile> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_profile')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.mapToEntity(res.data);
      })
    );
  }

  insert(userProfile: UserProfile): Observable<UserProfile> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_profile')
        .insert(userProfile)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.mapToEntity(res.data);
      })
    );
  }

  update(userProfile: UserProfile): Observable<UserProfile> {
    return from(
      this.supabaseService.getSupabaseClient()
        .from('user_profile')
        .update(userProfile)
        .eq('id', userProfile.id)
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
        .from('user_profile')
        .delete()
        .eq('id', id)
    ).pipe(
      map(res => !res.error)
    );
  }

  private mapToEntity(item: any): UserProfile {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      permissions: item.permissions,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}
