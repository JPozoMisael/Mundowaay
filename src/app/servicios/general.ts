import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  private apiUrl = environment.apiUrl;  

  constructor(private http: HttpClient) {}

  
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headersConfig: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }

  // ================================================
  // 🔹 GET genérico
  // ================================================
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // ================================================
  // 🔹 POST genérico
  // ================================================
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  // ================================================
  // 🔹 PUT genérico
  // ================================================
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  // ================================================
  // 🔹 DELETE genérico
  // ================================================
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  // ================================================
  // 📁 Descarga de archivos (PDF, Excel, CSV, imágenes, etc.)
  // ================================================
  getArchivo(endpoint: string, params?: any, responseType: 'blob' = 'blob'): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      params: httpParams,
      responseType: responseType
    }) as Observable<Blob>;
  }
}
