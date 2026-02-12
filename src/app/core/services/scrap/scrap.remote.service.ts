import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of, switchMap } from 'rxjs';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { ProductScrapSyncOptions, ProductScrapSyncPendingChange } from 'src/app/core/models/products/scrap/product.scrap.sync.model';
import { ScrapService } from 'src/app/core/services/scrap/scrap.service';
import { ProductScrap } from 'src/app/core/models/products/scrap/product.scrap.model';
import { ProductScrapEntity } from 'src/app/shared/entity/view/product.scrap.entity';
import { ScrapRcpResponseEntity } from 'src/app/shared/entity/rcp/scrap.rcp.entity';

@Injectable({
    providedIn: 'root'
})
export class ScrapRemoteService {

    private baseUrl = 'http://localhost:8000/api/scrap';
    private http: HttpClient = inject(HttpClient);
    private loggerService: LoggerService = inject(LoggerService);
    private readonly CLASS_NAME = ScrapRemoteService.name;

    getChanges(options: ProductScrapSyncOptions): Observable<{ changes: ProductScrapSyncPendingChange[], scrapSize: number }> {
        const context = 'getChanges';
        this.loggerService.debug(`Starting with options: ${JSON.stringify(options)}`, this.CLASS_NAME, context);
        return this.http.post<{ changes: ProductScrapSyncPendingChange[], scrapSize: number }>(
            `${this.baseUrl}/changes`, { options: options, limit: 5, include_raw: false });
    }

    applyChanges(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<any> {
        if (changes.length === 0) return of(null);
        const context = 'applyChanges';
        this.loggerService.debug(`Starting with changes: ${JSON.stringify(changes)}`, this.CLASS_NAME, context);
        return this.http.post<{ changes: ProductScrapSyncPendingChange[], scrapSize: number, summary:any,executionTime: string }>(
            `${this.baseUrl}/apply`, { options: options, limit: 5, scrap_id: scrapId ,changes:changes});
    }

    applyChangesAll(changes: ProductScrapSyncPendingChange[], scrapId: number, options: ProductScrapSyncOptions): Observable<any> {
        if (changes.length === 0) return of(null);
        const context = 'applyChangesAll';
        this.loggerService.debug(`Starting with changes: ${JSON.stringify(changes)}`, this.CLASS_NAME, context);
        return this.http.post<{ changes: ProductScrapSyncPendingChange[], scrapSize: number, summary:any,executionTime: string }>(
            `${this.baseUrl}/apply-all`, { options: options, limit: 5, scrap_id: scrapId ,changes:changes});
    }
}