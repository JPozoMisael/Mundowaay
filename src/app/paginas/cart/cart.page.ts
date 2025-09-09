import { Component } from '@angular/core';
import { CartService } from 'src/app/servicios/cart';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage {
  items$ = this.cart.items$;
  subtotal$ = this.cart.subtotal$;

  constructor(private cart: CartService) {}

  money(n: number){ return `$${(n||0).toFixed(2)}`; }
  inc(id: string){ this.cart.inc(id, 1); }
  dec(id: string){ this.cart.dec(id, 1); }
  remove(id: string){ this.cart.remove(id); }
  clear(){ this.cart.clear(); }
}
