export interface CategoryModel {
  id: number;
  name: string;
  parentId: number | null;
  fullPath: string;
  level: number;
  // Propiedades exclusivas de UI
  isExpanded?: boolean;
  loading?: boolean;
}