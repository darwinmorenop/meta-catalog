import { Routes } from '@angular/router';
import { HomeComponent } from './core/modules/home/home.component';
import { CatalogOnlineComponent } from './core/modules/catalog-online/catalog-online.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'catalog', component: CatalogOnlineComponent }
];
