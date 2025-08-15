import { Component } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

@Component({
  selector: 'app-mapas',
  imports: [],
  templateUrl: './mapas.html',
  styleUrl: './mapas.css',
  template: `<div id="map" style="height: 500px;"></div>`,
})
export class Mapas implements AfterViewInit {
   private map!: L.Map;
  private drawnItems!: L.FeatureGroup;

  // Para guardar los lotes en memoria
  public lotes: any[] = [];

  ngAfterViewInit(): void {
    // Inicializar mapa
    this.map = L.map('map').setView([-34.6, -58.4], 6);

    // Capa base OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Contenedor de elementos dibujados
    this.drawnItems = new L.FeatureGroup();
    this.map.addLayer(this.drawnItems);

    // Control de dibujo, edición y borrado
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.drawnItems, // permite editar/borrar estos elementos
        remove: true
      },
      draw: {
        polygon: {},
        rectangle: {},
        marker: {},
        polyline: false,
        circle: false
      }
    });
    this.map.addControl(drawControl);

    // Evento al crear un elemento
    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      this.drawnItems.addLayer(layer);

      // Guardar coordenadas en memoria
      let coords;
      if (layer instanceof L.Marker) {
        coords = layer.getLatLng();
      } else {
        coords = layer.getLatLngs();
      }
      this.lotes.push({ layer, coords });
      console.log('Lote agregado:', coords);
    });

    // Evento al borrar elementos
    this.map.on(L.Draw.Event.DELETED, (e: any) => {
      e.layers.eachLayer((layer: any) => {
        // Eliminar del arreglo de lotes
        this.lotes = this.lotes.filter(l => l.layer !== layer);
        console.log('Lote borrado');
      });
    });

    // Evento al editar elementos
    this.map.on(L.Draw.Event.EDITED, (e: any) => {
      e.layers.eachLayer((layer: any) => {
        const lote = this.lotes.find(l => l.layer === layer);
        if (lote) {
          if (layer instanceof L.Marker) {
            lote.coords = layer.getLatLng();
          } else {
            lote.coords = layer.getLatLngs();
          }
        }
      });
      console.log('Lotes editados', this.lotes);
    });
  }
}
