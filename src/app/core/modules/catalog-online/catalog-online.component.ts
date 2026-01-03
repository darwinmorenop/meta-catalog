import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ExcelManagerService } from 'src/app/core/services/excel-manager.service';
import { GoogleSheetsService } from 'src/app/core/services/google-sheets.service';
import { CatalogSyncService } from 'src/app/core/services/catalog-sync.service';
import { MetaProduct, ChangeRecord } from 'src/app/core/models/meta-model';
import { ProductDialogComponent } from 'src/app/core/modules/product-dialog/product-dialog.component';
import { ChangesDialogComponent } from 'src/app/shared/components/changes-dialog/changes-dialog.component';
import { FileImportDialogComponent } from 'src/app/shared/components/file-import-dialog/file-import-dialog.component';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/core/models/table-config';

interface MetaProductUI extends MetaProduct {
    syncState?: 'new' | 'changed' | 'updated' | 'archived' | string;
}

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-catalog-online',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        SmartTableComponent,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        RouterModule
    ],
    templateUrl: './catalog-online.component.html',
    styleUrls: ['./catalog-online.component.scss']
})
export class CatalogOnlineComponent implements OnInit {
    private excelManagerService = inject(ExcelManagerService);
    private googleSheetsService = inject(GoogleSheetsService);
    private catalogSyncService = inject(CatalogSyncService);
    private dialog = inject(MatDialog);
    private http = inject(HttpClient);

    // Estados usando Signals
    products = signal<MetaProductUI[]>([]);
    changes = signal<ChangeRecord[]>([]);
    fileName = signal<string>('');
    isLoading = signal<boolean>(false);
    selectedProduct = signal<MetaProductUI | null>(null);

    // Table Configuration
    tableConfig: TableConfig = {
        columns: [
            { key: 'productCommercialCode', header: 'productCommercialCode', filterable: true },
            { key: 'remoteCode', header: 'remoteCode', filterable: true },
            { key: 'title', header: 'Título', filterable: true },
            { key: 'sale_price', header: 'Precio de venta', filterable: true, type: 'currency' },
            { key: 'price', header: 'Precio original', filterable: true, type: 'currency' },
            { key: 'availability', header: 'Disponibilidad', filterable: true, type: 'badge' },
            { key: 'syncState', header: 'Estado Sync', filterable: true, type: 'badge' } // New column
        ],
        searchableFields: ['title'],
        pageSizeOptions: [10, 20, 50, 100]
    };

    constructor() {
    }

    ngOnInit() {
        this.loadFromGoogleSheets();
    }


