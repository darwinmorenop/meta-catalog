import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CampaignService } from 'src/app/core/services/campaigns/campaign.service';
import { CampaignEntity } from 'src/app/shared/entity/view/campaign.entity';
import { Observable, map, of, shareReplay, BehaviorSubject, tap, catchError, switchMap } from 'rxjs';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { RouterModule } from '@angular/router';
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
export class CampaignDashboardComponent implements OnInit {
  private campaignService = inject(CampaignService);
  private dialog = inject(MatDialog);

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  private refreshSubject = new BehaviorSubject<void>(undefined);
  
  campaigns$: Observable<CampaignEntity[]> = this.refreshSubject.pipe(
    tap(() => this.loadingSubject.next(true)),
    switchMap(() => this.campaignService.getAllCampaigns()),
    tap(() => this.loadingSubject.next(false)),
    catchError(err => {
      this.loadingSubject.next(false);
      console.error('Error loading campaigns:', err);
      return of([]);
    }),
    shareReplay(1)
  );

  activeCampaign$: Observable<CampaignEntity | undefined> = this.campaigns$.pipe(
    map(campaigns => {
      const now = new Date();
      return campaigns.find(c => {
        const start = new Date(c.started_at);
        const end = new Date(c.finished_at);
        return now >= start && now <= end;
      });
    })
  );

  tableData$: Observable<any[]> = this.campaigns$.pipe(
    map(campaigns => campaigns.map(c => ({
      ...c,
      started_at_display: new Date(c.started_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      finished_at_display: new Date(c.finished_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    })))
  );

  tableConfig: TableConfig = {
    columns: [
      { key: 'name', header: 'Nombre', filterable: true },
      { key: 'started_at_display', header: 'Inicio', filterable: false },
      { key: 'finished_at_display', header: 'Fin', filterable: false },
      { key: 'description', header: 'Descripción', filterable: true }
    ],
    searchableFields: ['name', 'description'],
    pageSizeOptions: [5, 10, 20]
  };

  ngOnInit(): void {}

  loadCampaigns() {
    this.refreshSubject.next();
  }

  addCampaign() {
    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '500px',
      data: { campaign: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.campaignService.createCampaign(result).subscribe(() => this.loadCampaigns());
      }
    });
  }

  editCampaign(campaign: CampaignEntity) {
    const dialogRef = this.dialog.open(CampaignDialogComponent, {
      width: '500px',
      data: { campaign: { ...campaign } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && campaign.id) {
        this.campaignService.updateCampaign(campaign.id, result).subscribe(() => this.loadCampaigns());
      }
    });
  }

  deleteCampaign(campaign: CampaignEntity) {
    if (confirm(`¿Estás seguro de eliminar la campaña "${campaign.name}"?`)) {
      this.campaignService.deleteCampaign(campaign.id).subscribe(() => this.loadCampaigns());
    }
  }
}
