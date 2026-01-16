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
import { SponsorSelectorDialogComponent } from 'src/app/features/users/dialog/sponsor-selector/sponsor-selector-dialog.component';
import { UserRankEnum, UserDashboardModel } from 'src/app/core/models/users/user.model';
import { UserSponsorEntity } from 'src/app/shared/entity/rcp/user.rcp.entity';
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
    MatSelectModule
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private loggerService = inject(LoggerService);
  private readonly CLASS_NAME = UserDialogComponent.name;
  dialogRef = inject(MatDialogRef<UserDialogComponent>);

  form: FormGroup;
  isEditMode: boolean;
  selectedSponsorName = signal<string>('Sin Sponsor');
  
  readonly rankOptions = Object.entries(UserRankEnum).map(([key, value]) => ({
    key,
    label: value
  }));

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: UserDashboardModel | null }) {
    const context = 'constructor';
    this.isEditMode = !!data.user;
    this.loggerService.log(`Received data: ${JSON.stringify(data)}`,this.CLASS_NAME, context);
    
    this.form = this.fb.group({
      id: [data.user?.id],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      phone: [data.user?.phone || ''],
      isManual: [data.user?.isManual ?? true],
      firstName: [data.user?.firstName || '', Validators.required],
      lastName: [data.user?.lastName || ''],
      rank: [data.user?.rank || UserRankEnum.clienta, Validators.required],
      sponsorId: [data.user?.sponsor?.id || null],
      image: [data.user?.image || '']
    });

    if (data.user?.sponsor) {
      this.selectedSponsorName.set(`${data.user.sponsor.firstName} ${data.user.sponsor.lastName || ''}`);
    }
  }

  ngOnInit() {}

  openSponsorSelector() {
    const dialogRef = this.dialog.open(SponsorSelectorDialogComponent, {
      width: '800px',
      data: { editingUserId: this.form.get('id')?.value }
    });

    dialogRef.afterClosed().subscribe((sponsor: UserSponsorEntity) => {
      if (sponsor) {
        this.form.patchValue({
          sponsorId: sponsor.id
        });
        this.selectedSponsorName.set(sponsor.fullName);
      }
    });
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
