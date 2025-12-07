import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import {MetaProduct} from 'src/app/core/models/meta-model';

@Injectable({
  providedIn: 'root'
})
export class ExcelManagerService {

  constructor() { }

  /**
   * Lee un archivo Excel y devuelve una promesa con los datos en JSON
   */
  importExcel(file: File): Promise<MetaProduct[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Asumimos que los datos están en la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convertimos la hoja a JSON
          // defval: '' asegura que si una celda está vacía, no desaparezca la propiedad, sino que sea string vacío
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          resolve(jsonData as MetaProduct[]);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);

      // Leemos el archivo como ArrayBuffer (necesario para Excel)
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Genera un archivo Excel a partir de los datos y dispara la descarga
   */
  exportExcel(data: MetaProduct[], filename: string = 'updated_products.xlsx'): void {
    // 1. Crear una hoja de trabajo (Worksheet) desde el JSON
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Crear un libro de trabajo (Workbook) y añadir la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

    // 3. Escribir el archivo y forzar la descarga
    // SheetJS se encarga de crear el Blob y el link de descarga automáticamente con writeFile
    XLSX.writeFile(workbook, filename);
  }
}
