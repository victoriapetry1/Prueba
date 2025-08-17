import { Routes } from '@angular/router';
import { PruebaMaps } from './prueba-maps/prueba-maps';
import { MapaParcela } from './mapa-parcela/mapa-parcela';
import { PanelClima } from './panel-clima/panel-clima';

export const routes: Routes = [

    { path: '', redirectTo: 'campos', pathMatch: 'full' },
    { path: 'campos', component: MapaParcela },
    { path: '', redirectTo: 'prueba', pathMatch: 'full' },
    { path: 'prueba', component: PruebaMaps },
    { path: '', redirectTo: 'clima', pathMatch: 'full' },
    { path: 'clima', component: PanelClima },

];
