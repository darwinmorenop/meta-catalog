import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { ExcelManagerService } from 'src/app/core/services/excel-manager.service';
import { GoogleSheetsService } from 'src/app/core/services/google-sheets.service';
import { CatalogSyncService } from 'src/app/core/services/catalog-sync.service';
import { MetaProduct, ChangeRecord } from 'src/app/core/models/meta-model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { ChangesDialogComponent } from '../changes-dialog/changes-dialog.component';
import { ImportExcelDialogComponent } from '../import-excel-dialog/import-excel-dialog.component';
import { SmartTableComponent } from 'src/app/shared/components/smart-table/smart-table.component';
import { TableConfig } from 'src/app/core/models/table-config';

@Component({
    selector: 'app-catalog-online',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        SmartTableComponent
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
    products = signal<MetaProduct[]>([]);
    changes = signal<ChangeRecord[]>([]);
    fileName = signal<string>('');
    isLoading = signal<boolean>(false);
    selectedProduct = signal<MetaProduct | null>(null);

    // Table Configuration
    tableConfig: TableConfig = {
        columns: [
            { key: 'productCommercialCode', header: 'productCommercialCode', filterable: true },
            { key: 'remoteCode', header: 'remoteCode', filterable: true },
            { key: 'title', header: 'Título', filterable: true },
            { key: 'sale_price', header: 'Precio de venta', filterable: true, type: 'currency' },
            { key: 'price', header: 'Precio original', filterable: true, type: 'currency' },
            { key: 'availability', header: 'Disponibilidad', filterable: true, type: 'badge' },
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
                this.products.set(data);
                console.log('Catálogo cargado desde Google Sheets:', data);
            },
            error: (err) => {
                console.error('Error cargando desde Google Sheets', err);
                this.isLoading.set(false);
            }
        });
    }

    syncWithBackend() {
        console.log('Iniciando sincronización con backend...');
        this.catalogSyncService.syncCatalog(this.products()).subscribe({
            next: (result) => {
                this.products.set(result.updatedCatalog);
                this.changes.set(result.changes);
                console.log('Sincronización completada. Cambios:', result.changes);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error sincronizando con backend', err);
                this.isLoading.set(false);
            }
        });
    }

    viewChanges() {
        this.dialog.open(ChangesDialogComponent, {
            width: '600px',
            data: { changes: this.changes() }
        });
    }

    loadDefaultFile() {
        this.isLoading.set(true);
        this.http.get('example.xlsx', { responseType: 'blob' }).subscribe({
            next: async (blob) => {
                const file = new File([blob], 'example.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                this.fileName.set(file.name);
                try {
                    const data = await this.excelManagerService.importExcel(file);
                    this.products.set(data);
                } catch (err) {
                    console.error('Error importando archivo por defecto', err);
                } finally {
                    this.isLoading.set(false);
                }
            },
            error: (err) => {
                console.error('No se pudo cargar el archivo ejemplo por defecto', err);
                this.isLoading.set(false);
            }
        });
    }

    openImportDialog() {
        const dialogRef = this.dialog.open(ImportExcelDialogComponent, {
            width: '600px',
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(async (file: File | undefined) => {
            if (file) {
                this.isLoading.set(true);
                this.fileName.set(file.name);

                try {
                    const data = await this.excelManagerService.importExcel(file);
                    this.products.set(data);
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

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.products.update(products => [...products, result]);
            }
        });
    }

    editProduct(product: MetaProduct) {
        const dialogRef = this.dialog.open(ProductDialogComponent, {
            width: '800px',
            disableClose: true,
            data: { product: { ...product } }
        });

        dialogRef.afterClosed().subscribe((result: MetaProduct | undefined) => {
            if (result) {
                this.products.update(products =>
                    products.map(p => p.id === product.id ? result : p)
                );
            }
        });
    }

    deleteProduct(product: MetaProduct) {
        if (confirm(`¿Estás seguro de eliminar el producto ${product.title}?`)) {
            this.products.update(products => products.filter(p => p.id !== product.id));
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
}
