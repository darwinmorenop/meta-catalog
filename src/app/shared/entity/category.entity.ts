export interface CategoryEntity {
    id: number; // Coincide con BIGINT
    created_at: Date;
    updated_at: Date;
    name: string;
    slug: string; // SEO URL
    description: string;
    parent_id?: number; // Relación con el padre
}