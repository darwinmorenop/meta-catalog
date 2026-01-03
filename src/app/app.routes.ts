import { Routes } from '@angular/router';
import { CatalogOnlineComponent } from './core/modules/catalog-online/catalog-online.component';
import { HomeComponent } from './features/home/home.component';
import { CategoriesDashboardComponent } from './features/categories/dashboard/categories-dashboard.component';
import { ProductDashboardComponent } from './features/products/dashboard/product-dashboard.component';
import { CampaignDashboardComponent } from './features/campaigns/dashboard/campaign-dashboard.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalog', component: CatalogOnlineComponent },
    { path: 'categories', component: CategoriesDashboardComponent },
    { path: 'products', component: ProductDashboardComponent },
    { path: 'campaigns', component: CampaignDashboardComponent },
    { path: '**', component: HomeComponent }
];
