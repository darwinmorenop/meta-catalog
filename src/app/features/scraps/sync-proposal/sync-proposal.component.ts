import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterModule } from '@angular/router';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductScrapSyncPendingChange, ProductScrapSyncOptions } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';

@Component({
  selector: 'app-sync-proposal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SmartTableComponent,
    MatCardModule,
    MatTabsModule,
    MatCheckboxModule,
    RouterModule
  ],
  templateUrl: './sync-proposal.component.html',
  styleUrls: ['./sync-proposal.component.scss']
})
export class SyncProposalComponent {
  private scrapService = inject(ScrapService);
  private logger = inject(LoggerService);
  private router = inject(Router);

  // Options
  syncOptions: ProductScrapSyncOptions = {
    syncStatus: true,
    syncPrices: false,
    syncStock: false,
    syncProperties: false
  };

  isSyncing = signal<boolean>(false);
  showProposal = signal<boolean>(false);
  scrapId = signal<number>(-1);

  // Proposal State
  createChanges = signal<ProductScrapSyncPendingChange[]>([]);
  updateChanges = signal<ProductScrapSyncPendingChange[]>([]);
  archiveChanges = signal<ProductScrapSyncPendingChange[]>([]);

  proposalTableConfig: TableConfig = {
    columns: [
      { key: 'manufacturerRef', header: 'Referencia', filterable: true },
      { key: 'productName', header: 'Nombre', filterable: true },
      { key: 'saved', header: 'Aplicado', filterable: true }
    ],
    searchableFields: ['manufacturerRef'],
    pageSizeOptions: [5, 10, 20],
    actions: { show: true, edit: true, editIcon: 'save', delete: false }
  };

  loadProposal() {
    if (this.createChanges().length > 0 || this.updateChanges().length > 0 || this.archiveChanges().length > 0){
      if (!confirm(`¿Estás seguro de cargar datos remotos? Se pueden perder cambios locales.`)) {
        this.isSyncing.set(false);
        return;
      };
    }
    this.isSyncing.set(true);
    this.scrapService.getChanges(this.syncOptions).subscribe({
      next: (changes) => {
        this.scrapId.set(-1);
        this.createChanges.set(changes.filter(c => c.type === 'CREATE'));
        this.updateChanges.set(changes.filter(c => c.type === 'UPDATE'));
        this.archiveChanges.set(changes.filter(c => c.type === 'ARCHIVE'));
        this.showProposal.set(true);
        this.isSyncing.set(false);
      },
      error: (err) => {
        console.error('Error loading proposal:', err);
        this.isSyncing.set(false);
      }
    });
  }

  applyAll(type: 'CREATE' | 'UPDATE' | 'ARCHIVE' | 'ALL') {
    let changesToApply: ProductScrapSyncPendingChange[] = [];
    if (type === 'CREATE') changesToApply = this.createChanges().filter(c => !c.saved);
    else if (type === 'UPDATE') changesToApply = this.updateChanges().filter(c => !c.saved);
    else if (type === 'ARCHIVE') changesToApply = this.archiveChanges().filter(c => !c.saved);
    else changesToApply = [...this.createChanges().filter(c => !c.saved), ...this.updateChanges().filter(c => !c.saved), ...this.archiveChanges().filter(c => !c.saved)];

    if (changesToApply.length === 0) return;

    this.isSyncing.set(true);
    if (type === 'ALL') {
      if (!confirm(`¿Estás seguro de aplicar todos los cambios?`)){
        this.isSyncing.set(false);
        return;
      } 
      this.scrapService.applyChangesAll(changesToApply, this.scrapId()).subscribe({
        next: () => {
          this.loadProposal();
        },
        error: (err) => {
          console.error('Error applying changes:', err);
          this.isSyncing.set(false);
        }
      });
    } else {
      if (!confirm(`¿Estás seguro de aplicar todos los cambios tipo ${type}?`)){
        this.isSyncing.set(false);
        return;
      } 
      this.scrapService.applyChanges(changesToApply, this.scrapId()).subscribe({
        next: (response) => {
          this.logger.info('Changes applied successfully with response: ' + JSON.stringify(response));
          changesToApply.forEach(c => c.saved = true);
          this.isSyncing.set(false);
        },
        error: (err) => {
          console.error('Error applying changes:', err);
          this.isSyncing.set(false);
        }
      });
    }

  }

  applySingle(change: ProductScrapSyncPendingChange) {
    if (!confirm(`¿Estás seguro de aplicar el cambio?`)) return;
    if (change.saved) return;
    this.logger.info(`Applying single change: ${JSON.stringify(change)}`);
    this.isSyncing.set(true);
    this.scrapService.applyChanges([change], this.scrapId()).subscribe({
      next: (response) => {
        this.logger.info('Changes applied successfully with response: ' + JSON.stringify(response));
        this.isSyncing.set(false);
        if(response.success){
          change.saved = true;
          this.scrapId.set(response.scrap_id);
        }
      },
      error: (err) => {
        console.error('Error applying single change:', err);
        this.isSyncing.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/scraps']);
  }
}
