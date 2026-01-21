import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ListItemTrackingTypeEnum } from 'src/app/shared/entity/list.entity';

@Component({
  selector: 'app-user-list-tracking-sale-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user-list-tracking-sale-edit-dialog.component.html',
  styleUrl: './user-list-tracking-sale-edit-dialog.component.scss'
})
export class UserListTrackingSaleEditDialogComponent {
  form: FormGroup;
  isEdit: boolean;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserListTrackingSaleEditDialogComponent>
  ) {
    console.log(data);
    this.isEdit = !!data.item_id || !!data.id;
    this.form = this.fb.group({
      tracking_type: [ListItemTrackingTypeEnum.sale],
      target_price: [0]
    });
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
