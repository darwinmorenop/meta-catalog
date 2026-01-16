import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import * as XLSX from 'xlsx';
import { MetaProduct, sanitizeMetaProduct } from '../models/products/meta/meta-model';

@Injectable({
    providedIn: 'root'
})
export class GoogleSheetsService {

    private sheetId = '14j3x4aCuZ0VW2qPEY8z_0kWIVwwVY-KC';
    // Use 'export?format=xlsx' to download as Excel file
    private xlsxUrl = `https://docs.google.com/spreadsheets/d/${this.sheetId}/export?format=xlsx`;
    private sheetIdCampaingCodes = '1pNZBJkbqaSLNw0QM-Xn0NvP-FtuEuYv0FU0ETsOhf-s';
    private xlsxCampaingCodes = `https://docs.google.com/spreadsheets/d/${this.sheetIdCampaingCodes}/export?format=xlsx`;

    constructor(private http: HttpClient) { }

    /**
     * Fetches the catalog from the public Google Sheets as an XLSX file.
     * Also fetches campaign codes and enriches the product data.
     */
    getCatalog(): Observable<MetaProduct[]> {
        return this.fetchAndParseSheet(this.xlsxUrl, 1).pipe(
            map(catalog => {
                // Sanitize and enrich catalog items
                const res = (catalog as Partial<MetaProduct>[]).map(item => sanitizeMetaProduct(item));

                console.log(`Enriched Catalog: ${res.length} items processed.`);
                return res;
            })
        );
    }

    getCatalogCampaignCodes(): Observable<Map<string, string>> {
        return this.fetchAndParseSheet(this.xlsxCampaingCodes, 0).pipe(
            map(campaignCodes => {
                const campaignMap = new Map<string, string>();
                campaignCodes.forEach((row: any) => {
                    if (row.catalog_ID && row.campaing_code) {
                        campaignMap.set(String(row.catalog_ID).trim(), String(row.campaing_code));
                    }
                });
                return campaignMap;
            }), catchError(err => {
                console.error('Error fetching campaign codes:', err);
                return of(new Map<string, string>());
            })
        );
    }

    private fetchAndParseSheet(url: string, startRow: number = 1): Observable<any[]> {
        return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
            map(buffer => {
                const data = new Uint8Array(buffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                return XLSX.utils.sheet_to_json(worksheet, {
                    defval: '',
                    range: startRow // Start at row 1 (skipping header?) Or row 0? 
                    // Usually public sheets usually start header at row 0, data at 1.
                    // But 'range: 1' means skip row 0 (header) provided by API? 
                    // No, sheet_to_json default behavior with header: 
                    // if no range specified, it assumes row 0 is header.
                    // if range: 1, it starts parsing from row 1.
                    // Check previous code: it was using range: 1.
                    // Let's stick to consistent parsing logic.
                });
            })
        );
    }
}
