import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserSelectorComponent } from 'src/app/features/users/components/user-selector/user-selector.component';

import { UserService } from 'src/app/core/services/users/user.service';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';

// No specific interface needed for active selector as it uses global state

@Component({
  selector: 'app-user-active-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    UserSelectorComponent
  ],
  templateUrl: 'user-active-selector-dialog.component.html',
  styleUrl: 'user-active-selector-dialog.component.scss'
})
export class UserActiveSelectorDialogComponent {
  userService = inject(UserService);
  dialogRef = inject(MatDialogRef<UserActiveSelectorDialogComponent>);

  onUserSelected(selectedUser: UserDashboardModel) {
    this.userService.setCurrentUser(selectedUser);
    this.dialogRef.close(selectedUser);
  }

  clearActiveUser() {
    this.userService.setCurrentUser(null);
    this.dialogRef.close(null);
  }
}
