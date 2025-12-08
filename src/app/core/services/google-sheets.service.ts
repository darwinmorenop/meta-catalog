import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import * as XLSX from 'xlsx';
import { MetaProduct, sanitizeMetaProduct } from '../models/meta-model';

@Injectable({
    providedIn: 'root'
})
export class GoogleSheetsService {

    private sheetId = '14j3x4aCuZ0VW2qPEY8z_0kWIVwwVY-KC';
    // Use 'export?format=xlsx' to download as Excel file
    private xlsxUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=xlsx`;

    constructor(private http: HttpClient) { }

    /**
     * Fetches the catalog from the public Google Sheets as an XLSX file.
     * Parses the binary data using XLSX (SheetJS) to ensure consistent behavior with ExcelManagerService.
     */
    getCatalog(): Observable<MetaProduct[]> {
        // Fetch as 'arraybuffer' to handle binary Excel data
        return this.http.get(this.xlsxUrl, { responseType: 'arraybuffer' }).pipe(
            map(buffer => {
                // Read the binary data
                const data = new Uint8Array(buffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Grab the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                // Using raw: false to ensure everything is treated as text (ids, prices)
                // NOT using range: 1 here because the public export usually starts at row 0. 
                // If the user's specific sheet has empty rows, we might need to adjust, 
                // but the CSV dump showed headers at line 0.
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: '',
                    range: 1
                });

                // Sanitize and enforce mandatory fields
                const res = (jsonData as Partial<MetaProduct>[]).map(item => sanitizeMetaProduct(item));
                console.log(`Input Google Sheets:${JSON.stringify(res)}`);
                return res;
            })
        );
    }
}
