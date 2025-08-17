import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { WeatherService } from '../services/weather'; 
import * as L from 'leaflet';
import 'leaflet-draw';

type LoteLayer = L.Polygon | L.Rectangle | L.Marker;

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface Lote {
  id: string;
  nombre: string;
  color?: string;
  tipo: 'polygon' | 'rectangle' | 'marker';
  layer: LoteLayer;
  coords: any;
}

interface MapaConfig {
  id: string;
  coords: [number, number];
  zoom: number;
}

// Sobrescribir iconos por defecto
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
});

@Component({
  selector: 'app-mapas',
  imports: [CommonModule],
  templateUrl: './mapas.html',
  styleUrls: ['./mapas.css'],
  template: `
    <div *ngFor="let mapa of mapas; trackBy: trackById">
      <div [id]="mapa.id" style="height: 400px; margin-bottom: 20px;"></div>
      <button (click)="borrarRecorrido(mapa.id)">Borrar recorrido</button>
    </div>
  `
})
export class Mapas implements AfterViewInit {
  public lotes: Lote[] = [];
  public loteSeleccionado: Lote | null = null;

  // Recorridos separados por mapa
  private puntosRecorridosMap: { [key: string]: L.LatLng[] } = {};
  private polylineRecorridos: { [key: string]: L.Polyline | null } = {};

  mapas: MapaConfig[] = [
    { id: 'map1', coords: [-34.6, -58.4], zoom: 12 }, // Buenos Aires
    { id: 'map2', coords: [-31.4, -64.2], zoom: 12 }, // Córdoba
    { id: 'map3', coords: [-32.9, -68.8], zoom: 12 }  // Mendoza
  ];

  private drawnItems: { [key: string]: L.FeatureGroup } = {};
  private mapInstances: { [key: string]: L.Map } = {};

  weatherData: { [id: string]: any } = {};

  constructor(private weatherService: WeatherService) {
      this.loadWeather();
  }

  loadWeather() {
    for (let i = 0; i < this.mapas.length; i++) {
      const mapaId = this.mapas[i].id;
      this.weatherService.getWeather(this.mapas[i].coords[0], this.mapas[i].coords[1]).subscribe({
        next: (data) => {
          this.weatherData[mapaId] = data.current;
        },
        error: (err) => {
          console.error('Error obteniendo clima', err);
        }
      });
    }
  }

