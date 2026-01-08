import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { ScrapEntity } from 'src/app/shared/entity/scrap.entity';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';

@Component({
  selector: 'app-scraps-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SmartTableComponent,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './scraps-dashboard.component.html',
  styleUrls: ['./scraps-dashboard.component.scss']
})
export class ScrapsDashboardComponent implements OnInit {
  private scrapService = inject(ScrapService);
  private router = inject(Router);

  scraps = signal<ScrapSummaryEntry[]>([]);
  isLoading = signal<boolean>(false);

  tableConfig: TableConfig = {
    columns: [
      { key: 'created_at', header: 'Creación', filterable: true, type: 'date' },
      { key: 'campaign_description', header: 'Campaña', filterable: true },
      { key: 'total_general', header: 'Total', filterable: false },
      { key: 'total_updated', header: 'Actualizados', filterable: false },
      { key: 'total_created', header: 'Creados', filterable: false },
      { key: 'total_archived', header: 'Archivados', filterable: false },
    ],
    searchableFields: ['campaign_description'],
    pageSizeOptions: [10, 20, 50],
    actions: { show: true, edit: false, delete: false, view: true }
  };

  ngOnInit() {
    this.loadScraps();
  }

  loadScraps() {
    this.isLoading.set(true);
    this.scrapService.getAllSummary().subscribe({
      next: (data) => {
        this.scraps.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading scraps:', err);
        this.isLoading.set(false);
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  goToSyncProposal() {
    this.router.navigate(['/scraps/sync']);
  }

  onScrapSelected(scrap: ScrapSummaryEntry) {
    if (scrap && scrap.scrap_id) {
      this.router.navigate(['/scraps', scrap.scrap_id]);
    }
  }

  deleteScrap(scrap: ScrapSummaryEntry) {
    if (confirm(`¿Estás seguro de eliminar el scrap de "${scrap.client}" (${scrap.created_at})?`)) {
      this.scrapService.delete(scrap.scrap_id).subscribe(() => {
        this.loadScraps();
      });
    }
  }
}
