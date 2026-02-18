import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserListDaoSupabaseService } from 'src/app/core/services/users/dao/user.list.dao.supabase.service';
import { ListEntity } from 'src/app/shared/entity/list.entity';
import { ListItemRcpUpsertRequestEntity, ListRcpCopyRequestEntity, ListRcpUpsertRequestEntity } from 'src/app/shared/entity/rcp/list.rcp.entity';
import { ListItemViewEntity, ListViewEntity } from 'src/app/shared/entity/view/list.view.entity';

@Injectable({
  providedIn: 'root'
})
export class UserListService {
  
  private userListDaoSupabaseService = inject(UserListDaoSupabaseService);

  getAll(userIds?: string[]): Observable<ListViewEntity[]> {
    return this.userListDaoSupabaseService.getAll(userIds);
  }

  getAllItems(listId: string): Observable<Partial<ListItemViewEntity>[]> {
    return this.userListDaoSupabaseService.getAllItems(listId);
  }

  getFavorites(userIds?: string[]): Observable<ListViewEntity[]> {
    return this.userListDaoSupabaseService.getFavorites(userIds);
  }

  getFavoritesByUser(userId: string): Observable<ListItemViewEntity[]> {
    return this.userListDaoSupabaseService.getFavoritesByUser(userId);
  }

  getTracking(userIds?: string[]): Observable<ListViewEntity[]> {
    return this.userListDaoSupabaseService.getTracking(userIds);
  }

  getTrackingByUser(userId: string): Observable<ListItemViewEntity[]> {
    return this.userListDaoSupabaseService.getTrackingByUser(userId);
  }

  getNotifier(userIds?: string[]): Observable<ListViewEntity[]> {
    return this.userListDaoSupabaseService.getNotifier(userIds);
  }

  getNotifierByUser(userId: string): Observable<ListItemViewEntity[]> {
    return this.userListDaoSupabaseService.getNotifierByUser(userId);
  }

  getAllItemsComplete(listId: string): Observable<ListItemViewEntity[]> {
    return this.userListDaoSupabaseService.getAllItemsComplete(listId);
  }

  getById(id: string): Observable<ListEntity> {
    return this.userListDaoSupabaseService.getById(id);
  }

  upsert(data: ListRcpUpsertRequestEntity): Observable<string|null> {
    return this.userListDaoSupabaseService.upsert(data);
  }

  delete(id:string): Observable<boolean> {
    return this.userListDaoSupabaseService.delete(id);
  }

  upsertItem(data: ListItemRcpUpsertRequestEntity): Observable<string|null> {
    return this.userListDaoSupabaseService.upsertItem(data);
  }

  copy(data: ListRcpCopyRequestEntity): Observable<string|null> {
    return this.userListDaoSupabaseService.copy(data);
  }

  removeItem(listId: string, itemId: string): Observable<boolean> {
    return this.userListDaoSupabaseService.removeItem(listId, itemId);
  }

}
