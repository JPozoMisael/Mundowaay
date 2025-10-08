import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GeneralService } from './general';
// =============================
// 📍 Modelo de datos de ubicación
// =============================
export interface LocationData {
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private location$ = new BehaviorSubject<LocationData | null>(null);

  constructor(private general: GeneralService) {
    // ✅ Cargar ubicación almacenada localmente
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mw_location');
      if (saved) this.location$.next(JSON.parse(saved));
    }
  }

  // =========================================================
  // 🔹 Observable reactivo de ubicación actual
  // =========================================================
  get current$(): Observable<LocationData | null> {
    return this.location$.asObservable();
  }

  // =========================================================
  // 🔹 Obtener el valor actual (sincrónico)
  // =========================================================
  getLocation(): LocationData | null {
    return this.location$.value;
  }

  // =========================================================
  // 🔹 Actualizar la ubicación manualmente (y guardar en local)
  // =========================================================
  setLocation(loc: LocationData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mw_location', JSON.stringify(loc));
    }
    this.location$.next(loc);
  }

  // =========================================================
  // 🔹 Detectar ubicación desde el navegador (geolocalización)
  // =========================================================
  detectLocation(): Observable<LocationData | null> {
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocalización no soportada por el navegador.');
      return of(null);
    }

    return new Observable<LocationData | null>(observer => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const loc: LocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.setLocation(loc);
          observer.next(loc);
          observer.complete();
        },
        error => {
          console.error('❌ Error obteniendo ubicación:', error);
          observer.next(null);
          observer.complete();
        }
      );
    });
  }

  // =========================================================
  // 🔹 Enviar ubicación al backend (opcional)
  // =========================================================
  saveToBackend(loc: LocationData): Observable<any> {
    return this.general.post<any>('location', loc).pipe(
      catchError(err => {
        console.error('❌ Error enviando ubicación al backend:', err);
        return of({ success: false });
      })
    );
  }

  // =========================================================
  // 🔹 Cargar ubicación desde el backend (si hay login)
  // =========================================================
  loadFromBackend(): Observable<LocationData | null> {
    return this.general.get<any>('location').pipe(
      map(res => {
        const loc: LocationData = res?.location || null;
        if (loc) this.setLocation(loc);
        return loc;
      }),
      catchError(err => {
        console.error('❌ Error cargando ubicación desde backend:', err);
        return of(null);
      })
    );
  }
}
