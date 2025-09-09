import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { ElementRef, ViewChild } from '@angular/core';

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  compareAt?: number;
  rating: number;   // 0..5
  reviews: number;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage {
  @ViewChild('stripEl', { static: false }) stripEl?: ElementRef<HTMLDivElement>;
  banners = [
    { img: 'assets/banners/maiz-1.jpg', title: 'Compra fácil y seguro', subtitle: 'Ofertas para productores' },
    { img: 'assets/banners/maiz-2.jpg', title: 'Temporada de siembra', subtitle: 'Descuentos limitados' },
  ];

  flashDeals: Product[] = [];
  products: Product[] = [];
  private page = 0;

  constructor() {
    this.flashDeals = this.mock(10);
    this.products = this.mock(20);
  }

  // === Helpers que faltaban ===
  money(n: number) { return `$${(n || 0).toFixed(2)}`; }
  discount(p: Product) {
    if (!p.compareAt || p.compareAt <= p.price) return '';
    const pct = Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
    return `-${pct}%`;
  }

  addToCart(p: Product) { console.log('ADD TO CART', p.id); }

  async loadMore(ev: Event) {
    this.page++;
    this.products = [...this.products, ...this.mock(12)];
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  private mock(n: number): Product[] {
    return Array.from({ length: n }).map((_, i) => {
      const id = `P${this.page}-${i}`;
      const base = 2 + Math.random() * 50;
      const hasCompare = Math.random() > 0.5;
      return {
        id,
        title: ['Semilla Híbrida', 'Insecticida', 'Fertilizante', 'Herbicida', 'Maquinaria'][i % 5] + ' ' + (100 + i),
        image: `https://picsum.photos/seed/${id}/480/480`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*10+3)).toFixed(2)) : undefined,
        rating: Math.floor(Math.random() * 3) + 3, // 3..5
        reviews: Math.floor(Math.random() * 3000),
      };
    });
  }
  stripItems = Array.from({ length: 10 }).map((_, i) => ({
    title: 'Recomendado ' + (i + 1),
    img: `https://picsum.photos/seed/strip-${i}/720/540`
  }));

  scrollStrip(dir: number) {
    const el = this.stripEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  // ====== TILES (4 por fila) ======
  tiles = [
    {
      title: 'Conéctate con electrónicos',
      link: '/c/electronicos',
      imgs: [
        { src: 'https://picsum.photos/seed/a1/300/220', alt: 'Auriculares' },
        { src: 'https://picsum.photos/seed/a2/300/220', alt: 'Tabletas' },
        { src: 'httpsum.photos/seed/a3/300/220'.replace('httpsum','https://picsum'), alt: 'Juegos' },
        { src: 'https://picsum.photos/seed/a4/300/220', alt: 'Altavoces' },
      ],
      cta: 'Ver más'
    },
    {
      title: 'Mejora tu rutina de belleza',
      link: '/c/belleza',
      imgs: [
        { src: 'https://picsum.photos/seed/b1/300/220', alt: 'Maquillaje' },
        { src: 'https://picsum.photos/seed/b2/300/220', alt: 'Brochas' },
        { src: 'https://picsum.photos/seed/b3/300/220', alt: 'Esponjas' },
        { src: 'https://picsum.photos/seed/b4/300/220', alt: 'Espejos' },
      ],
      cta: 'Más información'
    },
    {
      title: 'Relojes favoritos',
      link: '/c/relojes',
      imgs: [
        { src: 'https://picsum.photos/seed/c1/300/220', alt: 'Mujeres' },
        { src: 'https://picsum.photos/seed/c2/300/220', alt: 'Hombres' },
        { src: 'https://picsum.photos/seed/c3/300/220', alt: 'Niñas' },
        { src: 'https://picsum.photos/seed/c4/300/220', alt: 'Niños' },
      ],
      cta: 'Descubre más'
    },
    {
      title: 'Mejora tu PC aquí',
      link: '/c/pc',
      imgs: [
        { src: 'https://picsum.photos/seed/d1/300/220', alt: 'Portátiles' },
        { src: 'https://picsum.photos/seed/d2/300/220', alt: 'Equipo de PC' },
        { src: 'https://picsum.photos/seed/d3/300/220', alt: 'Discos duros' },
        { src: 'https://picsum.photos/seed/d4/300/220', alt: 'Monitores' },
      ],
      cta: 'Ver más'
    },
  ];

}
