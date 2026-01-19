import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfileDaoSupabaseService } from 'src/app/core/services/users/dao/user.profile.dao.supabase.service';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private userProfileDaoSupabaseService = inject(UserProfileDaoSupabaseService);

  getAll(): Observable<UserProfile[]> {
    return this.userProfileDaoSupabaseService.getAll();
  }

  insert(userProfile: UserProfile): Observable<UserProfile> {
    return this.userProfileDaoSupabaseService.insert(userProfile);
  }

  update(userProfile: UserProfile): Observable<UserProfile> {
    return this.userProfileDaoSupabaseService.update(userProfile);
  }

  delete(id: string): Observable<boolean> {
    return this.userProfileDaoSupabaseService.delete(id);
  }

}
