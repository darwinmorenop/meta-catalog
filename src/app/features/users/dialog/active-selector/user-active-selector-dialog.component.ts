import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { UserService } from 'src/app/core/services/users/user.service';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';

export interface UserSelectorDialogData {
  selectOnly?: boolean;
}

@Component({
  selector: 'app-user-active-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-active-selector-dialog.component.html',
  styleUrl: './user-active-selector-dialog.component.scss'
})
export class UserActiveSelectorDialogComponent {
  userService = inject(UserService);
  dialogRef = inject(MatDialogRef<UserActiveSelectorDialogComponent>);
  data = inject<UserSelectorDialogData>(MAT_DIALOG_DATA, { optional: true });
  
  searchControl = new FormControl('', { nonNullable: true });

  filteredUsers = computed(() => {
    const term = this.searchControl.value.toLowerCase() || '';
    const allUsers = this.userService.users();
    
    if (!term) return allUsers;
    
    return allUsers.filter(u => 
      u.firstName?.toLowerCase().includes(term) || 
      u.lastName?.toLowerCase().includes(term) || 
      u.email?.toLowerCase().includes(term) || 
      u.identifier?.toLowerCase().includes(term)
    );
  });

  onSelectionChange(event: any) {
    const selectedUser = event.options[0].value as UserDashboardModel;
    if (!this.data?.selectOnly) {
      this.userService.setCurrentUser(selectedUser);
    }
    this.dialogRef.close(selectedUser);
  }

  clearActiveUser() {
    if (!this.data?.selectOnly) {
      this.userService.setCurrentUser(null);
    }
    this.dialogRef.close(null);
  }
}
