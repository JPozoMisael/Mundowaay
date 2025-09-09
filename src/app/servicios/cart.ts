import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

const STORAGE_KEY = 'mw_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items$ = new BehaviorSubject<CartItem[]>(this.load());
  readonly items$ = this._items$.asObservable();

  // derivados
  readonly count$   = this.items$.pipe(map(list => list.reduce((a, i) => a + i.qty, 0)));
  readonly subtotal$ = this.items$.pipe(map(list => list.reduce((a, i) => a + i.price * i.qty, 0)));

  /** Añade o incrementa */
  add(item: Omit<CartItem, 'qty'>, qty = 1) {
    const list = [...this._items$.value];
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = { ...list[idx], qty: list[idx].qty + qty };
    else list.unshift({ ...item, qty });
    this.commit(list);
  }

  inc(id: string, step = 1) {
    const list = this._items$.value.map(i => i.id === id ? { ...i, qty: i.qty + step } : i);
    this.commit(list);
  }

  dec(id: string, step = 1) {
    const list = this._items$.value
      .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - step) } : i);
    this.commit(list);
  }

  remove(id: string) {
    this.commit(this._items$.value.filter(i => i.id !== id));
  }

  clear() { this.commit([]); }

  // ------ helpers ------
  private commit(list: CartItem[]) {
    this._items$.next(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
}
