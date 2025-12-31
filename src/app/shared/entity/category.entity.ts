export interface CategoryEntity {
    id: number; // Coincide con BIGINT
    created_at: Date;
    updated_at: Date;
    name: string;
    slug: string;
    description: string;
    parent_id?: number; // Relación con el padre
    children?: CategoryEntity[]; // Campo virtual para el árbol
}