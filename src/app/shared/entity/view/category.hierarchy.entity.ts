import { CategoryEntity } from "src/app/shared/entity/category.entity";

export interface CategoryHierarchyEntity extends CategoryEntity {
    full_path?: string;
    level?: number;
}