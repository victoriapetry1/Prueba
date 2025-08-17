import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class weatherService {

  
  private apiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

   getWeather(lat: number, lon: number): Observable<any> {
    const url = `${this.apiUrl}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&language=es`;
    return this.http.get(url);
  }
}
