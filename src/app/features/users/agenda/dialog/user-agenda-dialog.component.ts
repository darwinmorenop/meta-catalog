import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { UserAgendaService } from 'src/app/core/services/users/user.agenda.service';
import { UserService } from 'src/app/core/services/users/user.service';
import { UserAgendaDashboardEntity } from 'src/app/shared/entity/view/user.agenda.dashboard.entity';
import { UserSearchExistingDialogComponent } from './search-existing/user-search-existing-dialog.component';
import { UserDashboardModel } from 'src/app/core/models/users/user.model';
import { MatDivider } from "@angular/material/divider";
import { UserEntity } from 'src/app/shared/entity/user.entity';
import { UserAgendaHistory } from "src/app/shared/entity/user.agenda.entity";
import { UserAgendaCreateRcpResponseEntity } from 'src/app/shared/entity/rcp/user.agenda.rcp.entity';
import { UserAgendaHistoryDialogComponent } from './history/user-agenda-history-dialog.component';

export interface UserAgendaDialogData {
  contact: UserAgendaDashboardEntity | null;
  mode: 'view' | 'edit' | 'create';
}

@Component({
  selector: 'app-user-agenda-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatDivider
],
  templateUrl: 'user-agenda-dialog.component.html',
  styleUrl: 'user-agenda-dialog.component.scss'
})
export class UserAgendaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private agendaService = inject(UserAgendaService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<UserAgendaDialogComponent>);
  readonly data = inject<UserAgendaDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  linkForm!: FormGroup;
  selectedContactName = signal<string | null>(null);
  apiError = signal<string | null>(null);
  contactHistory = signal<UserAgendaHistory[]>([]);
  followUpHistory = signal<UserAgendaHistory[]>([]);
  
  // Optimization flags
  private historyFetched = signal(false);
  private contactHistoryModified = signal(false);
  private followUpHistoryModified = signal(false);

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  get isViewMode() { return this.data.mode === 'view'; }
  get isEditMode() { return this.data.mode === 'edit'; }
  get isCreateMode() { return this.data.mode === 'create'; }

  get canEditBasicInfo() {
    if (this.isCreateMode) return true;
    if (!this.data.contact) return false;
    // We check if the user record owner matches the agenda relationship owner
    return this.data.contact.user_owner_id === this.data.contact.owner_id;
  }

  ngOnInit() {
    this.initForms();
    if (this.data.contact) {
      this.patchForm(this.data.contact);
      
      // If we are in edit mode but don't have permissions to edit basic info
      if (this.isEditMode && !this.canEditBasicInfo) {
        this.disableBasicFields();
      }
    }
  }

  private disableBasicFields() {
    const basicFields = ['first_name', 'last_name', 'email', 'phone', 'birthday', 'olfative', 'skin'];
    basicFields.forEach(field => {
      this.form.get(field)?.disable();
    });
  }

  initForms() {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: [''],
      email: ['', [Validators.email]],
      phone: [''],
      alias: [''],
      tags: [[]],
      lead: [[]],
      birthday: [null],
      notes: [''],
      olfative: [[]],
      skin: [[]]
    });

    this.linkForm = this.fb.group({
      contact_id: [null, Validators.required],
      alias: [''],
      tags: [[]]
    });

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  patchForm(contact: UserAgendaDashboardEntity) {
    this.form.patchValue({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      alias: contact.alias,
      tags: contact.tags || [],
      lead: contact.lead || [],
      birthday: contact.birthday,
      notes: contact.agenda_notes,
      olfative: contact.profile?.olfative || [],
      skin: contact.profile?.skin || []
    });

    // We need to handle security profile correctly. 
    // The dashboard entity might not have the security profile id directly.
    // Let's assume for now we might need to fetch it or it's in the contact id.
  }


  openUserSearch() {
    const dialogRef = this.dialog.open(UserSearchExistingDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe((user: Partial<UserEntity>) => {
      if (user) {
        this.linkForm.patchValue({ contact_id: user.id });
        const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
        this.selectedContactName.set(fullName);
        
        // Set alias to full name if empty
        if (!this.linkForm.get('alias')?.value) {
            this.linkForm.patchValue({ alias: fullName });
        }
      }
    });
  }

  viewHistory(type: 'contact' | 'follow_up') {
    if (!this.data.contact) return;
    
    // Lazy fetch if not already done
    if (!this.historyFetched() && !this.isCreateMode) {
        this.agendaService.getHistory(this.data.contact.owner_id, this.data.contact.contact_id).subscribe({
            next: (history) => {
                this.contactHistory.set(history.last_contact_history || []);
                this.followUpHistory.set(history.follow_up_history || []);
                this.historyFetched.set(true);
                this.openHistoryDialog(type);
            },
            error: (err) => console.error(err)
        });
    } else {
        this.openHistoryDialog(type);
    }
  }

  private openHistoryDialog(type: 'contact' | 'follow_up') {
    const title = type === 'contact' ? 'Historial de Contacto' : 'Historial de Seguimiento';
    const historyData = type === 'contact' ? this.contactHistory() : this.followUpHistory();
    
    const dialogRef = this.dialog.open(UserAgendaHistoryDialogComponent, {
      width: '500px',
      data: { 
        title, 
        history: historyData,
        mode: this.isEditMode ? 'edit' : 'view',
        owner_id: this.data.contact?.owner_id,
        contact_id: this.data.contact?.contact_id,
        type: type
      }
    });

    dialogRef.afterClosed().subscribe((newHistory: UserAgendaHistory[] | null) => {
        if (newHistory !== null) {
            if (type === 'contact') {
                this.contactHistory.set(newHistory);
                this.contactHistoryModified.set(true);
            } else {
                this.followUpHistory.set(newHistory);
                this.followUpHistoryModified.set(true);
            }
        }
    });
  }

  addTag(event: MatChipInputEvent, field: string, formGroup: FormGroup = this.form): void {
    const value = (event.value || '').trim();
    if (value) {
      const control = formGroup.get(field);
      if (control) {
        const current = control.value || [];
        formGroup.patchValue({ [field]: [...current, value] });
        control.updateValueAndValidity();
      }
    }
    event.chipInput!.clear();
  }

  removeTag(value: string, field: string, formGroup: FormGroup = this.form): void {
    const control = formGroup.get(field);
    if (control) {
      const current = control.value || [];
      formGroup.patchValue({ [field]: current.filter((v: string) => v !== value) });
      control.updateValueAndValidity();
    }
  }

  save() {
    if (this.isCreateMode) {
      this.createContact();
    } else if (this.isEditMode) {
      this.updateContact();
    }
  }

  createContact() {
    if (this.form.invalid) return;

    const currentUser = this.userService.currentUser();
    if (!currentUser) return;

    const val = this.form.value;
    const payload = {
        p_owner_id: currentUser.id,
        p_first_name: val.first_name,
        p_last_name: val.last_name,
        p_email: val.email,
        p_phone: val.phone,
        p_alias: val.alias,
        p_tags: val.tags,
        p_lead: val.lead,
        p_profile: {
            olfative: val.olfative,
            skin: val.skin
        },
        p_birthday: val.birthday,
        p_notes: val.notes
    };

    this.apiError.set(null);
    this.agendaService.create(payload as any).subscribe({
        next: (res: UserAgendaCreateRcpResponseEntity) => {
          if (res.status === 'success') {
            this.dialogRef.close(res);
          } else {
            this.apiError.set(res.message);
          }
        },
        error: (err) => {
          console.error(err);
          this.apiError.set('Error desconocido');
        }
    });
  }

  linkExisting() {
    if (this.linkForm.invalid) return;

    const currentUser = this.userService.currentUser();
    if (!currentUser) return;

    const val = this.linkForm.value;
    const payload = {
        p_owner_id: currentUser.id,
        p_contact_id: val.contact_id,
        p_alias: val.alias,
        p_tags: val.tags
    };

    this.apiError.set(null);
    this.agendaService.link(payload).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.dialogRef.close(res);
          } else {
            this.apiError.set(res.message);
          }
        },
        error: (err) => {
          console.error(err);
          this.apiError.set('Error desconocido');
        }
    });
  }

  updateContact() {
    if (this.form.invalid) return;
    if (!this.data.contact) return;

    const val = this.form.value;
    // Partial update to user_agenda
    const payload: any = {
        owner_id: this.data.contact.owner_id,
        contact_id: this.data.contact.contact_id,
        alias: val.alias,
        tags: val.tags,
        lead: val.lead,
        notes: val.notes
    };

    if (this.contactHistoryModified()) {
        payload.last_contact_history = this.contactHistory();
    }
    if (this.followUpHistoryModified()) {
        payload.follow_up_history = this.followUpHistory();
    }

    this.agendaService.update(payload).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => console.error(err)
    });
  }
}
