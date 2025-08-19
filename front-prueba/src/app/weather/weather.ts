import { Component } from '@angular/core';
import { WeatherService } from '../services/weather'; 
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import 'leaflet-draw';

type LoteLayer = L.Polygon | L.Rectangle;
type PuntoLayer = L.Marker;


@Component({
  selector: 'app-weather',
  imports: [CommonModule],
  templateUrl: './weather.html',
  styleUrl: './weather.css'
})
export class Weather {
  weatherData: any;
  lat = -34.61;   // Buenos Aires
  lon = -58.38;

  constructor(private weatherService: WeatherService) {
    this.loadWeather();
  }

  loadWeather() {
    this.weatherService.getWeather(this.lat, this.lon).subscribe({
      next: (data) => {
        this.weatherData = data.current;
      },
      error: (err) => {
        console.error('Error obteniendo clima', err);
      }
    });
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

  //Mapas con swal
  async abrirMapa() {
    // HTML del modal: un div donde se montará el mapa
    const { isConfirmed, value } = await Swal.fire({
      title: 'Mapa de lotes y recorrido',
      html: `<div id="swal-map" style="height:60vh; min-height:400px;"></div>`,
      width: '80vw',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      didOpen: () => this.initMapInSwal(),
      preConfirm: () => this.collectGeoJSON() // lo que devolvemos al confirmar
    });

    if (isConfirmed && value) {
      // value trae { lotesGeoJSON, puntosGeoJSON, recorridoGeoJSON }
      console.log('Resultado del Swal:', value);
      // acá podés guardar en tu backend o actualizar tu estado
    }
  }

  // --- Estado interno del mapa dentro del Swal ---
  private map?: L.Map;
  private drawnItems = new L.FeatureGroup();       // almacena lotes + puntos
  private puntos: PuntoLayer[] = [];               // para la polilínea
  private polyline?: L.Polyline;                   // recorrido dinámico

  private initMapInSwal() {
    const container = document.getElementById('swal-map');
    if (!container) return;

    // Crear mapa
    this.map = L.map(container, { zoomControl: true })
      .setView([-33.0, -66.3], 13); // San Luis aprox. (ajustá a gusto)

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    // Grupo de capas dibujadas
    this.drawnItems.addTo(this.map);

    // Herramientas de dibujo
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        rectangle: false,
        polyline: false,
        circle: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true
      }
    });
    this.map.addControl(drawControl);

    // Polilínea inicial (vacía)
    this.polyline = L.polyline([], { weight: 3 }).addTo(this.map);

    // Eventos de Leaflet.Draw
    this.map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer as L.Layer;

      if (layer instanceof L.Marker) {
        (layer as L.Marker).dragging?.enable();
        layer.on('dragend', () => this.actualizarRecorrido());
        this.drawnItems.addLayer(layer);
      } else {
        this.drawnItems.addLayer(layer);
      }
    });

    this.map.on(L.Draw.Event.EDITED, () => {
      // Si se editaron lotes o movieron puntos desde el editor
      this.actualizarRecorrido();
    });

    this.map.on(L.Draw.Event.DELETED, (e: any) => {
      const layers = e.layers as L.LayerGroup;
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          // eliminar también de la lista de puntos
          this.puntos = this.puntos.filter(p => p !== layer);
        }
      });
      this.actualizarRecorrido();
    });

    // Por si el mapa necesita recalcular tamaño cuando se abre el modal
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private configurarPunto(marker: L.Marker) {
    marker.options.draggable = true;

    // Habilitar drag en runtime (algunos tipos requieren bind)
    const anyMarker: any = marker as any;
    if (anyMarker.dragging && !anyMarker.dragging.enabled()) {
      anyMarker.dragging.enable();
    }

    marker.on('drag', () => this.actualizarRecorrido());
    marker.on('dragend', () => this.actualizarRecorrido());

    // Tooltip con coordenadas
    marker.bindTooltip(() => {
      const { lat, lng } = marker.getLatLng();
      return `Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}`;
    }, { permanent: false });
  }

  private actualizarRecorrido() {
    if (!this.polyline) return;
    const puntosOrdenados = this.puntos.map(m => m.getLatLng());
    this.polyline.setLatLngs(puntosOrdenados);
  }

  private collectGeoJSON() {
    // Separa lotes y puntos para devolver por separado + la línea del recorrido
    const lotes: L.GeoJSON | any[] = [];
    const puntos: L.GeoJSON | any[] = [];

    this.drawnItems.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        puntos.push(layer.toGeoJSON());
      } else if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        lotes.push(layer.toGeoJSON());
      }
    });

    const lotesGeoJSON = {
      type: 'FeatureCollection',
      features: lotes
    };

    const puntosGeoJSON = {
      type: 'FeatureCollection',
      features: puntos
    };

    const recorridoGeoJSON = this.polyline
      ? this.polyline.toGeoJSON()
      : { type: 'Feature', geometry: { type: 'LineString', coordinates: [] }, properties: {} };

    // Validación simple
    if (lotes.length === 0 && puntos.length === 0) {
      // Mensaje de validación de SweetAlert
      Swal.showValidationMessage('Agregá al menos un lote o un punto');
      return false;
    }

    return { lotesGeoJSON, puntosGeoJSON, recorridoGeoJSON };
  }
}
