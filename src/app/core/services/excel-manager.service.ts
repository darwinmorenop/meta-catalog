import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { MetaProduct, sanitizeMetaProduct, META_PRODUCT_HEADERS, MANDATORY_FIELDS } from 'src/app/core/models/products/meta/meta-model';

@Injectable({
  providedIn: 'root'
})
export class ExcelManagerService {

  constructor() {
  }

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

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            range: 1
          });
          const res = (jsonData as Partial<MetaProduct>[]).map(item => sanitizeMetaProduct(item));
          console.log(`Input file:${JSON.stringify(res)}`);
          resolve(res);
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
    // 1. Create custom header rows
    // Row 1: "mandatory" or "optional"
    const headerStatusRow = META_PRODUCT_HEADERS.map(header =>
      MANDATORY_FIELDS.includes(header) ? '#mandatory' : '#optional'
    );

    // Row 2: Field Names
    const headerNamesRow = META_PRODUCT_HEADERS;

    // 2. Create workbook and empty worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headerStatusRow, headerNamesRow]);

    // 3. Append data starting at A3
    XLSX.utils.sheet_add_json(worksheet, data, {
      header: META_PRODUCT_HEADERS,
      skipHeader: true, // We already added headers manually
      origin: 'A3'
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    console.log(`Output file:${JSON.stringify(workbook)}`);
    // 3. Escribir el archivo y forzar la descarga
    // Usamos write para obtener el buffer y crear nosotros el Blob y el link de descarga
    // Esto asegura que el nombre del archivo se respete mejor en algunos navegadores
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });

    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    console.log(`Output file saved as: ${fileName}`);
  }
}
