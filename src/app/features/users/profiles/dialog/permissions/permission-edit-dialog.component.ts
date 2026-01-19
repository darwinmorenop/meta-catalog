import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Resource, Action, labelResource, labelAction } from 'src/app/shared/entity/user.profile.entity';

export interface PermissionEditData {
  resource: Resource;
  actions: Action[];
  mode: 'view' | 'edit';
}

@Component({
  selector: 'app-permission-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: 'permission-edit-dialog.component.html',
  styleUrl: 'permission-edit-dialog.component.scss'
})
export class PermissionEditDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PermissionEditDialogComponent>);
  readonly data = inject<PermissionEditData>(MAT_DIALOG_DATA);

  selectedActions: Action[] = [...this.data.actions];
  allActions: Action[] = Object.values(Action);
  labelResource = labelResource;
  labelAction = labelAction;

  get isViewMode() { return this.data.mode === 'view'; }

  getResourceLabel(resource: Resource): string {
    return labelResource[resource] || resource;
  }

  getActionLabel(action: Action): string {
    return labelAction[action] || action;
  }

  get availableActions() {
    return this.allActions.filter(a => !this.selectedActions.includes(a));
  }

  addAction(action: Action) {
    if (!this.selectedActions.includes(action)) {
      this.selectedActions = [...this.selectedActions, action];
    }
  }

  removeAction(action: Action) {
    this.selectedActions = this.selectedActions.filter(a => a !== action);
  }

  save() {
    this.dialogRef.close(this.selectedActions);
  }
}
