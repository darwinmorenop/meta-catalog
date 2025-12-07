import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExcelManagerService} from 'src/app/core/services/excel-manager.service';
import {MetaProduct} from 'src/app/core/models/meta-model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  private excelManagerService = inject(ExcelManagerService);

  // Estados usando Signals
  products = signal<MetaProduct[]>([]);
  fileName = signal<string>('');
  isLoading = signal<boolean>(false);

  // 1. IMPORTAR: Al seleccionar el archivo
  async onFileSelected(event: any) {
    const file = event.target.files[0];
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
  }

  // 2. PROCESAR: Ejemplo de lógica de negocio
  applyBusinessLogic() {
    this.products.update(currentProducts => {
      return currentProducts.map(p => {
        // Ejemplo: Si el stock es 0, cambiar disponibilidad a 'out of stock'
        // O subir el precio un 10% (requiere parsing de string "10,00 USD")

        const updatedProduct = { ...p };

        // Lógica simple: Marcar todos como 'updated' en la descripción
        if (!updatedProduct.description.includes('[UPDATED]')) {
          updatedProduct.description = `[UPDATED] ${updatedProduct.description}`;
        }

        // Lógica condicional basada en columnas del base
        if (updatedProduct.availability === 'in stock') {
          // Simular una operación de actualización de inventario
          updatedProduct.quantity_to_sell_on_facebook = 100;
        }

        return updatedProduct;
      });
    });
    alert('Datos procesados correctamente.');
  }

  // 3. EXPORTAR: Descargar el resultado
  exportData() {
    const data = this.products();
    if (data.length > 0) {
      this.excelManagerService.exportExcel(data, `export_${new Date().getTime()}.xlsx`);
    }
  }
}
