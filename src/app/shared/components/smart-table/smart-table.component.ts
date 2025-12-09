import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, effect, signal, OnChanges, SimpleChanges, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TableConfig, TableColumn } from 'src/app/core/models/table-config';

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
        FormsModule
    ],
    templateUrl: './smart-table.component.html',
    styleUrls: ['./smart-table.component.scss']
})
export class SmartTableComponent implements AfterViewInit {
    @Input() data: any[] = [];
    @Input() config!: TableConfig;
    @Output() selectionChange = new EventEmitter<any>();

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = [];

    // Selection State
    selectedRow: any | null = null;

    // Filter Logic
    globalFilter = '';
    columnFilters: { [key: string]: string } = {};

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
            this.columnFilters[c.key] = '';
        });
    }

    updateFilterOptions() {
        if (!this.config || !this.data) return;

        this.config.columns.filter(c => c.filterable).forEach(col => {
            const values = new Set(this.data.map(p => String(p[col.key] || '')));
            const sortedValues = Array.from(values).sort();
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
                    String(data[field] || '').toLowerCase().includes(searchTerms.global.toLowerCase())
                );

            if (!globalMatch) return false;

            // 2. Column Filters
            for (const colKey in searchTerms.columns) {
                const filterValue = searchTerms.columns[colKey];
                if (filterValue) {
                    const dataValue = String(data[colKey] || '').toLowerCase();
                    if (dataValue !== filterValue.toLowerCase()) {
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

    selectRow(row: any) {
        if (this.selectedRow === row) {
            this.selectedRow = null;
        } else {
            this.selectedRow = row;
        }
        this.selectionChange.emit(this.selectedRow);
    }
}
