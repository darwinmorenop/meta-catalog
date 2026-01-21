import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAgendaHistory } from 'src/app/shared/entity/user.agenda.entity';

export interface UserAgendaHistoryDialogData {
  title: string;
  history: UserAgendaHistory[];
  mode: 'view' | 'edit';
  owner_id: number;
  contact_id: number;
  type: 'contact' | 'follow_up';
}

@Component({
  selector: 'app-user-agenda-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './user-agenda-history-dialog.component.html',
  styleUrl: './user-agenda-history-dialog.component.scss'
})
export class UserAgendaHistoryDialogComponent {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<UserAgendaHistoryDialogComponent, UserAgendaHistory[] | null>);
  readonly data = inject<UserAgendaHistoryDialogData>(MAT_DIALOG_DATA);

  localHistory = signal<UserAgendaHistory[]>([...this.data.history].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  editingEntry = signal<UserAgendaHistory | null>(null);
  hasChanged = signal(false);

  historyForm: FormGroup = this.fb.group({
    result: ['Pendiente', Validators.required],
    notes: ['', Validators.required]
  });

  onAddEntry() {
    if (this.historyForm.invalid) return;

    const entry: UserAgendaHistory = {
        created_at: new Date(),
        result: this.historyForm.value.result,
        notes: this.historyForm.value.notes
    };

    this.localHistory.update(h => [entry, ...h]);
    this.historyForm.reset({ result: 'Pendiente', notes: '' });
    this.hasChanged.set(true);
  }

  onEditEntry(entry: UserAgendaHistory) {
      this.editingEntry.set(entry);
      this.historyForm.patchValue({
          result: entry.result,
          notes: entry.notes
      });
  }

  onUpdateEntry() {
      if (this.historyForm.invalid || !this.editingEntry()) return;
      
      const updated = {
          ...this.editingEntry()!,
          result: this.historyForm.value.result,
          notes: this.historyForm.value.notes
      };

      this.localHistory.update(h => h.map(e => e === this.editingEntry() ? updated : e));
      this.cancelEdit();
      this.hasChanged.set(true);
  }

  cancelEdit() {
      this.editingEntry.set(null);
      this.historyForm.reset({ result: 'Pendiente', notes: '' });
  }

  onDeleteEntry(entry: UserAgendaHistory) {
      if (this.editingEntry() === entry) this.cancelEdit();
      this.localHistory.update(h => h.filter(e => e !== entry));
      this.hasChanged.set(true);
  }

  onConfirm() {
    this.dialogRef.close(this.localHistory());
  }

  onCancel() {
      this.dialogRef.close(null);
  }
}
