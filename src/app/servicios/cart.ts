import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { GeneralService } from './general';

// =============================
// 🛒 Modelo del Item del Carrito
// =============================
export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  // =======================================
  // 🔹 Estado reactivo del carrito (local)
  // =======================================
  private _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items$.asObservable();

  readonly count$ = this.items$.pipe(
    map(list => list.reduce((a, i) => a + i.qty, 0))
  );

  readonly subtotal$ = this.items$.pipe(
    map(list => list.reduce((a, i) => a + i.price * i.qty, 0))
  );

  constructor(private general: GeneralService) {
    this.loadCart().subscribe(); // 🔹 Cargar carrito al iniciar
  }

  // ============================================================
  // 🔹 Cargar carrito desde backend Node.js
  // ============================================================
  loadCart(): Observable<CartItem[]> {
    return this.general.get<any>('cart').pipe(
      map(res => res?.cart || []),
      tap(cart => this._items$.next(cart)),
      catchError(err => {
        console.error('❌ Error cargando carrito:', err);
        this._items$.next([]);
        return of([]);
      })
    );
  }

  // ============================================================
  // 🔹 Añadir producto al carrito
  // ============================================================
  add(item: Omit<CartItem, 'qty'>, qty = 1): Observable<any> {
    const payload = { ...item, qty };
    return this.general.post<any>('cart', payload).pipe(
      tap(res => this._items$.next(res.cart || [])),
      catchError(err => {
        console.error('❌ Error añadiendo producto:', err);
        return of({ success: false });
      })
    );
  }

  // ============================================================
  // 🔹 Actualizar cantidad
  // ============================================================
  updateQty(id: string, qty: number): Observable<any> {
    const payload = { id, qty };
    return this.general.put<any>('cart', payload).pipe(
      tap(res => this._items$.next(res.cart || [])),
      catchError(err => {
        console.error('❌ Error actualizando cantidad:', err);
        return of({ success: false });
      })
    );
  }

  // ============================================================
  // 🔹 Eliminar producto del carrito
  // ============================================================
  remove(id: string): Observable<any> {
    return this.general.delete<any>(`cart/${id}`).pipe(
      tap(res => this._items$.next(res.cart || [])),
      catchError(err => {
        console.error('❌ Error eliminando producto:', err);
        return of({ success: false });
      })
    );
  }

  // ============================================================
  // 🔹 Vaciar carrito completo
  // ============================================================
  clear(): Observable<any> {
    return this.general.delete<any>('cart').pipe(
      tap(() => this._items$.next([])),
      catchError(err => {
        console.error('❌ Error vaciando carrito:', err);
        return of({ success: false });
      })
    );
  }
}
