import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GeneralService } from './general';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private clientId = 'cd1d1270-ef45-49c0-90dc-cb2bdb11d5fd';  // ✅ Tu client_id de Wix Headless
  private tokenKey = 'wix_token';

  private userSubject = new BehaviorSubject<any>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(private general: GeneralService) {
    this.loadUser();
  }

  // ===========================================================
  // 🔹 Login con email/contraseña (Wix OAuth2 Password Grant)
  // ===========================================================
  login(email: string, password: string): Observable<any> {
    const url = 'https://www.wixapis.com/oauth/token';
    const body = {
      grant_type: 'password',
      client_id: this.clientId,
      username: email,
      password: password,
    };

    return this.general.post<any>(url, body).pipe(
      tap(res => {
        if (res.access_token) {
          localStorage.setItem(this.tokenKey, JSON.stringify(res));
          this.fetchUser(res.access_token);
        }
      }),
      catchError(err => {
        console.error('❌ Error en login:', err);
        alert('No se pudo iniciar sesión. Verifica tus credenciales.');
        return of(null);
      })
    );
  }

  // ===========================================================
  // 🔹 Obtener perfil del usuario desde Wix Members
  // ===========================================================
  private fetchUser(token: string): void {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.general
      .get<any>('https://www.wixapis.com/members/v1/members/me', { headers })
      .pipe(
        tap(user => {
          this.userSubject.next(user);
        }),
        catchError(err => {
          console.error('❌ Error obteniendo perfil:', err);
          this.logout();
          return of(null);
        })
      )
      .subscribe();
  }

  // ===========================================================
  // 🔹 Cargar usuario guardado al abrir la app
  // ===========================================================
  private loadUser(): void {
    const saved = localStorage.getItem(this.tokenKey);
    if (saved) {
      const t = JSON.parse(saved);
      if (t.access_token) {
        this.fetchUser(t.access_token);
      }
    }
  }

  // ===========================================================
  // 🔹 Logout (borrar sesión local)
  // ===========================================================
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }

  // ===========================================================
  // 🔹 Usuario actual (valor sincrónico)
  // ===========================================================
  get currentUser(): any {
    return this.userSubject.value;
  }

  // ===========================================================
  // 🔹 Token actual
  // ===========================================================
  get token(): string | null {
    const saved = localStorage.getItem(this.tokenKey);
    if (saved) {
      const t = JSON.parse(saved);
      return t.access_token || null;
    }
    return null;
  }

  // ===========================================================
  // 🔹 Verificar si el usuario está autenticado
  // ===========================================================
  isLoggedIn(): boolean {
    return !!this.token;
  }

  // ===========================================================
  // 🔹 (Opcional) Login alternativo mediante backend propio
  // ===========================================================
  loginViaBackend(email: string, password: string): Observable<any> {
    // Esto usa tu API Node.js si decides tener autenticación local.
    return this.general.post<any>('auth/login', { email, password }).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem(this.tokenKey, JSON.stringify(res));
          this.userSubject.next(res.user);
        }
      }),
      catchError(err => {
        console.error('❌ Error en login backend:', err);
        return of(null);
      })
    );
  }
}
