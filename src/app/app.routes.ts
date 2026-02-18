import { Routes } from '@angular/router';
import { HomeComponent } from 'src/app/features/home/home.component';
import { CategoriesDashboardComponent } from 'src/app/features/categories/dashboard/categories-dashboard.component';
import { ProductDashboardComponent } from 'src/app/features/products/dashboard/product-dashboard.component';
import { CampaignDashboardComponent } from 'src/app/features/campaigns/dashboard/campaign-dashboard.component';

import { ScrapsDashboardComponent } from 'src/app/features/scraps/dashboard/scraps-dashboard.component';
import { ScrapDetailComponent } from 'src/app/features/scraps/detail/scrap-detail.component';
import { SyncProposalComponent } from 'src/app/features/scraps/sync-proposal/sync-proposal.component';
import { ProductScrapDetailComponent } from 'src/app/features/scraps/product-detail/product-scrap-detail.component';
import { PermissionGuard } from 'src/app/core/guards/permission.guard';
import { Action, Resource } from 'src/app/shared/entity/user.profile.entity';
import { UnauthorizedComponent } from 'src/app/features/unauthorized/unauthorized.component';
import { LoginComponent } from 'src/app/features/auth/login/login.component';
import { authGuard } from 'src/app/core/guards/auth.guard';

