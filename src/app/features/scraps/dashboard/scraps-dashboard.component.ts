import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ScrapSummaryEntry } from 'src/app/shared/entity/view/scrap.entry';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

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
  templateUrl: 'scraps-dashboard.component.html',
  styleUrls: ['scraps-dashboard.component.scss']
})
export class ScrapsDashboardComponent implements OnInit {
  private scrapService = inject(ScrapService);
  private router = inject(Router);
  private loggerService = inject(LoggerService)
  private readonly CLASS_NAME = ScrapsDashboardComponent.name

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
      { key: 'configDisplay', header: 'Config', filterable: false, type: 'config' }
    ],
    searchableFields: ['campaign_description'],
    pageSizeOptions: [10, 20, 50],
    actions: { show: true, edit: false, delete: false, view: true }
  };

  ngOnInit() {
    this.loadScraps();
  }

  loadScraps() {
    const context = 'loadScraps';
    this.isLoading.set(true);
    this.scrapService.getAllSummary().subscribe({
      next: (data) => {
        const mappedData = data.map(item => ({
          ...item,
          configDisplay: [
            { icon: 'sync', tooltip: 'Sincronizar Estado', active: item.config?.syncStatus },
            { icon: 'payments', tooltip: 'Sincronizar Precios', active: item.config?.syncPrices, color: 'accent' },
            { icon: 'inventory_2', tooltip: 'Sincronizar Stock', active: item.config?.syncStock },
            { icon: 'settings_suggest', tooltip: 'Sincronizar Propiedades', active: item.config?.syncProperties }
          ]
        }));
        this.scraps.set(mappedData as any);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.loggerService.error('Error loading scraps:', err, this.CLASS_NAME, context);
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

  onScrapView(scrap: ScrapSummaryEntry) {
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
