import { Routes } from '@angular/router';
import { HomeComponent } from 'src/app/features/home/home.component';
import { CategoriesDashboardComponent } from 'src/app/features/categories/dashboard/categories-dashboard.component';
import { ProductDashboardComponent } from 'src/app/features/products/dashboard/product-dashboard.component';
import { CampaignDashboardComponent } from 'src/app/features/campaigns/dashboard/campaign-dashboard.component';

import { ScrapsDashboardComponent } from 'src/app/features/scraps/dashboard/scraps-dashboard.component';
import { ScrapDetailComponent } from 'src/app/features/scraps/detail/scrap-detail.component';
import { SyncProposalComponent } from 'src/app/features/scraps/sync-proposal/sync-proposal.component';
import { ProductScrapDetailComponent } from 'src/app/features/scraps/product-detail/product-scrap-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'inventory/inbound', loadComponent: () => import('src/app/features/inventory/inbound/dashboard/inventory-inbound-dashboard.component').then(m => m.InventoryInboundDashboardComponent) },
    { path: 'inventory/inbound/register', loadComponent: () => import('src/app/features/inventory/inbound/register/inventory-inbound-register.component').then(m => m.InventoryInboundRegisterComponent) },
    { path: 'inventory/inbound/:id/edit', loadComponent: () => import('src/app/features/inventory/inbound/edit/inventory-inbound-edit.component').then(m => m.InventoryInboundEditComponent) },
    { path: 'inventory/inbound/:id', loadComponent: () => import('src/app/features/inventory/inbound/detail/inventory-inbound-detail.component').then(m => m.InventoryInboundDetailComponent) },
    { path: 'categories', component: CategoriesDashboardComponent },
    { path: 'products/:id', 
      loadComponent: () => import('src/app/features/products/detail/product-detail.component').then(m => m.ProductDetailComponent),
      children: [
        { path: '', redirectTo: 'general', pathMatch: 'full' },
        { path: 'general', loadComponent: () => import('src/app/features/products/detail/sections/product-general/product-general.component').then(m => m.ProductGeneralComponent) },
        { path: 'pricing', loadComponent: () => import('src/app/features/products/detail/sections/product-pricing/product-pricing-detail.component').then(m => m.ProductPricingDetailComponent) },
        { path: 'stock', loadComponent: () => import('src/app/features/products/detail/sections/product-stock/product-stock-detail.component').then(m => m.ProductStockDetailComponent) },
        { path: 'attributes', loadComponent: () => import('src/app/features/products/detail/sections/product-attributes/product-attributes-detail.component').then(m => m.ProductAttributesDetailComponent) },
        { path: 'media', loadComponent: () => import('src/app/features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent) }
      ]
    },
    { path: 'products/:id/edit', 
      loadComponent: () => import('src/app/features/products/edit/product-edit.component').then(m => m.ProductEditComponent),
      children: [
        { path: '', redirectTo: 'general', pathMatch: 'full' },
        { path: 'general', loadComponent: () => import('src/app/features/products/edit/sections/product-general-edit/product-general-edit.component').then(m => m.ProductGeneralEditComponent) },
        { path: 'attributes', loadComponent: () => import('src/app/features/products/edit/sections/product-attributes-edit/product-attributes-edit.component').then(m => m.ProductAttributesEditComponent) }
      ]
    },
    { path: 'products', component: ProductDashboardComponent },
    { path: 'campaigns', component: CampaignDashboardComponent },
    { path: 'favorites', loadComponent: () => import('src/app/features/users/lists/favorites/user-list-favorites.component').then(m => m.UserListFavoritesComponent) },
    { path: 'tracking', loadComponent: () => import('src/app/features/users/lists/tracking/user-list-tracking.component').then(m => m.UserListTrackingComponent) },
    { path: 'tracking/:id', loadComponent: () => import('src/app/features/users/lists/tracking/detail/user-list-tracking-detail.component').then(m => m.UserListTrackingDetailComponent) },
    { path: 'scraps', component: ScrapsDashboardComponent },
    { path: 'scraps/products', loadComponent: () => import('src/app/features/scraps/products/dashboard/scrap-product-dashboard.component').then(m => m.ScrapProductDashboardComponent) },
    { path: 'scraps/products/:productId', loadComponent: () => import('src/app/features/scraps/products/detail/scrap-product-detail.component').then(m => m.ScrapProductDetailComponent) },
    { path: 'scraps/sync', component: SyncProposalComponent },
    { path: 'scraps/:scrapId/products/:productId', component: ProductScrapDetailComponent },
    { path: 'scraps/:id', component: ScrapDetailComponent },
    { path: 'products-media-dashboard', loadComponent: () => import('src/app/features/products/media/dashboard/product-media-dashboard.component').then(m => m.ProductMediaDashboardComponent) },
    { path: 'products-media/:productId', loadComponent: () => import('src/app/features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent) },
    { path: 'products-price-dashboard', loadComponent: () => import('src/app/features/products/price/dashboard/product-price-dashboard.component').then(m => m.ProductPriceDashboardComponent) },
    { path: 'products-price/:productId', loadComponent: () => import('src/app/features/products/price/history/product-price-history.component').then(m => m.ProductPriceHistoryComponent) },
    { path: 'users', loadComponent: () => import('src/app/features/users/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent) },
    { path: 'users/profiles', loadComponent: () => import('src/app/features/users/profiles/dashboard/user-profile-dashboard.component').then(m => m.UserProfileDashboardComponent) },
    { path: 'users/agenda', loadComponent: () => import('src/app/features/users/agenda/dashboard/user-agenda-dashboard.component').then(m => m.UserAgendaDashboardComponent) },
    { path: 'users/lists', loadComponent: () => import('src/app/features/users/lists/dashboard/user-list-dashboard.component').then(m => m.UserListDashboardComponent) },
    { path: 'users/lists/create', loadComponent: () => import('src/app/features/users/lists/edit/user-list-edit.component').then(m => m.UserListEditComponent) },
    { path: 'users/lists/:id', loadComponent: () => import('src/app/features/users/lists/detail/user-list-detail.component').then(m => m.UserListDetailComponent) },
    { path: 'users/lists/:id/edit', loadComponent: () => import('src/app/features/users/lists/edit/user-list-edit.component').then(m => m.UserListEditComponent) },
    { path: 'users/:id', loadComponent: () => import('src/app/features/users/detail/user-detail.component').then(m => m.UserDetailComponent) },
    { path: 'inventory/stock-entry', loadComponent: () => import('src/app/features/products/inventory/stock-entry/dashboard/product-inventory-stock-dashboard.component').then(m => m.ProductInventoryStockDashboardComponent) },
    { path: 'inventory/stock-entry/:productId/:userId', loadComponent: () => import('src/app/features/products/inventory/stock-entry/detail/product-inventory-stock-detail.component').then(m => m.ProductInventoryStockDetailComponent) },
    { path: 'inventory/movements', loadComponent: () => import('src/app/features/inventory/movements/dashboard/inventory-movement-dashboard.component').then(m => m.InventoryMovementDashboardComponent) },
    { path: 'inventory/movements/:productId/:userId', loadComponent: () => import('src/app/features/inventory/movements/detail/inventory-movement-detail.component').then(m => m.InventoryMovementDetailComponent) },
    { path: 'sales', loadComponent: () => import('src/app/features/sales/dashboard/sale-dashboard.component').then(m => m.SaleDashboardComponent) },
    { path: 'sales/inventory', loadComponent: () => import('src/app/features/sales/inventory/dashboard/sale-inventory-dashboard.component').then(m => m.SaleInventoryDashboardComponent) },
    { path: 'sales/inventory/:productId/:userId', loadComponent: () => import('src/app/features/sales/inventory/detail/sale-inventory-detail.component').then(m => m.SaleInventoryDetailComponent) },
    { path: 'sales/register', loadComponent: () => import('src/app/features/sales/register/sale-register.component').then(m => m.SaleRegisterComponent) },
    { path: 'sales/:id/edit', loadComponent: () => import('src/app/features/sales/register/sale-register.component').then(m => m.SaleRegisterComponent) },
    { path: 'sales/:id', loadComponent: () => import('src/app/features/sales/detail/sale-detail.component').then(m => m.SaleDetailComponent) },
    { path: '**', component: HomeComponent }
];