export const routes: Routes = [
    {
      path: 'login',
      component: LoginComponent
    },
    {
      path: '',
      component: HomeComponent,
      pathMatch: 'full',
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.dashboard, action: Action.view }
    },
    {
      path: 'unauthorized',
      component: UnauthorizedComponent
    },
    {
      path: 'store',
      loadComponent: () => import('src/app/features/store/dashboard/store-dashboard.component').then(m => m.StoreDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.store, action: Action.view }
    },
    {
      path: 'cart/dashboard',
      loadComponent: () => import('src/app/features/cart/dashboard/cart-dashboard.component').then(m => m.CartDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.cart, action: Action.view }
    },
    {
      path: 'inventory/inbound',
      loadComponent: () => import('src/app/features/inventory/inbound/dashboard/inventory-inbound-dashboard.component').then(m => m.InventoryInboundDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_inbound, action: Action.view }
    },
    {
      path: 'inventory/inbound/register',
      loadComponent: () => import('src/app/features/inventory/inbound/register/inventory-inbound-register.component').then(m => m.InventoryInboundRegisterComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_inbound, action: Action.create }
    },
    {
      path: 'inventory/inbound/:id/edit',
      loadComponent: () => import('src/app/features/inventory/inbound/edit/inventory-inbound-edit.component').then(m => m.InventoryInboundEditComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_inbound, action: Action.edit }
    },
    {
      path: 'inventory/inbound/:id',
      loadComponent: () => import('src/app/features/inventory/inbound/detail/inventory-inbound-detail.component').then(m => m.InventoryInboundDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_inbound, action: Action.view }
    },
    {
      path: 'categories',
      component: CategoriesDashboardComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.categories, action: Action.view }
    },
    {
      path: 'products/:id',
      loadComponent: () => import('src/app/features/products/detail/product-detail.component').then(m => m.ProductDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.view },
      children: [
        { path: '', redirectTo: 'general', pathMatch: 'full' },
        { path: 'general', loadComponent: () => import('src/app/features/products/detail/sections/product-general/product-general.component').then(m => m.ProductGeneralComponent) },
        { path: 'pricing', loadComponent: () => import('src/app/features/products/detail/sections/product-pricing/product-pricing-detail.component').then(m => m.ProductPricingDetailComponent) },
        { path: 'stock', loadComponent: () => import('src/app/features/products/detail/sections/product-stock/product-stock-detail.component').then(m => m.ProductStockDetailComponent) },
        { path: 'attributes', loadComponent: () => import('src/app/features/products/detail/sections/product-attributes/product-attributes-detail.component').then(m => m.ProductAttributesDetailComponent) },
        { path: 'media', loadComponent: () => import('src/app/features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent) }
      ]
    },
    {
      path: 'products/:id/edit',
      loadComponent: () => import('src/app/features/products/edit/product-edit.component').then(m => m.ProductEditComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.edit },
      children: [
        { path: '', redirectTo: 'general', pathMatch: 'full' },
        { path: 'general', loadComponent: () => import('src/app/features/products/edit/sections/product-general-edit/product-general-edit.component').then(m => m.ProductGeneralEditComponent) },
        { path: 'attributes', loadComponent: () => import('src/app/features/products/edit/sections/product-attributes-edit/product-attributes-edit.component').then(m => m.ProductAttributesEditComponent) }
      ]
    },
    {
      path: 'products',
      component: ProductDashboardComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.view }
    },
    {
      path: 'campaigns',
      component: CampaignDashboardComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.campaigns, action: Action.view }
    },
    {
      path: 'favorites',
      loadComponent: () => import('src/app/features/users/lists/favorites/user-list-favorites.component').then(m => m.UserListFavoritesComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'tracking',
      loadComponent: () => import('src/app/features/users/lists/tracking/user-list-tracking.component').then(m => m.UserListTrackingComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'tracking/:id',
      loadComponent: () => import('src/app/features/users/lists/tracking/detail/view/user-list-tracking-detail.component').then(m => m.UserListTrackingDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'tracking/:id/edit',
      loadComponent: () => import('src/app/features/users/lists/tracking/detail/edit/user-list-tracking-edit.component').then(m => m.UserListTrackingEditComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.edit }
    },
    {
      path: 'stock-notifier',
      loadComponent: () => import('src/app/features/users/lists/notifier/user-list-notifier.component').then(m => m.UserListNotifierComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'scraps',
      component: ScrapsDashboardComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.scraps, action: Action.view }
    },
    {
      path: 'scraps/products',
      loadComponent: () => import('src/app/features/scraps/products/dashboard/scrap-product-dashboard.component').then(m => m.ScrapProductDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.scraps, action: Action.view }
    },
    {
      path: 'scraps/products/:productId',
      loadComponent: () => import('src/app/features/scraps/products/detail/scrap-product-detail.component').then(m => m.ScrapProductDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.scraps, action: Action.view }
    },
    {
      path: 'scraps/sync',
      component: SyncProposalComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.scraps, action: Action.create }
    },
    {
      path: 'scraps/:scrapId/products/:productId',
      component: ProductScrapDetailComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.scraps, action: Action.view }
    },
    {
      path: 'scraps/:id',
      component: ScrapDetailComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.scraps, action: Action.view }
    },
    {
      path: 'products-media-dashboard',
      loadComponent: () => import('src/app/features/products/media/dashboard/product-media-dashboard.component').then(m => m.ProductMediaDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.view }
    },
    {
      path: 'products-media/:productId',
      loadComponent: () => import('src/app/features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.view }
    },
    {
      path: 'products-price-dashboard',
      loadComponent: () => import('src/app/features/products/price/dashboard/product-price-dashboard.component').then(m => m.ProductPriceDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.view }
    },
    {
      path: 'products-price/:productId',
      loadComponent: () => import('src/app/features/products/price/history/product-price-history.component').then(m => m.ProductPriceHistoryComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.products, action: Action.view }
    },
    {
      path: 'users',
      loadComponent: () => import('src/app/features/users/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'users/profiles',
      loadComponent: () => import('src/app/features/users/profiles/dashboard/user-profile-dashboard.component').then(m => m.UserProfileDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.admin }
    },
    {
      path: 'users/agenda',
      loadComponent: () => import('src/app/features/users/agenda/dashboard/user-agenda-dashboard.component').then(m => m.UserAgendaDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'users/lists',
      loadComponent: () => import('src/app/features/users/lists/dashboard/user-list-dashboard.component').then(m => m.UserListDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'users/lists/create',
      loadComponent: () => import('src/app/features/users/lists/edit/user-list-edit.component').then(m => m.UserListEditComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.create }
    },
    {
      path: 'users/lists/:id',
      loadComponent: () => import('src/app/features/users/lists/detail/user-list-detail.component').then(m => m.UserListDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'users/lists/:id/edit',
      loadComponent: () => import('src/app/features/users/lists/edit/user-list-edit.component').then(m => m.UserListEditComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.edit }
    },
    {
      path: 'users/:id',
      loadComponent: () => import('src/app/features/users/detail/user-detail.component').then(m => m.UserDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.users, action: Action.view }
    },
    {
      path: 'inventory/stock-entry',
      loadComponent: () => import('src/app/features/products/inventory/stock-entry/dashboard/product-inventory-stock-dashboard.component').then(m => m.ProductInventoryStockDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_stock, action: Action.view }
    },
    {
      path: 'inventory/stock-entry/:productId/:userId',
      loadComponent: () => import('src/app/features/products/inventory/stock-entry/detail/product-inventory-stock-detail.component').then(m => m.ProductInventoryStockDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_stock, action: Action.view }
    },
    {
      path: 'inventory/movements',
      loadComponent: () => import('src/app/features/inventory/movements/dashboard/inventory-movement-dashboard.component').then(m => m.InventoryMovementDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_movements, action: Action.view }
    },
    {
      path: 'inventory/movements/:productId/:userId',
      loadComponent: () => import('src/app/features/inventory/movements/detail/inventory-movement-detail.component').then(m => m.InventoryMovementDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.inventory_movements, action: Action.view }
    },
    {
      path: 'sales',
      loadComponent: () => import('src/app/features/sales/dashboard/sale-dashboard.component').then(m => m.SaleDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.sales, action: Action.view }
    },
    {
      path: 'sales/inventory',
      loadComponent: () => import('src/app/features/sales/inventory/dashboard/sale-inventory-dashboard.component').then(m => m.SaleInventoryDashboardComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.sales, action: Action.view }
    },
    {
      path: 'sales/inventory/:productId/:userId',
      loadComponent: () => import('src/app/features/sales/inventory/detail/sale-inventory-detail.component').then(m => m.SaleInventoryDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.sales, action: Action.view }
    },
    {
      path: 'sales/register',
      loadComponent: () => import('src/app/features/sales/register/sale-register.component').then(m => m.SaleRegisterComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.sales, action: Action.create }
    },
    {
      path: 'sales/:id/edit',
      loadComponent: () => import('src/app/features/sales/register/sale-register.component').then(m => m.SaleRegisterComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.sales, action: Action.edit }
    },
    {
      path: 'sales/:id',
      loadComponent: () => import('src/app/features/sales/detail/sale-detail.component').then(m => m.SaleDetailComponent),
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.sales, action: Action.view }
    },
    {
      path: '**',
      component: HomeComponent,
      canActivate: [authGuard, PermissionGuard],
      data: { resource: Resource.dashboard, action: Action.view }
    }
];
