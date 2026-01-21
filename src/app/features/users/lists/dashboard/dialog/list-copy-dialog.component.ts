import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

export interface ListCopyDialogData {
  oldName: string;
}

@Component({
  selector: 'app-list-copy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './list-copy-dialog.component.html',
  styleUrl: './list-copy-dialog.component.scss'
})
export class ListCopyDialogComponent {
  private dialogRef = inject(MatDialogRef<ListCopyDialogComponent>);
  data = inject<ListCopyDialogData>(MAT_DIALOG_DATA);
  
  newName = `Copia de ${this.data.oldName}`;

  onConfirm() {
    this.dialogRef.close(this.newName);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
