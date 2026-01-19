import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { UserProfile, Resource, Action, labelResource, labelAction, PermissionMap } from 'src/app/shared/entity/user.profile.entity';
import { UserProfileService } from 'src/app/core/services/users/user.profile.service';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { PermissionEditDialogComponent } from './permissions/permission-edit-dialog.component';

export interface UserProfileDialogData {
  profile: UserProfile | null;
  mode: 'view' | 'edit' | 'create';
}

@Component({
  selector: 'app-user-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule
  ],
  templateUrl: 'user-profile-dialog.component.html',
  styleUrl: 'user-profile-dialog.component.scss'
})
export class UserProfileDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(UserProfileService);
  private readonly logger = inject(LoggerService);
  private readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<UserProfileDialogComponent>);
  readonly data = inject<UserProfileDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  permissions: { resource: Resource; actions: Action[] }[] = [];
  availableResources: Resource[] = Object.values(Resource);
  labelResource = labelResource;
  labelAction = labelAction;

  get isViewMode() { return this.data.mode === 'view'; }
  get isEditMode() { return this.data.mode === 'edit'; }
  get isCreateMode() { return this.data.mode === 'create'; }

  ngOnInit() {
    this.initForm();
    if (this.data.profile) {
      this.loadPermissions(this.data.profile.permissions);
    }
  }

  initForm() {
    this.form = this.fb.group({
      name: [{ value: this.data.profile?.name ?? '', disabled: this.isViewMode }, Validators.required],
      description: [{ value: this.data.profile?.description ?? '', disabled: this.isViewMode }]
    });
  }

  loadPermissions(permissionMap: PermissionMap) {
    this.permissions = Object.entries(permissionMap).map(([resource, actions]) => ({
      resource: resource as Resource,
      actions: actions || []
    }));
  }

  addResource(resource: Resource) {
    if (!this.permissions.find(p => p.resource === resource)) {
      this.permissions = [...this.permissions, { resource, actions: [] }];
    }
  }

  get unusedResources() {
    return this.availableResources.filter(r => !this.permissions.find(p => p.resource === r));
  }

  viewResourceActions(item: { resource: Resource; actions: Action[] }) {
     this.dialog.open(PermissionEditDialogComponent, {
      width: '500px',
      data: { resource: item.resource, actions: item.actions, mode: 'view' }
    });
  }

  editResourceActions(item: { resource: Resource; actions: Action[] }) {
    const dialogRef = this.dialog.open(PermissionEditDialogComponent, {
      width: '500px',
      data: { resource: item.resource, actions: item.actions, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(newActions => {
      if (newActions) {
        const index = this.permissions.findIndex(p => p.resource === item.resource);
        if (index > -1) {
          const updated = [...this.permissions];
          updated[index] = { ...updated[index], actions: newActions };
          this.permissions = updated;
        }
      }
    });
  }

  removeResource(resource: Resource) {
    this.permissions = this.permissions.filter(p => p.resource !== resource);
  }

  getResourceLabel(resource: Resource): string {
    return labelResource[resource] || resource;
  }

  getActionLabel(action: Action): string {
    return labelAction[action] || action;
  }

  save() {
    if (this.form.invalid) return;

    const permissionMap: PermissionMap = {};
    this.permissions.forEach(p => {
      permissionMap[p.resource] = p.actions;
    });

    const payload: UserProfile = {
      ...this.data.profile,
      ...this.form.value,
      permissions: permissionMap
    };

    const action$ = this.isCreateMode 
      ? this.profileService.insert(payload)
      : this.profileService.update(payload);

    action$.subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => this.logger.error('Error saving profile', 'UserProfileDialogComponent', 'save', err)
    });
  }
}
