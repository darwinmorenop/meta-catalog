import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, effect, signal, OnChanges, SimpleChanges, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { TableConfig, TableColumn } from 'src/app/shared/models/table-config';
import { LoggerService } from 'src/app/core/services/logger/logger.service';
import { SmartTableFilterDialogComponent, SmartTableFilterData } from './dialog/smart-table-filter-dialog.component';

@Component({
    selector: 'app-smart-table',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        MatDialogModule,
        MatChipsModule
    ],
    templateUrl: 'smart-table.component.html',
    styleUrls: ['smart-table.component.scss']
})
export class SmartTableComponent implements AfterViewInit {
    @Input() data: any[] = [];
    @Input() config!: TableConfig;
    @Input() isLoading: boolean = false;
    @Output() selectionChange = new EventEmitter<any>();
    @Output() edit = new EventEmitter<any>();
    @Output() delete = new EventEmitter<any>();
    @Output() view = new EventEmitter<any>();

    private loggerService = inject(LoggerService)
    private dialog = inject(MatDialog);
    private readonly CLASS_NAME = SmartTableComponent.name

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = [];

    // Selection State
    selectedRow: any | null = null;

    // Filter Logic
    globalFilter = '';
    columnFilters: { [key: string]: string[] } = {};

    // Filter Options
    filterOptions: { [key: string]: string[] } = {};
    filteredFilterOptions: { [key: string]: string[] } = {};

    @ViewChild(MatPaginator) set paginator(pager: MatPaginator) {
        if (pager) {
            this.dataSource.paginator = pager;
        }
    }

