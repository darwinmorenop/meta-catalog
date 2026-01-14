import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';

// Services & Entities
import { CampaignService } from 'src/app/core/services/campaigns/campaign.service';
import { CampaignEntity } from 'src/app/shared/entity/view/campaign.entity';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { CampaignDialogComponent } from '../dialog/campaign.dialog.component';

@Component({
  selector: 'app-campaign-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    SmartTableComponent,
    RouterModule
  ],
  templateUrl: './campaign-dashboard.component.html',
  styleUrl: './campaign-dashboard.component.scss'
})
export class CampaignDashboardComponent {
  private readonly campaignService = inject(CampaignService);
  private readonly dialog = inject(MatDialog);
  private readonly loggerService = inject(LoggerService);
  private readonly CLASS_NAME = CampaignDashboardComponent.name;

  campaignsResource = rxResource({
    stream: () => this.campaignService.getAllCampaigns(),
  });

  activeCampaign = computed(() => {
    const campaigns = this.campaignsResource.value() ?? [];
    const now = new Date();
    return campaigns.find(c => {
      const start = new Date(c.started_at);
      const end = new Date(c.finished_at);
      return now >= start && now <= end;
    });
  });

  tableData = computed(() => {
    const campaigns = this.campaignsResource.value() ?? [];
    return campaigns.map(c => ({
      ...c,
      started_at_display: new Date(c.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      finished_at_display: new Date(c.finished_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    }));
  });

  readonly tableConfig: TableConfig = {
    columns: [
      { key: 'name', header: 'Nombre', filterable: true },
      { key: 'started_at_display', header: 'Inicio', filterable: false },
      { key: 'finished_at_display', header: 'Fin', filterable: false },
      { key: 'description', header: 'Descripción', filterable: true }
    ],
    searchableFields: ['name', 'description'],
    pageSizeOptions: [5, 10, 20]
  };

  loadCampaigns(): void {
    this.campaignsResource.reload();
  }

  addCampaign(): void {
    const context = 'addCampaign'

    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '500px',
      data: { campaign: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.campaignService.createCampaign(result).subscribe({
          next: () => this.loadCampaigns(),
          error: (err) => this.loggerService.error('Error creating campaign', err, this.CLASS_NAME, context)
        });
      }
    });
  }

  editCampaign(campaign: CampaignEntity): void {
    const context = 'editCampaign'

    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '500px',
      data: { campaign: { ...campaign } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && campaign.id) {
        this.campaignService.updateCampaign(campaign.id, result).subscribe({
          next: () => this.loadCampaigns(),
          error: (err) => this.loggerService.error('Error updating campaign', err, this.CLASS_NAME, context)
        });
      }
    });
  }

  deleteCampaign(campaign: CampaignEntity): void {
    const context = 'deleteCampaign'
    if (confirm(`¿Estás seguro de eliminar la campaña "${campaign.name}"?`)) {
      this.campaignService.deleteCampaign(campaign.id).subscribe({
        next: () => this.loadCampaigns(),
        error: (err) => this.loggerService.error('Error deleting campaign', err, this.CLASS_NAME, context)
      });
    }
  }
}