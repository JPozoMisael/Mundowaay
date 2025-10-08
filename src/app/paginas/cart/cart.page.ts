import { Component } from '@angular/core';
import { CartService } from 'src/app/servicios/cart';
import { map } from 'rxjs/operators';

type RecItem = { 
  id: string; 
  title: string; 
  image: string; 
  price: number; 
  compareAt?: number; 
  badge?: string; 
};

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage {
  items$ = this.cart.items$;          
  subtotal$ = this.cart.subtotal$;    
  count$ = this.items$.pipe(map(list => list.reduce((n, it:any) => n + (it.qty || 1), 0)));
  loading = false;

  // Recomendaciones (simuladas)
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

  money(n: number){ 
    return `$${(n||0).toFixed(2)}`; 
  }

  // 🔹 Incrementar cantidad
  inc(id: string, currentQty: number){ 
    this.cart.updateQty(id, currentQty + 1).subscribe(); 
  }

  // 🔹 Decrementar cantidad (mínimo 1)
  dec(id: string, currentQty: number){ 
    this.cart.updateQty(id, Math.max(1, currentQty - 1)).subscribe(); 
  }

  // 🔹 Eliminar un producto
  remove(id: string){ 
    this.cart.remove(id).subscribe(); 
  }

  // 🔹 Vaciar carrito
  clear(){ 
    this.cart.clear().subscribe(); 
  }

  // 🔹 Añadir producto recomendado
  addRec(p: RecItem){
    this.cart.add(
      { id:p.id, title:p.title, image:p.image, price:p.price }, 
      1
    ).subscribe();
  }

  // 🔹 Botón de checkout (simulación)
  async checkout(){
    this.loading = true;
    setTimeout(() => this.loading = false, 800);
  }
}
