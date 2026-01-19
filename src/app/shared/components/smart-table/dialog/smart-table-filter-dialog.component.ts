import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { TableConfig, TableColumn } from 'src/app/shared/models/table-config';

export interface SmartTableFilterData {
  config: TableConfig;
  filterOptions: { [key: string]: string[] };
  currentFilters: { [key: string]: string[] };
}

@Component({
  selector: 'app-smart-table-filter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: 'smart-table-filter-dialog.component.html',
  styleUrl: 'smart-table-filter-dialog.component.scss'
})
export class SmartTableFilterDialogComponent {
  filters: { [key: string]: string[] } = {};
  filterableColumns: TableColumn[] = [];

  constructor(
    public dialogRef: MatDialogRef<SmartTableFilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SmartTableFilterData
  ) {
    // Clone current filters to avoid direct mutations
    this.filters = JSON.parse(JSON.stringify(data.currentFilters));
    this.filterableColumns = data.config.columns.filter(c => c.filterable);
    
    // Ensure all filterable columns have an array initialize if not present
    this.filterableColumns.forEach(col => {
      if (!this.filters[col.key]) {
        this.filters[col.key] = [];
      }
    });
  }

  onRemoveChip(columnKey: string, value: string): void {
    const index = this.filters[columnKey].indexOf(value);
    if (index >= 0) {
      this.filters[columnKey].splice(index, 1);
      // Trigger change detection by creating new array reference
      this.filters[columnKey] = [...this.filters[columnKey]];
    }
  }

  onClearColumn(columnKey: string): void {
    this.filters[columnKey] = [];
  }

  onClearAll(): void {
    Object.keys(this.filters).forEach(key => {
      this.filters[key] = [];
    });
  }

  onApply(): void {
    this.dialogRef.close(this.filters);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getLabel(col: TableColumn, value: string): string {
    if (col.type === 'boolean') {
      return value === 'true' ? 'SÍ' : 'NO';
    }
    return value;
  }
}
