import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CampaignEntity } from 'src/app/shared/entity/view/campaign.entity';
import { DateUtilsService } from 'src/app/core/services/utils/date-utils.service';
import { DateTimeRangeComponent } from 'src/app/shared/components/date-time-range/date-time-range.component';

@Component({
  selector: 'app-campaign-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DateTimeRangeComponent
  ],
  templateUrl: 'campaign.dialog.component.html',
  styleUrls: ['campaign.dialog.component.scss']
})
export class CampaignDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dateUtils = inject(DateUtilsService);
  dialogRef = inject(MatDialogRef<CampaignDialogComponent>);

  form: FormGroup;
  isEditMode: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { campaign: CampaignEntity | null }) {
    this.isEditMode = !!data.campaign;
    
    this.form = this.fb.group({
      id: [data.campaign?.id],
      name: [data.campaign?.name || '', Validators.required],
      description: [data.campaign?.description || ''],
      started_at: [this.dateUtils.formatDateForInput(data.campaign?.started_at), Validators.required],
      finished_at: [this.dateUtils.formatDateForInput(data.campaign?.finished_at), Validators.required]
    });
  }

  ngOnInit() {}

  save() {
    if (this.form.valid) {
      const val = this.form.value;
      // Convert back to Date objects for the service
      const campaign = {
        ...val,
        started_at: new Date(val.started_at),
        finished_at: new Date(val.finished_at)
      };
      this.dialogRef.close(campaign);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
