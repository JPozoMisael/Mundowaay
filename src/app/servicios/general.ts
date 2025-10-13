import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    // ✅ Detecta automáticamente si está en local o producción
    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    this.apiUrl = isLocal
      ? (environment.localApiUrl || 'http://localhost:4000/api')
      : (environment.apiUrl || 'https://www.mundoway.com/api');

    console.log(`[GeneralService] API URL activa → ${this.apiUrl}`);
  }

  // ============================================================
  // 🔐 Construcción dinámica de cabeceras (headers)
  // ============================================================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headersConfig: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }

  // ============================================================
  // 🔹 GET genérico
  // ============================================================
  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] != null && params[key] !== '')
          httpParams = httpParams.set(key, params[key]);
      });
    }

    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`[GeneralService][GET] → ${url}`, params || '');
    return this.http.get<T>(url, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // ============================================================
  // 🔹 POST genérico
  // ============================================================
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`[GeneralService][POST] → ${url}`, data);
    return this.http.post<T>(url, data, { headers: this.getHeaders() });
  }

  // ============================================================
  // 🔹 PUT genérico
  // ============================================================
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`[GeneralService][PUT] → ${url}`, data);
    return this.http.put<T>(url, data, { headers: this.getHeaders() });
  }

  // ============================================================
  // 🔹 DELETE genérico
  // ============================================================
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`[GeneralService][DELETE] → ${url}`);
    return this.http.delete<T>(url, { headers: this.getHeaders() });
  }

  // ============================================================
  // 📁 Descarga de archivos (PDF, Excel, CSV, imágenes, etc.)
  // ============================================================
  getArchivo(
    endpoint: string,
    params?: Record<string, any>,
    responseType: 'blob' = 'blob'
  ): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    const url = `${this.apiUrl}/${endpoint}`;
    console.log(`[GeneralService][GET-ARCHIVO] → ${url}`);
    return this.http.get(url, {
      headers: this.getHeaders(),
      params: httpParams,
      responseType
    }) as Observable<Blob>;
  }
}
