import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserSelectorComponent } from '../../components/user-selector/user-selector.component';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';

export interface UserSimpleSelectorData {
  userIds?: number[];
  initialSelectedId?: number;
}

@Component({
  selector: 'app-user-simple-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    UserSelectorComponent
  ],
  templateUrl: './user-simple-selector-dialog.component.html',
  styleUrl: './user-simple-selector-dialog.component.scss'
})
export class UserSimpleSelectorDialogComponent {
  private readonly userService = inject(UserService);
  readonly dialogRef = inject(MatDialogRef<UserSimpleSelectorDialogComponent>);
  readonly data = inject<UserSimpleSelectorData>(MAT_DIALOG_DATA, { optional: true });

  filteredUsers = computed(() => {
    const allUsers = this.userService.users();
    const userIds = this.data?.userIds || [];

    if (userIds.length === 0) return allUsers;

    return allUsers.filter(u => userIds.includes(u.id));
  });

  onUserSelected(selectedUser: UserDashboardModel) {
    this.dialogRef.close(selectedUser);
  }
}
