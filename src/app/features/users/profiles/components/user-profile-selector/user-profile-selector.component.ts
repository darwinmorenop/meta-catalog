import { Component, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';

@Component({
  selector: 'app-user-profile-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: 'user-profile-selector.component.html',
  styleUrl: 'user-profile-selector.component.scss'
})
export class UserProfileSelectorComponent {
  @Input() profiles: UserProfile[] = [];
  @Input() initialSelectedId?: string;
  @Output() onSelected = new EventEmitter<UserProfile>();

  searchControl = new FormControl('', { nonNullable: true });
  
  profilesSignal = signal<UserProfile[]>([]);

  constructor() {
    effect(() => {
      this.profilesSignal.set(this.profiles);
    }, { allowSignalWrites: true });
  }

  filteredProfiles = computed(() => {
    const term = this.searchControl.value.toLowerCase() || '';
    const allProfiles = this.profilesSignal();
    
    if (!term) return allProfiles;
    
    return allProfiles.filter(p => 
      p.name?.toLowerCase().includes(term) || 
      p.description?.toLowerCase().includes(term)
    );
  });

  onSelectionChange(event: any) {
    const selectedProfile = event.options[0].value as UserProfile;
    this.onSelected.emit(selectedProfile);
  }
}
