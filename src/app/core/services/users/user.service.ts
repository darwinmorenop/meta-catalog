import { Injectable, inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { UserDaoSupabaseService } from './dao/user.dao.supabase.service';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserDashboardModel, UserRankEnum } from 'src/app/core/models/users/user.model';
import { UserNetworkDetail, UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userDaoSupabaseService = inject(UserDaoSupabaseService);

  getAllDashboard(): Observable<UserDashboardModel[]> {
    return this.userDaoSupabaseService.getAll().pipe(
      map((users: UserEntity[]) => users.map((user: UserEntity) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        isManual: user.isManual,
        firstName: user.firstName,
        lastName: user.lastName,
        rank: user.rank as UserRankEnum,
        sponsor: user.sponsorId ? this.convertToUserDashboardModel(users.find((u: UserEntity) => u.id === user.sponsorId)) : null,
        image: user.image
      })))
    );
  }

  getUserDetailWithNetwork(userId: number): Observable<UserNetworkDetail[]> {
    return this.userDaoSupabaseService.getUserDetailWithNetwork(userId);
  }

  private convertToUserDashboardModel(user: UserEntity | undefined): UserDashboardModel | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isManual: user.isManual,
      firstName: user.firstName,
      lastName: user.lastName,
      rank: user.rank as UserRankEnum,
      sponsor: null,
      image: user.image
    };
  }

  getAvailableSponsors(editingUserId: number): Observable<UserSponsorEntity[]> {
    return this.userDaoSupabaseService.getAvailableSponsorsRpc(editingUserId);
  }

  insert(user: UserEntity): Observable<UserEntity> {
    return this.userDaoSupabaseService.insert(user);
  }

  update(user: UserEntity): Observable<UserEntity> {
    return this.userDaoSupabaseService.update(user);
  }

  delete(id: number): Observable<boolean> {
    return this.userDaoSupabaseService.delete(id);
  }

}
