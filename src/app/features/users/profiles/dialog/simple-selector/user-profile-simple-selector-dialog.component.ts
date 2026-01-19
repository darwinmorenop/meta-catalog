import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserProfileSelectorComponent } from '../../components/user-profile-selector/user-profile-selector.component';
import { UserProfileService } from 'src/app/core/services/users/user.profile.service';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';
import { MatIcon } from "@angular/material/icon";

export interface UserProfileSimpleSelectorData {
  initialSelectedId?: string;
}

@Component({
  selector: 'app-user-profile-simple-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    UserProfileSelectorComponent,
    MatIcon
],
  templateUrl: 'user-profile-simple-selector-dialog.component.html',
  styleUrl: 'user-profile-simple-selector-dialog.component.scss'
})
export class UserProfileSimpleSelectorDialogComponent implements OnInit {
  private readonly profileService = inject(UserProfileService);
  readonly dialogRef = inject(MatDialogRef<UserProfileSimpleSelectorDialogComponent>);
  readonly data = inject<UserProfileSimpleSelectorData>(MAT_DIALOG_DATA, { optional: true });

  profiles = signal<UserProfile[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.isLoading.set(true);
    this.profileService.getAll().subscribe({
      next: (data) => {
        this.profiles.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onProfileSelected(profile: UserProfile) {
    this.dialogRef.close(profile);
  }
}
