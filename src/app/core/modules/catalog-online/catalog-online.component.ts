import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExcelManagerService } from 'src/app/core/services/excel-manager.service';
import { GoogleSheetsService } from 'src/app/core/services/google-sheets.service';
import { CatalogSyncService } from 'src/app/core/services/catalog-sync.service';
import { MetaProduct, ChangeRecord } from 'src/app/core/models/meta-model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { ChangesDialogComponent } from '../changes-dialog/changes-dialog.component';

@Component({
    selector: 'app-catalog-online',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
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

    ngOnInit() {
        // Cargar desde Google Sheets al iniciar
        this.loadFromGoogleSheets();
    }

    loadFromGoogleSheets() {
        this.isLoading.set(true);
        this.fileName.set('Google Sheets Catalog');
        this.googleSheetsService.getCatalog().subscribe({
            next: (data) => {
                this.products.set(data);
                console.log('Catálogo cargado desde Google Sheets:', data);

                // Sincronizar con backend una vez cargado
                this.syncWithBackend(data);
            },
            error: (err) => {
                console.error('Error cargando desde Google Sheets', err);
                this.isLoading.set(false);
            }
        });
    }

    syncWithBackend(currentCatalog: MetaProduct[]) {
        console.log('Iniciando sincronización con backend...');
        this.catalogSyncService.syncCatalog(currentCatalog).subscribe({
            next: (result) => {
                this.products.set(result.updatedCatalog);
                this.changes.set(result.changes);
                console.log('Sincronización completada. Cambios:', result.changes);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error sincronizando con backend', err);
                this.isLoading.set(false);
                // Si falla el backend, nos quedamos con los datos de Google Sheets
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

    // 1. IMPORTAR: Al seleccionar el archivo
    async onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.isLoading.set(true);
            this.fileName.set(file.name);

            try {
                const data = await this.excelManagerService.importExcel(file);
                this.products.set(data);
                // Opcional: sincronizar también si cargan archivo manual?
                this.syncWithBackend(data);
            } catch (err) {
                console.error('Error leyendo archivo', err);
            } finally {
                this.isLoading.set(false);
            }
        }
    }

    // 2. PROCESAR: Ejemplo de lógica de negocio (Ahora abre diálogo CRUD)
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
            data: { product: { ...product } } // Copia para no mutar directamente
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


    // 3. EXPORTAR: Descargar el resultado
    exportData() {
        const data = this.products();
        if (data.length > 0) {
            this.excelManagerService.exportExcel(data, `export_${new Date().getTime()}.xlsx`);
        }
    }
}
