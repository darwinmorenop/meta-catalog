import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CategoriesDashboardComponent } from './features/categories/dashboard/categories-dashboard.component';
import { ProductDashboardComponent } from './features/products/dashboard/product-dashboard.component';
import { CampaignDashboardComponent } from './features/campaigns/dashboard/campaign-dashboard.component';

import { ScrapsDashboardComponent } from './features/scraps/dashboard/scraps-dashboard.component';
import { ScrapDetailComponent } from './features/scraps/detail/scrap-detail.component';
import { SyncProposalComponent } from './features/scraps/sync-proposal/sync-proposal.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'categories', component: CategoriesDashboardComponent },
    { path: 'products', component: ProductDashboardComponent },
    { path: 'campaigns', component: CampaignDashboardComponent },
    { path: 'scraps', component: ScrapsDashboardComponent },
    { path: 'scraps/sync', component: SyncProposalComponent },
    { path: 'scraps/:id', component: ScrapDetailComponent },
    { path: '**', component: HomeComponent }
];
