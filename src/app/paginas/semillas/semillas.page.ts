import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';

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
  category?: string;
  tags?: string[];
};

@Component({
  selector: 'app-semillas',
  templateUrl: './semillas.page.html',
  styleUrls: ['./semillas.page.scss'],
  standalone: false,
})
export class SemillasPage {
  pills = [
    { key: 'tendencia',  label: 'Ofertas de tendencia' },
    { key: 'relampago',  label: 'Ofertas relámpago' },
    { key: 'favoritos',  label: 'Favoritos de los clientes' },
    { key: 'rendimiento',label: 'Alto rendimiento' },
    { key: 'organico',   label: 'Orgánico' },
    { key: 'trazabilidad',label:'Trazabilidad certificada' },
    { key: 'nueva',      label: 'Nuevas variedades' },
  ];
  activePill: string = 'relampago';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  chips = [
    { key: 'reco',  label: 'Recomendado', icon: 'assets/chips/reco.svg' },
    { key: 'maiz',  label: 'Maíz',        icon: 'assets/chips/maiz.svg' },
    { key: 'arroz', label: 'Arroz',       icon: 'assets/chips/arroz.svg' },
    { key: 'trigo', label: 'Trigo',       icon: 'assets/chips/trigo.svg' },
    { key: 'soja',  label: 'Soja',        icon: 'assets/chips/soja.svg' },
    { key: 'hort',  label: 'Hortalizas',  icon: 'assets/chips/hort.svg' },
  ];
  active = 'reco';

  all: Product[] = [];
  list: Product[] = [];
  page = 0;

  constructor(
    private cartSvc: CartService,       // 👈 inyecta el carrito
    private toastCtrl: ToastController, // 👈 para feedback
  ) {
    this.all = this.mock(24);
    this.applyFilter();
  }

  selectPill(key: string) {
    this.activePill = key;
    this.applyFilter();
  }
  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  filter(key: string) {
    this.active = key;
    this.page = 0;
    this.applyFilter();
  }

  applyFilter() {
    let src = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || p.promo?.length);
        src.sort((a,b) => (this.offPct(b) - this.offPct(a)));
        break;
      case 'favoritos':
        src.sort((a,b) => (b.reviews - a.reviews) || (b.rating - a.rating));
        break;
      case 'tendencia':
        src.sort((a,b) => (this.score(b) - this.score(a)));
        break;
      case 'organico':
        src = src.filter(p => (p.tags||[]).includes('organico'));
        break;
      case 'rendimiento':
        src = src.filter(p => (p.tags||[]).includes('rendimiento'));
        break;
      case 'trazabilidad':
        src = src.filter(p => (p.tags||[]).includes('trazabilidad'));
        break;
      case 'nueva':
        src = src.filter(p => (p.tags||[]).includes('nuevo'));
        break;
    }

    this.list = src.slice(0, 20);
  }

  money(n: number) { return `$${(n || 0).toFixed(2)}`; }
  offPct(p: Product) {
    if (!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
    }
  discount(p: Product) {
    const pct = this.offPct(p);
    return pct > 0 ? `-${pct}%` : '';
  }
  score(p: Product) {
    const rr = p.rating * 100 + p.reviews;
    const promo = p.promo ? 250 : 0;
    return rr + promo;
  }

  // ✅ Añadir al carrito con toast
  async addToCart(p: Product) {
    this.cartSvc.add(
      { id: p.id, title: p.title, price: p.price, image: p.image },
      1
    );
    const t = await this.toastCtrl.create({
      message: 'Añadido al carrito',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline'
    });
    await t.present();
  }

  loadMore(ev: Event) {
    this.page++;
    this.all = [...this.all, ...this.mock(18)];
    this.applyFilter();
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  private mock(n: number): Product[] {
    const cats = ['maiz','arroz','trigo','soja','hort'];
    const tagsPool = ['organico','rendimiento','trazabilidad','nuevo'];
    return Array.from({ length: n }).map((_, i) => {
      const id = `S-${Date.now()}-${this.page}-${i}`;
      const base = 5 + Math.random() * 60;
      const hasCompare = Math.random() > 0.45;
      const rating = Math.floor(Math.random()*2) + 4;
      const sold = Math.random() > 0.5 ? `${(Math.floor(Math.random()*19)+1)}K+` : '';
      const promos = ['Tiempo limitado', 'Últimos 2 días', ''];
      const tcount = Math.random()>0.6 ? 2 : 1;
      const tsel = Array.from({length:tcount}).map(() => tagsPool[Math.floor(Math.random()*tagsPool.length)]);
      return {
        id,
        title: ['Semilla Híbrida', 'Semilla Certificada', 'Semilla Tratada'][i%3] + ' ' + (100 + i),
        image: `https://picsum.photos/seed/${id}/640/640`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*15+6)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random()*5000),
        sold,
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Orgánico' : (Math.random() > 0.7 ? 'Local' : ''),
        category: cats[i % cats.length],
        tags: tsel,
      };
    });
  }
}
