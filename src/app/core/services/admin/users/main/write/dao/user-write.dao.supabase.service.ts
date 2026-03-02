import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SupabaseService } from 'src/app/core/services/admin/supabase/supabase.service';
import { UserUtilsService } from '../../utils/user.utils.service';

@Injectable({
  providedIn: 'root'
})
export class UserWriteDaoSupabaseService {
  private supabaseService = inject(SupabaseService);
  private loggerService: LoggerService = inject(LoggerService);
  private userUtilsService = inject(UserUtilsService);
  private readonly CLASS_NAME = UserWriteDaoSupabaseService.name;

  constructor() {
  }

  insert(user: UserEntity): Observable<UserEntity> {
    const dbData = this.userUtilsService.mapToDb(user);
    return from(
      this.supabaseService.fromUsers('user')
        .insert(dbData)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.userUtilsService.mapToEntity(res.data);
      })
    );
  }

  update(user: UserEntity): Observable<UserEntity> {
    const dbData = this.userUtilsService.mapToDb(user);
    const context = 'update';
    this.loggerService.debug(`Updating user ${user.id} with data ${JSON.stringify(dbData)}`, this.CLASS_NAME, context);
    return from(
      this.supabaseService.fromUsers('user')
        .update(dbData)
        .eq('id', user.id)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return this.userUtilsService.mapToEntity(res.data);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return from(
      this.supabaseService.fromUsers('user')
        .delete()
        .eq('id', id)
    ).pipe(
      map(res => !res.error)
    );
  }

}