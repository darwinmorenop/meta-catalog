import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';

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
    MatDividerModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule,
    SmartTableComponent
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
  private _permissions = signal<{ resource: Resource; actions: Action[] }[]>([]);
  permissions = this._permissions.asReadonly();
  availableResources: Resource[] = Object.values(Resource);
  labelResource = labelResource;
  labelAction = labelAction;

  tableConfig: TableConfig = {
    columns: [
      { key: 'resourceLabel', header: 'Recurso', filterable: true },
      { key: 'actionChips', header: 'Acciones', type: 'chips' }
    ],
    searchableFields: ['resourceLabel'],
    pageSizeOptions: [5, 10, 20],
    actions: {
      show: true,
      view: true,
      edit: true,
      delete: true
    }
  };

  tableData = computed(() => {
    return this.permissions().map(p => ({
      ...p,
      resourceLabel: `${this.getResourceLabel(p.resource)} (${p.resource})`,
      actionChips: p.actions.map(a => ({
        value: this.getActionLabel(a),
        color: '#673ab7'
      })),
      smart_table_edit_disabled: this.isViewMode,
      smart_table_delete_disabled: this.isViewMode
    }));
  });

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
    const perms = Object.entries(permissionMap).map(([resource, actions]) => ({
      resource: resource as Resource,
      actions: actions || []
    }));
    this._permissions.set(perms);
  }

  addResource(resource: Resource) {
    if (!this.permissions().find(p => p.resource === resource)) {
      this._permissions.update(prev => [...prev, { resource, actions: [] }]);
    }
  }

  get unusedResources() {
    return this.availableResources.filter(r => !this.permissions().find(p => p.resource === r));
  }

  onViewResource(item: any) {
     this.dialog.open(PermissionEditDialogComponent, {
      width: '500px',
      data: { resource: item.resource, actions: item.actions, mode: 'view' }
    });
  }

  onEditResource(item: any) {
    const dialogRef = this.dialog.open(PermissionEditDialogComponent, {
      width: '500px',
      data: { resource: item.resource, actions: item.actions, mode: 'edit' }
    });

    dialogRef.afterClosed().subscribe(newActions => {
      if (newActions) {
        this._permissions.update(prev => {
          const updated = [...prev];
          const index = updated.findIndex(p => p.resource === item.resource);
          if (index > -1) {
            updated[index] = { ...updated[index], actions: newActions };
          }
          return updated;
        });
      }
    });
  }

  onDeleteResource(item: any) {
    this.removeResource(item.resource);
  }

  removeResource(resource: Resource) {
    this._permissions.update(prev => prev.filter(p => p.resource !== resource));
  }

  getResourceLabel(resource: Resource): string {
    return labelResource[resource] || resource;
  }

  getActionLabel(action: Action): string {
    return labelAction[action] || action.toString();
  }

  save() {
    if (this.form.invalid) return;

    const permissionMap: PermissionMap = {};
    this.permissions().forEach(p => {
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
