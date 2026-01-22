export enum Resource {
  dashboard = 'dashboard',
  store = 'store',
  cart = 'cart',
  inventory_inbound = 'inventory_inbound',
  categories = 'categories',
  products = 'products',
  campaigns = 'campaigns',
  scraps = 'scraps',
  users = 'users',
  inventory_stock = 'inventory_stock',
  inventory_movements = 'inventory_movements',
  sales = 'sales',
  settings = 'settings'
}

export const labelResource = {
  [Resource.dashboard]: 'Dashboard',
  [Resource.store]: 'Tienda',
  [Resource.cart]: 'Carrito',
  [Resource.inventory_inbound]: 'Entrada Inventario',
  [Resource.categories]: 'Categorías',
  [Resource.products]: 'Productos',
  [Resource.campaigns]: 'Campañas',
  [Resource.scraps]: 'Scraps',
  [Resource.users]: 'Usuarios',
  [Resource.inventory_stock]: 'Stock Inventario',
  [Resource.inventory_movements]: 'Movimientos Inventario',
  [Resource.sales]: 'Ventas',
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
