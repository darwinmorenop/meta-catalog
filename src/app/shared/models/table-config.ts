export interface TableColumn {
    key: string;       // Property name (e.g., 'price')
    header: string;    // Display name (e.g., 'Precio')
    type?: 'text' | 'currency' | 'badge' | 'date' | 'datetime' | 'config' | 'image' | 'boolean' | 'chips'; // For formatting
    filterable?: boolean; // Show column filter?
}

export interface TableActionsConfig {
    show?: boolean;         // Default: true
    edit?: boolean;         // Default: true
    editIcon?: string;      // Default: 'edit'
    delete?: boolean;       // Default: true
    deleteIcon?: string;    // Default: 'delete'
    view?: boolean;         // Default: false
    viewIcon?: string;      // Default: 'visibility'
}

export interface TableConfig {
    columns: TableColumn[];
    searchableFields: string[]; // Fields for global search
    pageSizeOptions: number[];
    actions?: TableActionsConfig;
}
