import { Component } from '@angular/core';
import { CartService } from 'src/app/servicios/cart';
import { map } from 'rxjs/operators';

type RecItem = { id: string; title: string; image: string; price: number; compareAt?: number; badge?: string; };

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage {
  items$ = this.cart.items$;          // [{ id,title,image,price,qty }]
  subtotal$ = this.cart.subtotal$;    // number
  count$ = this.items$.pipe(map(list => list.reduce((n, it:any) => n + (it.qty || 1), 0)));
  loading = false;

  // Recomendaciones (opcionales)
  recs: RecItem[] = Array.from({length: 8}).map((_,i) => {
    const id = `R-${Date.now()}-${i}`;
    const price = Number((5 + Math.random()*40).toFixed(2));
    const hasBefore = Math.random() > 0.5;
    return {
      id,
      title: ['Semilla Híbrida','Fungicida','Herbicida','Bioestimulante'][i%4] + ' ' + (200+i),
      image: `https://picsum.photos/seed/${id}/640/640`,
      price,
      compareAt: hasBefore ? Number((price + (Math.random()*12+5)).toFixed(2)) : undefined,
      badge: Math.random() > 0.7 ? 'Local' : (Math.random() > 0.7 ? 'Orgánico' : undefined),
    };
  });

  constructor(private cart: CartService) {}

  money(n: number){ return `$${(n||0).toFixed(2)}`; }
  inc(id: string){ this.cart.inc(id, 1); }
  dec(id: string){ this.cart.dec(id, 1); }
  remove(id: string){ this.cart.remove(id); }
  clear(){ this.cart.clear(); }

  // si tu CartService tiene add(): úsalo para “recomendados”
  addRec(p: RecItem){
    // @ts-ignore
    if (typeof this.cart.add === 'function') this.cart.add({ id:p.id, title:p.title, image:p.image, price:p.price }, 1);
  }

  // botón “Hacer pedido”
  async checkout(){
    this.loading = true;
    // aquí conectarás backend/pasarela; por ahora solo simulamos
    setTimeout(() => this.loading = false, 800);
  }
}
