import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

type LocalProduct = Product & {
  compareAt?: number;
  rating?: number;
  reviews?: number;
  sold?: string;
  promo?: string;
  badge?: string;
  category?: string;
  tags?: string[];
};

@Component({
  selector: 'app-acaricidas',
  templateUrl: './acaricidas.page.html',
  styleUrls: ['./acaricidas.page.scss'],
  standalone: false,
})
export class AcaricidasPage {
  // Chips circulares de subcategorías
  chips = [
    { key: 'reco',      label: 'Recomendado',  icon: 'assets/img/recoacar.png' },
    { key: 'citricos',  label: 'Cítricos',     icon: 'assets/img/citricos.png' },
    { key: 'frutales',  label: 'Frutales',     icon: 'assets/img/frutales.png' },
    { key: 'hort',      label: 'Hortalizas',   icon: 'assets/img/hortacar.png' },
    { key: 'orn',       label: 'Ornamentales', icon: 'assets/img/orn.png' },
  ];
  active = 'reco';

  // Pills tipo Temu/Amazon
  pills = [
    { key: 'tendencia',   label: 'Ofertas de tendencia' },
    { key: 'relampago',   label: 'Ofertas relámpago' },
    { key: 'favoritos',   label: 'Favoritos de los clientes' },
    { key: 'rendimiento', label: 'Alto rendimiento' },
    { key: 'organico',    label: 'Orgánico' },
    { key: 'trazabilidad',label:'Trazabilidad certificada' },
    { key: 'nueva',       label: 'Nuevos registros' },
  ];
  activePill = 'tendencia';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  // Estado p/orden estable + paginado
  private firstPage = 24;
  private pageSize  = 18;

  all: LocalProduct[] = [];
  private sorted: LocalProduct[] = [];
  list: LocalProduct[] = [];
  page = 0;

  constructor(
    private cartSvc: CartService,
    private productsSvc: ProductsService
  ) {
    // Cargar productos iniciales (solo acaricidas)
    this.productsSvc.listAll().subscribe((items) => {
      this.all = items
        .filter(p => p.title.toLowerCase().includes('acaricida') || (p.tags||[]).includes('acaricida'))
        .map(p => this.mapToLocal(p));

      // fallback con mocks si no hay productos reales
      if (!this.all.length) {
        this.all = this.mock(28);
      }

      this.rebuildSortedAndSlice();
    });
  }

  // ===== Mapear producto remoto a LocalProduct =====
  private mapToLocal(p: Product): LocalProduct {
    return {
      ...p,
      price: p.price ?? 0,     // 🔹 asegura number
      compareAt: p.compareAt ?? undefined,
      rating: 4,
      reviews: Math.floor(Math.random() * 500),
      promo: '',
      badge: '',
      category: 'acaricidas',
      tags: p.tags ?? []
    };
  }

  // ===== Eventos de UI =====
  selectPill(key: string){ this.activePill = key; this.rebuildSortedAndSlice(); }
  filter(key: string){ this.active = key; this.page = 0; this.rebuildSortedAndSlice(); }

  scrollPills(dir: number){
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  addToCart(p: LocalProduct){
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price ?? 0, image: p.imageUrl || 'assets/img/placeholder.png' }, 1).subscribe();
  }

  // ===== Orden estable + slice =====
  private rebuildSortedAndSlice(){
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || !!p.promo);
        src.sort((a,b) =>
          (this.offPct(b) - this.offPct(a)) ||
          a.title.localeCompare(b.title) ||
          a.id.localeCompare(b.id)
        );
        break;
      case 'favoritos':
        src.sort((a,b) =>
          (b.reviews! - a.reviews!) ||
          (b.rating! - a.rating!) ||
          a.title.localeCompare(b.title) ||
          a.id.localeCompare(b.id)
        );
        break;
      case 'tendencia':
        src.sort((a,b) =>
          (this.score(b) - this.score(a)) ||
          a.title.localeCompare(b.title) ||
          a.id.localeCompare(b.id)
        );
        break;
      case 'organico':
        src = src.filter(p => (p.tags||[]).some(t => (t || '').toLowerCase() === 'organico'));
        break;
      case 'rendimiento':
        src = src.filter(p => (p.tags||[]).some(t => (t || '').toLowerCase() === 'rendimiento'));
        break;
      case 'trazabilidad':
        src = src.filter(p => (p.tags||[]).some(t => (t || '').toLowerCase() === 'trazabilidad'));
        break;
      case 'nueva':
        src = src.filter(p => (p.tags||[]).some(t => (t || '').toLowerCase() === 'nuevo'));
        break;
    }

    if (!src.length && base.length) {
      src = base.slice().sort((a,b) =>
        (this.score(b) - this.score(a)) ||
        a.title.localeCompare(b.title) ||
        a.id.localeCompare(b.id)
      );
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
  }

  // ===== Helpers UI =====
  money(n: number | undefined){ return `$${((n ?? 0)).toFixed(2)}`; }

  offPct(p: LocalProduct){
    const price = p.price ?? 0;
    if (!p.compareAt || p.compareAt <= price) return 0;
    return Math.round(((p.compareAt - price) / p.compareAt) * 100);
  }

  discount(p: LocalProduct){
    const pct = this.offPct(p);
    return pct > 0 ? `-${pct}%` : '';
  }

  score(p: LocalProduct){
    const rr = (p.rating ?? 0) * 100 + (p.reviews ?? 0);
    const promo = p.promo ? 250 : 0;
    return rr + promo;
  }

  // ===== Infinite scroll =====
  loadMore(ev: Event){
    const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
    this.list = this.sorted.slice(0, nextLen);
    const target = (ev as InfiniteScrollCustomEvent).target as any;
    if (this.list.length >= this.sorted.length) target.disabled = true;
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  // ===== MOCK =====
  private mock(n: number): LocalProduct[]{
    return Array.from({length:n}).map((_,i)=>{
      const id = `A-${Date.now()}-${this.page}-${i}`;
      const base = 7 + Math.random()*70;
      const hasCompare = Math.random() > 0.45;
      return {
        id,
        title: `Acaricida demo ${i+1}`,
        imageUrl: `https://picsum.photos/seed/${id}/640/640`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*18+8)).toFixed(2)) : undefined,
        rating: 4,
        reviews: Math.floor(Math.random()*500),
        sold: '',
        promo: '',
        badge: '',
        category: 'acaricidas',
        tags: [],
      };
    });
  }
}