    loadFromGoogleSheets() {
        this.isLoading.set(true);
        this.fileName.set('Google Sheets Catalog');
        this.googleSheetsService.getCatalog().subscribe({
            next: (data) => {
                const sortedProducts = this.sortProducts(data as MetaProductUI[]).map(p => ({ ...p, syncState: 'updated' }));
                this.products.set(sortedProducts);
                console.log('Catálogo cargado desde Google Sheets:', data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error cargando desde Google Sheets', err);
                this.isLoading.set(false);
            }
        });
    }

    syncWithBackend() {
        console.log('Iniciando sincronización con backend...');
        this.isLoading.set(true); // Disable button
        this.catalogSyncService.syncCatalog(this.products()).subscribe({
            next: (result) => {
                // Initialize all as 'updated' (previously unchanged)
                const updated: MetaProductUI[] = result.updatedCatalog.map(p => ({ ...p, syncState: 'updated' }));

                // Mark changes
                const changeMap = new Map<string, string>(); // id -> type
                result.changes.forEach(c => {
                    // Map 'UPDATE' to 'changed' for UI
                    changeMap.set(c.product.id, c.type === 'NEW' ? 'new' : 'changed');
                });

                updated.forEach(p => {
                    if (changeMap.has(p.id)) {
                        p.syncState = changeMap.get(p.id);
                    }
                    if (p.status === 'archived') {
                        p.syncState = 'changed';
                    }
                });

                this.products.set(this.sortProducts(updated));
                this.changes.set(result.changes);
                console.log('Sincronización completada. Cambios:', result.changes);
                this.isLoading.set(false); // Re-enable button
            },
            error: (err) => {
                console.error('Error sincronizando con backend', err);
                this.isLoading.set(false); // Re-enable button on error
            }
        });
    }

    viewChanges() {
        this.dialog.open(ChangesDialogComponent, {
            width: '600px',
            data: { changes: this.changes() }
        });
    }

    openImportDialog() {
        const dialogRef = this.dialog.open(FileImportDialogComponent, {
            width: '600px',
            disableClose: true
        });
        dialogRef.componentInstance.accept = '.xlsx';
        dialogRef.componentInstance.title = 'Importar Catálogo Excel';

        dialogRef.afterClosed().subscribe(async (file: File | undefined) => {
            if (file) {
                this.isLoading.set(true);
                this.fileName.set(file.name);

                try {
                    const data = await this.excelManagerService.importExcel(file);
                    const sortedData = this.sortProducts(data as MetaProductUI[]).map(p => ({ ...p, syncState: 'updated' }));
                    this.products.set(sortedData);
                } catch (err) {
                    console.error('Error leyendo archivo', err);
                } finally {
                    this.isLoading.set(false);
                }
            }
        });
    }

    addProduct() {
        const dialogRef = this.dialog.open(ProductDialogComponent, {
            width: '800px',
            disableClose: true,
            data: { product: null }
        });

        dialogRef.afterClosed().subscribe((result: MetaProductUI | undefined) => {
            if (result) {
                result.status = 'new';
                result.syncState = 'new';
                this.products.update(products => this.sortProducts([...products, result]));
            }
        });
    }

    editProduct(product: MetaProductUI) {
        const dialogRef = this.dialog.open(ProductDialogComponent, {
            width: '800px',
            disableClose: true,
            data: { product: { ...product } }
        });

        dialogRef.afterClosed().subscribe((result: MetaProductUI | undefined) => {
            if (result) {
                result.status = 'updated';
                result.syncState = 'changed';
                this.products.update(products =>
                    this.sortProducts(products.map(p => {
                        if (p.id === product.id) {
                            return result as MetaProductUI;
                        }
                        return p;
                    }))
                );
            }
        });
    }

    deleteProduct(product: MetaProductUI) {
        if (confirm(`¿Estás seguro de eliminar el producto ${product.title}?`)) {
            product.status = 'archived';
            product.syncState = 'changed';
            this.products.update(products => this.sortProducts(products.map(p => p.id === product.id ? product : p)));
        }
    }

    exportData() {
        const data = this.products();
        if (data.length > 0) {
            this.excelManagerService.exportExcel(data, `export_${new Date().getTime()}.xlsx`);
        }
    }

    clearData() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.')) {
            this.products.set([]);
            this.changes.set([]);
            this.fileName.set('');
        }
    }

    private sortProducts(products: MetaProductUI[]): MetaProductUI[] {
        return [...products].sort((a, b) => {
            const titleA = (a.title || '').trim().toLowerCase();
            const titleB = (b.title || '').trim().toLowerCase();
            const titleCompare = titleA.localeCompare(titleB);

            if (titleCompare !== 0) return titleCompare;

            // Secondary sort by syncState (handling undefined)
            // Priority: new > changed > updated > archived > undefined
            const stateA = a.syncState || '';
            const stateB = b.syncState || '';

            // Custom priority map if simple alphabetical isn't enough
            // new (n) < changed (c) < updated (u) < archived (a)
            // alphabetical works well enough: archived < changed < new < updated. 
            // We want new first, then changed, then updated.
            // Let's use a explicit map for better control
            const priority: { [key: string]: number } = { 'new': 0, 'changed': 1, 'updated': 2, 'archived': 3 };
            const pA = priority[stateA] ?? 99;
            const pB = priority[stateB] ?? 99;

            return pA - pB;
        });
    }
}
