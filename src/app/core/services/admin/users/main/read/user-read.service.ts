import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { UserDaoSupabaseService } from 'src/app/core/services/users/dao/user.dao.supabase.service';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserUtilsService } from 'src/app/core/services/admin/users/main/utils/user.utils.service';

@Injectable({
  providedIn: 'root'
})
export class UserReadService {
  private userDaoSupabaseService = inject(UserDaoSupabaseService);
  private userUtilsService = inject(UserUtilsService);

  getAllDashboard(): Observable<UserDashboardModel[]> {
    return this.userDaoSupabaseService.getAll().pipe(
      map((users: UserEntity[]) => this.userUtilsService.mapToUserDashboardModel(users)))
  }

  getUserDetailWithNetwork(userId: string): Observable<UserNetworkDetail[]> {
    return this.userDaoSupabaseService.getUserDetailWithNetwork(userId);
  }

  getAvailableSponsors(editingUserId: string): Observable<UserSponsorEntity[]> {
    return this.userDaoSupabaseService.getAvailableSponsorsRpc(editingUserId);
  }

  findByPhoneOrEmail(phone?: string, email?: string): Observable<Partial<UserEntity> | null> {
    return this.userDaoSupabaseService.findByPhoneOrEmail(phone, email);
  }

}
