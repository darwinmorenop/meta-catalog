import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SponsorSelectorDialogComponent } from 'src/app/features/users/dialog/sponsor-selector/sponsor-selector-dialog.component';
import { UserSimpleSelectorDialogComponent } from 'src/app/features/users/dialog/simple-selector/user-simple-selector-dialog.component';
import { UserProfileSimpleSelectorDialogComponent } from 'src/app/features/users/profiles/dialog/simple-selector/user-profile-simple-selector-dialog.component';
import { UserRankEnum, UserDashboardModel, UserRankLabel } from 'src/app/core/models/users/user.model';
import { UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
import { UserProfile } from 'src/app/shared/entity/user.profile.entity';
import { UserProfileService } from 'src/app/core/services/users/user.profile.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: 'user-dialog.component.html',
  styleUrls: ['user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private profileService = inject(UserProfileService);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserDialogComponent.name;
  dialogRef = inject(MatDialogRef<UserDialogComponent>);

  form: FormGroup;
  isEditMode: boolean;
  selectedSponsorName = signal<string>('Sin Sponsor');
  selectedProfileName = signal<string>('Sin Perfil');
  
  readonly rankOptions = Object.values(UserRankEnum).map(rank => ({
    key: rank,
    label: UserRankLabel[rank] || rank
  }));

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: UserDashboardModel | null }) {
    const context = 'constructor';
    this.isEditMode = !!data.user;
    this.loggerService.log(`Received data: ${JSON.stringify(data)}`,this.CLASS_NAME, context);
    
    this.form = this.fb.group({
      id: [data.user?.id],
      identifier: [data.user?.identifier || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      phone: [data.user?.phone || ''],
      isManual: [data.user?.isManual ?? true],
      firstName: [data.user?.firstName || '', Validators.required],
      lastName: [data.user?.lastName || ''],
      rank: [data.user?.rank || UserRankEnum.clienta, Validators.required],
      sponsorId: [data.user?.sponsor?.id || null],
      image: [data.user?.image || ''],
      user_profile_id: [data.user?.user_profile_id || '', Validators.required],
      theme: [data.user?.settings?.theme || 'light']
    });

    if (data.user?.sponsor) {
      this.selectedSponsorName.set(`${data.user.firstName} ${data.user.lastName || ''}`);
    }

    if (data.user?.user_profile_id) {
      this.loadProfileName(data.user.user_profile_id);
    }
  }

  loadProfileName(profileId: string) {
    this.profileService.getAll().subscribe(profiles => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) this.selectedProfileName.set(profile.name);
    });
  }

  ngOnInit() {}

  openSponsorSelector() {
    if (this.isEditMode) {
      this.openComplexSponsorSelector();
    } else {
      this.openSimpleSponsorSelector();
    }
  }

  private openComplexSponsorSelector() {
    const dialogRef = this.dialog.open(SponsorSelectorDialogComponent, {
      width: '800px',
      data: { editingUserId: this.form.get('id')?.value }
    });

    dialogRef.afterClosed().subscribe((sponsor: UserSponsorEntity) => {
      if (sponsor) {
        this.updateSponsor(sponsor.id, sponsor.fullName);
      }
    });
  }

  private openSimpleSponsorSelector() {
    const dialogRef = this.dialog.open(UserSimpleSelectorDialogComponent, {
      width: '500px',
      data: { initialSelectedId: this.form.get('sponsorId')?.value }
    });

    dialogRef.afterClosed().subscribe((user: UserDashboardModel) => {
      if (user) {
        this.updateSponsor(user.id, `${user.firstName} ${user.lastName || ''}`);
      }
    });
  }

  private updateSponsor(id: number, name: string) {
    this.form.patchValue({ sponsorId: id });
    this.selectedSponsorName.set(name);
  }

  openProfileSelector() {
    const dialogRef = this.dialog.open(UserProfileSimpleSelectorDialogComponent, {
      width: '500px',
      data: { initialSelectedId: this.form.get('user_profile_id')?.value }
    });

    dialogRef.afterClosed().subscribe((profile: UserProfile) => {
      if (profile) {
        this.form.patchValue({
          user_profile_id: profile.id
        });
        this.selectedProfileName.set(profile.name);
      }
    });
  }

  save() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const result = {
        ...formValue,
        settings: {
          theme: formValue.theme
        }
      };
      delete result.theme;
      this.dialogRef.close(result);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
