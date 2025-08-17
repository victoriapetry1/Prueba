import { Component , OnInit} from '@angular/core';
import { weatherService } from '../services/clima.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-panel-clima',
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-clima.html',
  styleUrl: './panel-clima.css'
})
export class PanelClima implements OnInit{
  weatherData: any;
  lat : number = 0;  
  lon : number = 0;

  weatherCodes: Record<number, { icon: string; desc: string; bg: string }> = {
    0: { icon: '☀️', desc: 'Despejado', bg: 'sunny' },
    1: { icon: '🌤️', desc: 'Mayormente despejado', bg: 'sunny' },
    2: { icon: '⛅', desc: 'Parcialmente nublado', bg: 'cloudy' },
    3: { icon: '☁️', desc: 'Nublado', bg: 'cloudy' },
    61: { icon: '🌦️', desc: 'Lluvia ligera', bg: 'rainy' },
    63: { icon: '🌧️', desc: 'Lluvia moderada', bg: 'rainy' },
    65: { icon: '⛈️', desc: 'Tormenta', bg: 'storm' }
  };


  constructor(private weatherService: weatherService) {}

  ngOnInit() {
    this.loadWeather();
  }

  loadWeather() {
    this.weatherService.getWeather(this.lat, this.lon).subscribe({
      next: (data) => {
        this.weatherData = data.current_weather;
        console.log(data);
      },
      error: (err) => {
        console.error('Error obteniendo clima:', err);
      }
    });
  }
   getWeatherInfo() {
    return this.weatherCodes[this.weatherData?.weathercode] || { icon: '❓', desc: 'Desconocido', bg: 'default' };
  }
}

