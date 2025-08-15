import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Mapas } from './mapas/mapas';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Home },
    { path: 'mapa', component: Mapas }
];
