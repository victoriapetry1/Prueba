import { Routes } from '@angular/router';
import { PruebaMaps } from './prueba-maps/prueba-maps';

export const routes: Routes = [

    { path: '', redirectTo: 'campos', pathMatch: 'full' },
    { path: 'campos', component: PruebaMaps },
];
