export interface TableColumn {
    key: string;       // Property name (e.g., 'price')
    header: string;    // Display name (e.g., 'Precio')
    type?: 'text' | 'currency' | 'badge'; // For formatting
    filterable?: boolean; // Show column filter?
}

export interface TableConfig {
    columns: TableColumn[];
    searchableFields: string[]; // Fields for global search
    pageSizeOptions: number[];
}