    @ViewChild(MatSort) set sort(sorter: MatSort) {
        if (sorter) {
            this.dataSource.sort = sorter;
        }
    }

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && this.data) {
            this.dataSource.data = this.data;
            this.updateFilterOptions();
        }
        if (changes['config'] && this.config) {
            this.displayedColumns = this.config.columns.map(c => c.key);

            // Normalize Actions Config
            this.config.actions = {
                show: this.config.actions?.show ?? true,
                edit: this.config.actions?.edit ?? true,
                editIcon: this.config.actions?.editIcon ?? 'edit',
                delete: this.config.actions?.delete ?? true,
                deleteIcon: this.config.actions?.deleteIcon ?? 'delete',
                view: this.config.actions?.view ?? false,
                viewIcon: this.config.actions?.viewIcon ?? 'visibility'
            };

            if (this.config.actions.show) {
                this.displayedColumns.push('actions');
            }

            this.initFilters();
            this.setupFilterPredicate();
        }
    }

    ngAfterViewInit() {
        // ViewChildren handled by setters
    }

    initFilters() {
        this.columnFilters = {};
        this.config.columns.filter(c => c.filterable).forEach(c => {
            this.columnFilters[c.key] = [];
        });
    }

    updateFilterOptions() {
        if (!this.config || !this.data) return;

        this.config.columns.filter(c => c.filterable).forEach(col => {
            let values: Set<string>;
            if (col.type === 'boolean') {
                // Para booleanos aseguramos siempre SI (true) y NO (false)
                values = new Set(['true', 'false']);
            } else {
                values = new Set(this.data.map(p => {
                    const rawValue = p[col.key];
                    if (rawValue && typeof rawValue === 'object' && 'value' in rawValue) {
                        return String(rawValue.value ?? '');
                    }
                    return String(rawValue ?? '');
                }));
            }
            const sortedValues = Array.from(values).sort((a, b) => b.localeCompare(a));
            this.filterOptions[col.key] = sortedValues;
            this.filteredFilterOptions[col.key] = sortedValues;
        });
    }

    filterOptionsList(columnKey: string, event: Event) {
        const value = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredFilterOptions[columnKey] = this.filterOptions[columnKey].filter(
            option => option.toLowerCase().includes(value)
        );
    }

    setupFilterPredicate() {
        this.dataSource.filterPredicate = (data: any, filter: string) => {
            const searchTerms = JSON.parse(filter);

            // 1. Global Search
            const globalMatch = !searchTerms.global ||
                this.config.searchableFields.some(field =>
                    String(data[field] ?? '').toLowerCase().includes(searchTerms.global.toLowerCase())
                );

            if (!globalMatch) return false;

            // 2. Column Filters (Multi-select support)
            for (const colKey in searchTerms.columns) {
                const filterValues = searchTerms.columns[colKey] as string[];
                if (filterValues && filterValues.length > 0) {
                    const rawValue = data[colKey];
                    let dataValue = '';
                    if (rawValue && typeof rawValue === 'object' && 'value' in rawValue) {
                        dataValue = String(rawValue.value ?? '');
                    } else {
                        dataValue = String(rawValue ?? '');
                    }
                    
                    // Check if any of the selected values match
                    const match = filterValues.some(v => v.toLowerCase() === dataValue.toLowerCase());
                    if (!match) {
                        return false;
                    }
                }
            }

            return true;
        };
    }

    applyFilters() {
        const filterValue = {
            global: this.globalFilter,
            columns: this.columnFilters
        };
        this.dataSource.filter = JSON.stringify(filterValue);

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    get searchablePlaceholder(): string {
        const context = 'searchablePlaceholder';
        if (!this.config?.searchableFields?.length) return 'Buscar...';
        
        const headers = this.config.searchableFields
            .map(field => {
                const col = this.config.columns.find(c => c.key === field);
                if(col){
                    return col.header;
                }
                this.loggerService.trace(`Column ${field} not found in config`, this.CLASS_NAME, context);
                return field;
            });

        let joinedHeaders = '';
        if (headers.length <= 1) {
            joinedHeaders = headers[0] || '';
        } else {
            const lastHeader = headers.pop();
            joinedHeaders = `${headers.join(', ')} y ${lastHeader}`;
        }
        
        return `Buscar por: ${joinedHeaders}.`;
    }

    selectRow(row: any) {
        const context = 'selectRow'
        if (this.selectedRow === row) {
            this.selectedRow = null;
        } else {
            this.selectedRow = row;
        }
        this.loggerService.debug(`Selected Row: ${JSON.stringify(this.selectedRow)}`, this.CLASS_NAME, context);
        this.selectionChange.emit(this.selectedRow);
    }

    openFilterDialog(): void {
        const dialogRef = this.dialog.open(SmartTableFilterDialogComponent, {
            width: '600px',
            data: {
                config: this.config,
                filterOptions: this.filterOptions,
                currentFilters: this.columnFilters
            } as SmartTableFilterData
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.columnFilters = result;
                this.applyFilters();
            }
        });
    }

    removeFilter(columnKey: string, value: string): void {
        const index = this.columnFilters[columnKey].indexOf(value);
        if (index >= 0) {
            this.columnFilters[columnKey].splice(index, 1);
            this.columnFilters[columnKey] = [...this.columnFilters[columnKey]];
            this.applyFilters();
        }
    }

    hasActiveFilters(): boolean {
        return Object.values(this.columnFilters).some(f => f.length > 0);
    }

    getActiveFilterCount(): number {
        return Object.values(this.columnFilters).reduce((acc, curr) => acc + curr.length, 0);
    }

    getColumnHeader(key: string): string {
        return this.config.columns.find(c => c.key === key)?.header || key;
    }

    getLabel(key: string, val: string): string {
        const col = this.config.columns.find(c => c.key === key);
        if (col?.type === 'boolean') {
            return val === 'true' ? 'SÍ' : 'NO';
        }
        return val;
    }

    getBadgeInfo(val: any): { label: string, color?: string } {
        if (val && typeof val === 'object' && 'value' in val) {
            return {
                label: val.value,
                color: val.color
            };
        }
        return {
            label: String(val ?? '')
        };
    }
}
