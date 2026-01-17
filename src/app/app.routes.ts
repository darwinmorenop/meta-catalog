import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CategoriesDashboardComponent } from './features/categories/dashboard/categories-dashboard.component';
import { ProductDashboardComponent } from './features/products/dashboard/product-dashboard.component';
import { CampaignDashboardComponent } from './features/campaigns/dashboard/campaign-dashboard.component';

import { ScrapsDashboardComponent } from './features/scraps/dashboard/scraps-dashboard.component';
import { ScrapDetailComponent } from './features/scraps/detail/scrap-detail.component';
import { SyncProposalComponent } from './features/scraps/sync-proposal/sync-proposal.component';
import { ProductScrapDetailComponent } from './features/scraps/product-detail/product-scrap-detail.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'inventory/inbound', loadComponent: () => import('./features/inventory/inbound/dashboard/inventory-inbound-dashboard.component').then(m => m.InventoryInboundDashboardComponent) },
    { path: 'inventory/inbound/register', loadComponent: () => import('./features/inventory/inbound/register/inventory-inbound-register.component').then(m => m.InventoryInboundRegisterComponent) },
    { path: 'inventory/inbound/:id/edit', loadComponent: () => import('./features/inventory/inbound/edit/inventory-inbound-edit.component').then(m => m.InventoryInboundEditComponent) },
    { path: 'inventory/inbound/:id', loadComponent: () => import('./features/inventory/inbound/detail/inventory-inbound-detail.component').then(m => m.InventoryInboundDetailComponent) },
    { path: 'categories', component: CategoriesDashboardComponent },
    { path: 'products/:id', 
      loadComponent: () => import('./features/products/detail/product-detail.component').then(m => m.ProductDetailComponent),
      children: [
        { path: '', redirectTo: 'general', pathMatch: 'full' },
        { path: 'general', loadComponent: () => import('./features/products/detail/sections/product-general/product-general.component').then(m => m.ProductGeneralComponent) },
        { path: 'pricing', loadComponent: () => import('./features/products/detail/sections/product-pricing/product-pricing-detail.component').then(m => m.ProductPricingDetailComponent) },
        { path: 'stock', loadComponent: () => import('./features/products/detail/sections/product-stock/product-stock-detail.component').then(m => m.ProductStockDetailComponent) },
        { path: 'attributes', loadComponent: () => import('./features/products/detail/sections/product-attributes/product-attributes-detail.component').then(m => m.ProductAttributesDetailComponent) },
        { path: 'media', loadComponent: () => import('./features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent) }
      ]
    },
    { path: 'products/:id/edit', 
      loadComponent: () => import('./features/products/edit/product-edit.component').then(m => m.ProductEditComponent),
      children: [
        { path: '', redirectTo: 'general', pathMatch: 'full' },
        { path: 'general', loadComponent: () => import('./features/products/edit/sections/product-general-edit/product-general-edit.component').then(m => m.ProductGeneralEditComponent) },
        { path: 'attributes', loadComponent: () => import('./features/products/edit/sections/product-attributes-edit/product-attributes-edit.component').then(m => m.ProductAttributesEditComponent) }
      ]
    },
    { path: 'products', component: ProductDashboardComponent },
    { path: 'campaigns', component: CampaignDashboardComponent },
    { path: 'scraps', component: ScrapsDashboardComponent },
    { path: 'scraps/sync', component: SyncProposalComponent },
    { path: 'scraps/:scrapId/products/:productId', component: ProductScrapDetailComponent },
    { path: 'scraps/:id', component: ScrapDetailComponent },
    { path: 'products-media-dashboard', loadComponent: () => import('./features/products/media/dashboard/product-media-dashboard.component').then(m => m.ProductMediaDashboardComponent) },
    { path: 'products-media/:productId', loadComponent: () => import('./features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent) },
    { path: 'products-price-dashboard', loadComponent: () => import('./features/products/price/dashboard/product-price-dashboard.component').then(m => m.ProductPriceDashboardComponent) },
    { path: 'products-price/:productId', loadComponent: () => import('./features/products/price/history/product-price-history.component').then(m => m.ProductPriceHistoryComponent) },
    { path: 'users', loadComponent: () => import('./features/users/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent) },
    { path: 'users/:id', loadComponent: () => import('./features/users/detail/user-detail.component').then(m => m.UserDetailComponent) },
    { path: 'inventory/stock-entry', loadComponent: () => import('./features/products/inventory/stock-entry/dashboard/product-inventory-stock-dashboard.component').then(m => m.ProductInventoryStockDashboardComponent) },
    { path: 'inventory/stock-entry/:productId/:userId', loadComponent: () => import('./features/products/inventory/stock-entry/detail/product-inventory-stock-detail.component').then(m => m.ProductInventoryStockDetailComponent) },
    { path: '**', component: HomeComponent }
];
