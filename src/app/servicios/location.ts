import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LocationData {
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private location$ = new BehaviorSubject<LocationData | null>(null);

  constructor() {
    const saved = localStorage.getItem('mw_location');
    if (saved) this.location$.next(JSON.parse(saved));
  }

  get current$() {
    return this.location$.asObservable();
  }

  setLocation(loc: LocationData) {
    localStorage.setItem('mw_location', JSON.stringify(loc));
    this.location$.next(loc);
  }

  getLocation(): LocationData | null {
    return this.location$.value;
  }
}
