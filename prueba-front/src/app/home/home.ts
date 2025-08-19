import { Component } from '@angular/core';
import { MapaParcela } from '../mapa-parcela/mapa-parcela';
import { PanelClima } from '../panel-clima/panel-clima';

@Component({
  selector: 'app-home',
  imports: [MapaParcela, PanelClima],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  lat: number = -34.6037;
  lon: number = -58.3816;

  updateCoords(coords: { lat: number; lon: number }) {
    this.lat = coords.lat;
    this.lon = coords.lon;
  }

}
