export enum Resource {
  users = 'users',
  products = 'products',
  settings = 'settings'
}

export const labelResource = {
  [Resource.users]: 'Usuarios',
  [Resource.products]: 'Productos',
  [Resource.settings]: 'Configuraciones'
}

export enum Action {
  view = 'view',
  create = 'create',
  edit = 'edit',
  delete = 'delete',
  admin = 'admin'
}

export const labelAction = {
  [Action.view]: 'Ver',
  [Action.create]: 'Crear',
  [Action.edit]: 'Editar',
  [Action.delete]: 'Eliminar',
  [Action.admin]: 'Administrar'
}

export type PermissionMap = {
  [key in Resource]?: Action[];
};

export interface UserProfile {
  id: string;              
  name: string;
  description: string | null;
  permissions: PermissionMap;
  created_at: Date;      
  updated_at: Date;
}