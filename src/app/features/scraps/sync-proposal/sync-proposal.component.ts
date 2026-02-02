import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/shared/models/table-config';
import { ProductScrapSyncPendingChange, ProductScrapSyncOptions, ScrapCategory } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ScrapEntity } from 'src/app/shared/entity/scrap.entity';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ScrapChangeDetailDialogComponent } from './components/scrap-change-detail-dialog/scrap-change-detail-dialog.component';
import { ScrapRcpResponseEntity } from 'src/app/shared/entity/rcp/scrap.rcp.entity';
import { ScrapRemoteService } from 'src/app/core/services/scrap/scrap.remote.service';

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
    MatDialogModule,
    RouterModule
  ],
  templateUrl: 'sync-proposal.component.html',
  styleUrls: ['sync-proposal.component.scss']
})
export class SyncProposalComponent implements OnInit {
  private scrapService = inject(ScrapService);
  private scrapRemoteService = inject(ScrapRemoteService);
  private logger = inject(LoggerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  // Options
  syncOptions: ProductScrapSyncOptions = {
    syncStatus: true,
    syncPrices: false,
    syncStock: false,
    syncDetails: false,
    syncProperties: false,
    categories: []
  };

  availableCategories = Object.values(ScrapCategory);

  isSyncing = signal<boolean>(false);
  showProposal = signal<boolean>(false);
  scrapId = signal<number>(-1);

  // Added signals
  scrapTotalSize = signal<number>(-1);
  scrapInfo = signal<ScrapEntity | null>(null);

  private readonly CLASS_NAME = SyncProposalComponent.name;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.scrapId.set(Number(id));
      this.loadScrapInfo();
    }
  }

  loadScrapInfo() {
    if (this.scrapId() !== -1) {
      this.scrapService.getById(this.scrapId()).subscribe(info => {
        this.scrapInfo.set(info);
      });
    }
  }

  // Proposal State
  createChanges = signal<ProductScrapSyncPendingChange[]>([]);
  updateChanges = signal<ProductScrapSyncPendingChange[]>([]);
  archiveChanges = signal<ProductScrapSyncPendingChange[]>([]);

  // Computed counts for UI
  createPendingCount = computed(() => this.createChanges().filter(c => !c.saved).length);
  updatePendingCount = computed(() => this.updateChanges().filter(c => !c.saved).length);
  archivePendingCount = computed(() => this.archiveChanges().filter(c => !c.saved).length);

  proposalTableConfig: TableConfig = {
    columns: [
      { key: 'manufacturer_ref', header: 'Referencia', filterable: true },
      { key: 'product_name', header: 'Nombre', filterable: true },
      { key: 'saved', header: 'Aplicado', filterable: true }
    ],
    searchableFields: ['manufacturer_ref', 'product_name'],
    pageSizeOptions: [5, 10, 20],
    actions: { show: true, view: true, edit: true, editIcon: 'save', delete: false }
  };

  loadProposal() {
    const context = 'loadProposal';
    if (this.createChanges().length > 0 || this.updateChanges().length > 0 || this.archiveChanges().length > 0) {
      if (!confirm(`¿Estás seguro de cargar datos remotos? Se pueden perder cambios locales.`)) {
        this.isSyncing.set(false);
        return;
      };
    }
    this.isSyncing.set(true);
    this.scrapRemoteService.getChanges(this.syncOptions).subscribe({
      next: (response) => {
        this.scrapId.set(-1);
        this.scrapTotalSize.set(response.scrapSize);
        this.createChanges.set(response.changes.filter(c => c.type === 'CREATE'));
        this.updateChanges.set(response.changes.filter(c => c.type === 'UPDATE'));
        this.archiveChanges.set(response.changes.filter(c => c.type === 'ARCHIVE'));
        this.createChanges.update(v => [...v]);
        this.updateChanges.update(v => [...v]);
        this.archiveChanges.update(v => [...v]);
        this.showProposal.set(true);
        this.isSyncing.set(false);
      },
      error: (err) => {
        this.logger.error('Error loading proposal:', err, this.CLASS_NAME, context);
        this.isSyncing.set(false);
      }
    });
  }

  applyAll(type: 'CREATE' | 'UPDATE' | 'ARCHIVE' | 'ALL') {
    const context = 'applyAll';
    let changesToApply: ProductScrapSyncPendingChange[] = [];
    if (type === 'CREATE') changesToApply = this.createChanges().filter(c => !c.saved);
    else if (type === 'UPDATE') changesToApply = this.updateChanges().filter(c => !c.saved);
    else if (type === 'ARCHIVE') changesToApply = this.archiveChanges().filter(c => !c.saved);
    else changesToApply = [...this.createChanges().filter(c => !c.saved), ...this.updateChanges().filter(c => !c.saved), ...this.archiveChanges().filter(c => !c.saved)];

    if (changesToApply.length === 0) return;

    this.isSyncing.set(true);
    if (type === 'ALL') {
      if (!confirm(`¿Estás seguro de aplicar todos los cambios?`)) {
        this.isSyncing.set(false);
        return;
      }
      this.scrapService.applyChangesAll(changesToApply, this.scrapId(), this.syncOptions).subscribe({
        next: (response: ScrapRcpResponseEntity) => {
          if (!response.success) {
            this.logger.error('Error applying changes: ' + JSON.stringify(response), this.CLASS_NAME, context);
            this.isSyncing.set(false);
            return;
          }
          this.logger.info('Changes applied successfully with response: ' + JSON.stringify(response), this.CLASS_NAME, context);
          this.scrapId.set(response.scrap_id);
          this.loadScrapInfo();
          changesToApply.forEach(c => c.saved = true);
          // Trigger signal updates to refresh computed counts
          this.createChanges.update(v => [...v]);
          this.updateChanges.update(v => [...v]);
          this.archiveChanges.update(v => [...v]);
          this.isSyncing.set(false);
        },
        error: (err) => {
          this.logger.error('Error applying changes:', err, this.CLASS_NAME, context);
          this.isSyncing.set(false);
        }
      });
    } else {
      if (!confirm(`¿Estás seguro de aplicar todos los cambios tipo ${type}?`)) {
        this.isSyncing.set(false);
        return;
      }
      this.scrapService.applyChanges(changesToApply, this.scrapId(), this.syncOptions).subscribe({
        next: (response: ScrapRcpResponseEntity) => {
          if (!response.success) {
            this.logger.error('Error applying changes: ' + JSON.stringify(response), this.CLASS_NAME, context);
            this.isSyncing.set(false);
            return;
          }
          this.logger.info('Changes applied successfully with response: ' + JSON.stringify(response), this.CLASS_NAME, context);
          changesToApply.forEach(c => c.saved = true);
          this.scrapId.set(response.scrap_id);
          this.loadScrapInfo();
          // Trigger signal updates to refresh computed counts
          this.createChanges.update(v => [...v]);
          this.updateChanges.update(v => [...v]);
          this.archiveChanges.update(v => [...v]);
          this.isSyncing.set(false);
        },
        error: (err) => {
          this.logger.error('Error applying changes:', err, this.CLASS_NAME, context);
          this.isSyncing.set(false);
        }
      });
    }

  }

  applySingle(change: ProductScrapSyncPendingChange) {
    const context = 'applySingle';
    if (change.saved) return;
    if (!confirm(`¿Estás seguro de aplicar el cambio?`)) return;
    this.logger.info(`Applying single change: ${JSON.stringify(change)}`, this.CLASS_NAME, context);
    this.isSyncing.set(true);
    this.scrapService.applyChanges([change], this.scrapId(), this.syncOptions).subscribe({
      next: (response: ScrapRcpResponseEntity) => {
        if (!response.success) {
          this.logger.error('Error applying changes: ' + JSON.stringify(response), this.CLASS_NAME, context);
          this.isSyncing.set(false);
          return;
        }
        this.logger.info('Changes applied successfully with response: ' + JSON.stringify(response), this.CLASS_NAME, context);
        this.isSyncing.set(false);
        if (response.success) {
          change.saved = true;
          // Trigger signal updates based on change type
          if (change.type === 'CREATE') this.createChanges.update(v => [...v]);
          else if (change.type === 'UPDATE') this.updateChanges.update(v => [...v]);
          else if (change.type === 'ARCHIVE') this.archiveChanges.update(v => [...v]);

          this.scrapId.set(response.scrap_id);
          this.loadScrapInfo();
        }
      },
      error: (err) => {
        this.logger.error('Error applying single change:', err, this.CLASS_NAME, context);
        this.isSyncing.set(false);
      }
    });
  }

  onViewDetail(change: ProductScrapSyncPendingChange) {
    this.dialog.open(ScrapChangeDetailDialogComponent, {
      width: '500px',
      data: change
    });
  }

  onCategoryToggle(category: ScrapCategory, checked: boolean) {
    const currentCategories = this.syncOptions.categories || [];
    if (checked) {
      this.syncOptions.categories = [...currentCategories, category];
    } else {
      this.syncOptions.categories = currentCategories.filter(c => c !== category);
    }
  }

  isCategorySelected(category: ScrapCategory): boolean {
    return this.syncOptions.categories?.includes(category) || false;
  }

  goBack() {
    this.router.navigate(['/scraps']);
  }
}
