import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserWriteDaoSupabaseService } from 'src/app/core/services/admin/users/main/write/dao/user-write.dao.supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserWriteService {
  private userWriteDaoSupabaseService = inject(UserWriteDaoSupabaseService);



  insert(user: UserEntity): Observable<UserEntity> {
    return this.userWriteDaoSupabaseService.insert(user);
  }

  update(user: UserEntity): Observable<UserEntity> {
    return this.userWriteDaoSupabaseService.update(user);
  }

  delete(id: string): Observable<boolean> {
    return this.userWriteDaoSupabaseService.delete(id);
  }

}
