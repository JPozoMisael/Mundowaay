import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  sold?: string;
  promo?: string;
  badge?: string;
  category?: string; // tractor/riego/dron/...
  tags?: string[];   // relampago, robusto, nuevo, etc.
};

@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.page.html',
  styleUrls: ['./maquinaria.page.scss'],
  standalone: false,
})
export class MaquinariaPage {
  // Pills superiores
  pills = [
    { key: 'tendencia',  label: 'Ofertas de tendencia' },
    { key: 'relampago',  label: 'Ofertas relámpago' },
    { key: 'favoritos',  label: 'Favoritos de los clientes' },
    { key: 'robusto',    label: 'Uso rudo' },
    { key: 'eficiencia', label: 'Alta eficiencia' },
    { key: 'nuevo',      label: 'Nuevos modelos' },
  ];
  activePill: string = 'relampago';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  // Chips redondos
  chips = [
    { key: 'reco',   label: 'Recomendado',            icon: 'assets/chips/reco.svg' },
    { key: 'tractor',label: 'Tractores',              icon: 'assets/chips/tractor.svg' },
    { key: 'riego',  label: 'Riego',                  icon: 'assets/chips/riego.svg' },
    { key: 'dron',   label: 'Drones agrícolas',       icon: 'assets/chips/dron.svg' },
    { key: 'fumi',   label: 'Fumigación / Mochilas',  icon: 'assets/chips/fumi.svg' },
    { key: 'herra',  label: 'Herramientas',           icon: 'assets/chips/tools.svg' },
    { key: 'repu',   label: 'Repuestos',              icon: 'assets/chips/rep.svg' },
    { key: 'seg',    label: 'Seguridad',              icon: 'assets/chips/seg.svg' },
  ];
  active = 'reco';

  all: Product[] = [];
  list: Product[] = [];
  page = 0;

  constructor() {
    this.all = this.mock(24);
    this.applyFilter();
  }

  // Pillbar
  selectPill(key: string) { this.activePill = key; this.applyFilter(); }
  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  // Chips
  filter(key: string) { this.active = key; this.page = 0; this.applyFilter(); }

  // Filtrado/orden
  applyFilter() {
    let src = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || p.promo);
        src.sort((a,b) => (this.offPct(b) - this.offPct(a)));
        break;
      case 'favoritos':
        src.sort((a,b) => (b.reviews - a.reviews) || (b.rating - a.rating));
        break;
      case 'tendencia':
        src.sort((a,b) => (this.score(b) - this.score(a)));
        break;
      case 'robusto':
        src = src.filter(p => (p.tags||[]).includes('robusto'));
        break;
      case 'eficiencia':
        src = src.filter(p => (p.tags||[]).includes('eficiencia'));
        break;
      case 'nuevo':
        src = src.filter(p => (p.tags||[]).includes('nuevo'));
        break;
    }

    this.list = src.slice(0, 20);
  }

  // Helpers
  money(n: number) { return `$${(n || 0).toFixed(2)}`; }
  offPct(p: Product) {
    if (!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
  }
  discount(p: Product) { const pct = this.offPct(p); return pct ? `-${pct}%` : ''; }
  score(p: Product) { return p.rating * 100 + p.reviews + (p.promo ? 250 : 0); }

  addToCart(p: Product) { console.log('ADD CART', p.id); }

  loadMore(ev: Event) {
    this.page++;
    this.all = [...this.all, ...this.mock(18)];
    this.applyFilter();
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  // MOCK de datos
  private mock(n: number): Product[] {
    const cats = ['tractor','riego','dron','fumi','herra','repu','seg'];
    const tagsPool = ['robusto','eficiencia','nuevo'];
    return Array.from({ length: n }).map((_, i) => {
      const id = `M-${Date.now()}-${this.page}-${i}`;
      const base = 50 + Math.random() * 950;    // maquinaria más cara
      const hasCompare = Math.random() > 0.4;
      const rating = Math.floor(Math.random()*2) + 4; // 4..5
      const sold = Math.random() > 0.5 ? `${(Math.floor(Math.random()*9)+1)}K+` : '';
      const promos = ['Tiempo limitado', 'Últimos 2 días', ''];
      const tagCount = Math.random()>0.6 ? 2 : 1;
      const tags = Array.from({length: tagCount}).map(() => tagsPool[Math.floor(Math.random()*tagsPool.length)]);
      const names = ['Atomizador', 'Pulverizador', 'Motobomba', 'Dron agrícola', 'Tractor', 'Cortadora', 'Repuesto'];

      return {
        id,
        title: `${names[i % names.length]} ${100 + i}`,
        image: `https://picsum.photos/seed/${id}/800/800`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*300+100)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random()*5000),
        sold,
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Local' : (Math.random() > 0.7 ? 'Garantía' : ''),
        category: cats[i % cats.length],
        tags,
      };
    });
  }
}
