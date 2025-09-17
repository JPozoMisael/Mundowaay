import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://www.wixapis.com/auth/v1'; // Base de Auth Wix
  private tokenKey = 'wix_token';

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const saved = localStorage.getItem(this.tokenKey);
    if (saved) {
      this.userSubject.next(JSON.parse(saved));
    }
  }

  /** Login con email/contraseña */
  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem(this.tokenKey, JSON.stringify(res));
        this.userSubject.next(res);
      },
      error: (err) => {
        console.error('Error en login', err);
      }
    });
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
