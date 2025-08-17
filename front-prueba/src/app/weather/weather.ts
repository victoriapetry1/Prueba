import { Component } from '@angular/core';
import { WeatherService } from '../services/weather'; 
import { CommonModule } from '@angular/common';

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

}