  getWeatherDescription(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      61: 'Lluvia débil',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      80: 'Chubascos',
      95: 'Tormenta'
    };
    return weatherCodes[code] || 'Desconocido';
  }

  getWeatherIcon(code: number): string {
    const icons: Record<number, string> = {
      0: '☀️',  // Despejado
      1: '🌤️',  // Mayormente despejado
      2: '⛅',   // Parcialmente nublado
      3: '☁️',  // Nublado
      45: '🌫️', // Niebla
      48: '🌫️❄️', // Niebla con escarcha
      51: '🌦️', // Llovizna ligera
      61: '🌧️', // Lluvia débil
      63: '🌧️', // Lluvia moderada
      65: '🌧️🌧️', // Lluvia intensa
      71: '❄️', // Nieve ligera
      73: '❄️❄️', // Nieve moderada
      75: '❄️❄️❄️', // Nieve fuerte
      80: '🌦️', // Chubascos
      95: '⛈️', // Tormenta
      96: '⛈️⚡', // Tormenta con granizo
      99: '⛈️🌩️', // Tormenta fuerte
    };
    return icons[code] || '❔';
  }

  ngAfterViewInit(): void {
    this.mapas.forEach(mapa => this.createMap(mapa));
  }

  trackById(index: number, mapa: MapaConfig): string {
    return mapa.id;
  }

  private createMap(config: MapaConfig): void {
    const map = L.map(config.id).setView(config.coords, config.zoom);

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Grupo de capas
    this.drawnItems[config.id] = new L.FeatureGroup();
    map.addLayer(this.drawnItems[config.id]);

    // Control de dibujo de polígonos
    const drawControl = new L.Control.Draw({
      edit: { featureGroup: this.drawnItems[config.id] },
      draw: {
        polygon: {},
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false
      }
    });
    map.addControl(drawControl);

    // Evento creación de polígonos
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;

      if (event.layerType === 'polygon') {
        const nombre = prompt("Ingrese un nombre para el lote:", "Nuevo Lote") || "Sin nombre";
        const color = "#3388ff";

        layer.setStyle({
          color: color,
          fillColor: color,
          fillOpacity: 0.5
        });
        layer.bindPopup(nombre);

        this.drawnItems[config.id].addLayer(layer);

        const nuevoLote: Lote = {
          id: Date.now().toString(),
          nombre: nombre,
          color: color,
          tipo: 'polygon',
          layer: layer,
          coords: layer.getLatLngs()
        };

        // Selección del lote
        layer.on('click', () => {
          this.loteSeleccionado = nuevoLote;
          alert(`✅ Lote "${nuevoLote.nombre}" seleccionado`);
        });

        this.lotes.push(nuevoLote);
      }
    });

    this.mapInstances[config.id] = map;

    // Habilitar puntos para recorrido
    this.habilitarDibujoDePuntos(map);
  }

  private habilitarDibujoDePuntos(map: L.Map) {
    const drawControl = new L.Control.Draw({
      draw: {
        marker: {},
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false
      },
      edit: {
        featureGroup: this.drawnItems[map.getContainer().id]
      }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event: any) => {
      if (event.layerType === 'marker') {
        const marker = event.layer as L.Marker;
        marker.options.draggable = true;
        const latlng = marker.getLatLng();
        const mapId = map.getContainer().id;

        // Inicializar array si no existe
        if (!this.puntosRecorridosMap[mapId]) this.puntosRecorridosMap[mapId] = [];
        this.puntosRecorridosMap[mapId].push(latlng);

        // Agregar marcador al mapa
        this.drawnItems[mapId].addLayer(marker);

        // Dibujar/actualizar línea del recorrido
        const puntos = this.puntosRecorridosMap[mapId];
        if (this.polylineRecorridos[mapId]) {
          this.polylineRecorridos[mapId]!.setLatLngs(puntos);
        } else {
          this.polylineRecorridos[mapId] = L.polyline(puntos, { color: 'red' }).addTo(map);
        }
        marker.on('drag', () => {
          const mapId = map.getContainer().id;

          // Actualizamos la posición del marcador en el array
          const index = this.puntosRecorridosMap[mapId].findIndex(
            m => m.lat === latlng.lat && m.lng === latlng.lng
          );
          if (index !== -1) {
            this.puntosRecorridosMap[mapId][index] = marker.getLatLng();
          }

          // Actualizamos la polilínea
          this.polylineRecorridos[mapId]!.setLatLngs(this.puntosRecorridosMap[mapId]);
        });

      }
    });
  }

  // Borrar recorrido de un mapa
  borrarRecorrido(mapId: string) {
    const map = this.mapInstances[mapId];
    if (!map) return;

    if (this.polylineRecorridos[mapId]) {
      map.removeLayer(this.polylineRecorridos[mapId]!);
      this.polylineRecorridos[mapId] = null;
    }

    this.puntosRecorridosMap[mapId] = [];
  }

  // Cambiar nombre de lote
  cambiarNombre() {
    if (!this.loteSeleccionado) {
      alert("⚠️ Primero seleccione un lote");
      return;
    }
    const nuevoNombre = prompt("Nuevo nombre:", this.loteSeleccionado.nombre);
    if (nuevoNombre) {
      this.loteSeleccionado.nombre = nuevoNombre;
      this.loteSeleccionado.layer.bindPopup(this.loteSeleccionado.nombre).openPopup();
    }
  }

  // Cambiar color de lote
  cambiarColor() {
    if (!this.loteSeleccionado) {
      alert("⚠️ Primero seleccione un lote");
      return;
    }
    const nuevoColor = prompt("Ingrese color (ej: red, blue, #ff0000):", this.loteSeleccionado.color || "#3388ff");
    if (nuevoColor && this.loteSeleccionado.layer instanceof L.Polygon) {
      this.loteSeleccionado.color = nuevoColor;
      this.loteSeleccionado.layer.setStyle({
        color: nuevoColor,
        fillColor: nuevoColor,
        fillOpacity: 0.5
      });
    }
  }

  async ingresarCoordenadas(mapId: string) {
    const input = prompt("Ingrese coordenadas en formato lat,lng (ej: -34.61,-58.38):");
    if (!input) return;

    const partes = input.split(',').map(s => parseFloat(s.trim()));
    if (partes.length !== 2 || partes.some(isNaN)) {
      alert("Formato incorrecto. Debe ser lat,lng");
      return;
    }

    const [lat, lng] = partes as [number, number];

    // Llamamos a la función que actualiza el mapa
    await this.actualizarMapa(mapId, [lat, lng], 14);
  }

  // Actualiza la vista de un mapa a coordenadas específicas
  async actualizarMapa(mapId: string, coords: [number, number], zoom?: number) {
    const map = this.mapInstances[mapId];
    if (!map) {
      console.warn(`No existe el mapa con id ${mapId}`);
      return;
    }

    // Cambiamos la vista del mapa
    if (zoom) {
      map.setView(coords, zoom);
    } else {
      map.setView(coords);
    }

    // Opcional: agregar un marcador en esas coordenadas
    const marker = L.marker(coords, { draggable: true }).addTo(this.drawnItems[mapId]);
    marker.bindPopup(`Ubicación actual: [${coords[0]}, ${coords[1]}]`).openPopup();

    // Actualizar recorrido si lo querés también
    if (!this.puntosRecorridosMap[mapId]) this.puntosRecorridosMap[mapId] = [];
    this.puntosRecorridosMap[mapId].push(L.latLng(coords[0], coords[1]));

    if (this.polylineRecorridos[mapId]) {
      this.polylineRecorridos[mapId]!.setLatLngs(this.puntosRecorridosMap[mapId]);
    } else {
      this.polylineRecorridos[mapId] = L.polyline(this.puntosRecorridosMap[mapId], { color: 'red' }).addTo(map);
    }

    this.weatherService.getWeather(coords[0], coords[1]).subscribe({
      next: (data) => {
        this.weatherData[mapId] = data.current; // guardamos por mapId
      },
      error: (err) => {
        console.error('Error actualizando clima', err);
      }
    });
  }

  

}
