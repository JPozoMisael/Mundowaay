import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private clientId = 'TU_CLIENT_ID';  // el que ya tienes en Wix Headless
  private tokenKey = 'wix_token';

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  /** Login con email/contraseña */
  login(email: string, password: string) {
    const url = 'https://www.wixapis.com/oauth/token';

    const body = {
      grant_type: 'password',
      client_id: this.clientId,
      username: email,
      password: password,
    };

    return this.http.post<any>(url, body).subscribe({
      next: (res) => {
        localStorage.setItem(this.tokenKey, JSON.stringify(res));
        this.fetchUser(res.access_token);
      },
      error: (err) => {
        console.error('Error en login:', err);
        alert('No se pudo iniciar sesión');
      }
    });
  }

  /** Obtener perfil de usuario */
  private fetchUser(token: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    this.http.get<any>('https://www.wixapis.com/members/v1/members/me', { headers })
      .subscribe({
        next: (user) => {
          this.userSubject.next(user);
        },
        error: (err) => {
          console.error('Error al obtener perfil:', err);
        }
      });
  }

  /** Cargar usuario al abrir app */
  private loadUser() {
    const saved = localStorage.getItem(this.tokenKey);
    if (saved) {
      const t = JSON.parse(saved);
      this.fetchUser(t.access_token);
    }
  }

  /** Logout */
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  /** Usuario actual */
  get currentUser() {
    return this.userSubject.value;
  }
}
