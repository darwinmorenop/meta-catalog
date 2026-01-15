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
    { path: '', component: HomeComponent },
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
        { path: 'pricing', loadComponent: () => import('./features/products/edit/sections/product-pricing-edit/product-pricing-edit.component').then(m => m.ProductPricingEditComponent) },
        { path: 'stock', loadComponent: () => import('./features/products/edit/sections/product-stock-edit/product-stock-edit.component').then(m => m.ProductStockEditComponent) },
        { path: 'attributes', loadComponent: () => import('./features/products/edit/sections/product-attributes-edit/product-attributes-edit.component').then(m => m.ProductAttributesEditComponent) }
      ]
    },
    { path: 'products', component: ProductDashboardComponent },
    { path: 'campaigns', component: CampaignDashboardComponent },
    { path: 'scraps', component: ScrapsDashboardComponent },
    { path: 'scraps/sync', component: SyncProposalComponent },
    { path: 'scraps/:scrapId/products/:productId', component: ProductScrapDetailComponent },
    { path: 'scraps/:id', component: ScrapDetailComponent },
    { path: 'products/media-dashboard', loadComponent: () => import('./features/products/media/dashboard/product-media-dashboard.component').then(m => m.ProductMediaDashboardComponent) },
    { path: 'products/media/:productId', loadComponent: () => import('./features/products/media/media-list/media-list-dashboard.component').then(m => m.MediaListDashboardComponent) },
    { path: '**', component: HomeComponent }
];
