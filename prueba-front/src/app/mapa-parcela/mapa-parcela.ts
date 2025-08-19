import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-mapa-parcela',
  imports: [],
  templateUrl: './mapa-parcela.html',
  styleUrl: './mapa-parcela.css'
})
export class MapaParcela implements AfterViewInit{
  private map!: L.Map;
   private drawnItems = new L.FeatureGroup();

  @Output() mouseCoords = new EventEmitter<{ lat: number; lon: number }>();

   ngAfterViewInit(): void {
    this.initMap();
    this.initDrawControl();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-34.6037, -58.3816], // Ej: Buenos Aires
      zoom: 13
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.drawnItems.addTo(this.map);

   // 🔹 Capturar movimiento del mouse y emitir coords
    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      this.mouseCoords.emit({ lat: e.latlng.lat, lon: e.latlng.lng });
    });
  }
  

  private initDrawControl(): void {
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems
      },
      draw: {
        polygon: {
          shapeOptions: {
            color: 'black',
            weight: 3
          }},
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      }
    });

    this.map.addControl(drawControl);

    // Evento cuando se dibuja algo
    this.map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      this.drawnItems.addLayer(layer);

      // Obtener coordenadas
      const coords = layer.getLatLngs()[0].map((p: any) => [p.lng, p.lat]);

      // Calcular área con Turf.js
      const polygon = turf.polygon([[...coords, coords[0]]]); // cerrar polígono
      const area = turf.area(polygon); // en m²

      console.log('Coordenadas:', coords);
      console.log('Área (m²):', area);

      // Aquí podrías enviar a tu API
      // this.enviarParcela(coords, area);
    });
  }


}
