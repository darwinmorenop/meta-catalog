import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: 'user-selector.component.html',
  styleUrl: 'user-selector.component.scss'
})
export class UserSelectorComponent {
  @Input() users: UserDashboardModel[] = [];
  @Input() initialSelectedId?: number;
  @Output() onSelected = new EventEmitter<UserDashboardModel>();

  searchControl = new FormControl('', { nonNullable: true });
  
  usersSignal = signal<UserDashboardModel[]>([]);

  constructor() {
    effect(() => {
      this.usersSignal.set(this.users);
    }, { allowSignalWrites: true });
  }

  filteredUsers = computed(() => {
    const term = this.searchControl.value.toLowerCase() || '';
    const allUsers = this.usersSignal();
    
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
    this.onSelected.emit(selectedUser);
  }
}
