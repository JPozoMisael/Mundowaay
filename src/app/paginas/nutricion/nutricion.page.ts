import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { CatalogoBus, CatalogItem } from 'src/app/servicios/catalogo-bus';

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
  selector: 'app-nutricion',
  templateUrl: './nutricion.page.html',
  styleUrls: ['./nutricion.page.scss'],
  standalone: false,
})
export class NutricionPage implements OnInit, OnDestroy {
  pills = [
    { key: 'tendencia',   label: 'Más demandados' },
    { key: 'relampago',   label: 'Ofertas relámpago' },
    { key: 'favoritos',   label: 'Favoritos de los clientes' },
    { key: 'alto_brix',   label: 'Alto °Brix' },
    { key: 'floracion',   label: 'Floración y cuaje' },
    { key: 'enraizamiento', label: 'Enraizamiento' },
    { key: 'antiestres',  label: 'Antiestrés' },
    { key: 'nuevo',       label: 'Nuevos lanzamientos' },
  ];
  activePill: string = 'tendencia';

  chips = [
    { key: 'reco',         label: 'Recomendado',      icon: 'assets/chips/reco.svg' },
    { key: 'macro',        label: 'Macronutrientes',  icon: 'assets/chips/macro.svg' },
    { key: 'micro',        label: 'Micronutrientes',  icon: 'assets/chips/micro.svg' },
    { key: 'quelatado',    label: 'Quelatados',       icon: 'assets/chips/chelate.svg' },
    { key: 'aminoacidos',  label: 'Aminoácidos',      icon: 'assets/chips/amino.svg' },
    { key: 'algas',        label: 'Algas/Extractos',  icon: 'assets/chips/seaweed.svg' },
    { key: 'calcio_boro',  label: 'Calcio-Boro',      icon: 'assets/chips/ca-b.svg' },
    { key: 'k_h',          label: 'K-H (maduración)', icon: 'assets/chips/k-h.svg' },
    { key: 'bioestimulante', label: 'Bioestimulantes', icon: 'assets/chips/bio.svg' },
  ];
  active = 'reco';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  private usingBus = false;
  private firstPage = 20;
  private pageSize  = 18;

  all: Product[] = [];
  private sorted: Product[] = [];
  list: Product[] = [];

  private pollId?: any;
  private pollCount = 0;

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private catalog: CatalogoBus
  ) {}

  ngOnInit() {
    this.pullFromBus();
    this.startPollingForBus();
  }
  ngOnDestroy() { this.stopPolling(); }

  private pullFromBus() {
    const { items } = this.catalog.search('', { cat: 'nutricion', limit: 600 });
    if (items.length) {
      this.usingBus = true;
      this.all = items.map((p: CatalogItem) => ({
        id: p.id,
        title: p.title,
        image: p.image || 'assets/img/placeholder.png',
        price: p.price ?? 0,
        compareAt: p.compareAt,
        rating: p.rating ?? 4,
        reviews: p.reviews ?? 0,
        sold: '',
        promo: '',
        badge: (p.tags || []).includes('organico') ? 'Orgánico' : '',
        category: p.category ?? 'nutricion',
        tags: p.tags ?? [],
      }));
    } else if (!this.all.length) {
      this.all = this.mock(12);
    }
    this.rebuildSortedAndSlice();
  }

  private rebuildSortedAndSlice() {
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt);
        src.sort((a,b) => (this.offPct(b) - this.offPct(a)) || a.title.localeCompare(b.title));
        break;
      case 'favoritos':
        src.sort((a,b) => (b.reviews - a.reviews) || (b.rating - a.rating));
        break;
      case 'tendencia':
        src.sort((a,b) => (this.score(b) - this.score(a)));
        break;
      case 'alto_brix':     src = src.filter(p => (p.tags||[]).includes('alto_brix')); break;
      case 'floracion':     src = src.filter(p => (p.tags||[]).includes('floracion') || (p.tags||[]).includes('cuaje')); break;
      case 'enraizamiento': src = src.filter(p => (p.tags||[]).includes('enraizamiento')); break;
      case 'antiestres':    src = src.filter(p => (p.tags||[]).includes('antiestres')); break;
      case 'nuevo':         src = src.filter(p => (p.tags||[]).includes('nuevo')); break;
    }

    if (!src.length && base.length) {
      src = base.slice().sort((a,b) => (this.score(b) - this.score(a)));
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
  }

  selectPill(key: string) { this.activePill = key; this.rebuildSortedAndSlice(); }
  filter(key: string) { this.active = key; this.rebuildSortedAndSlice(); }

  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  loadMore(ev: Event) {
    if (this.usingBus) {
      const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
      this.list = this.sorted.slice(0, nextLen);
      const target = (ev as InfiniteScrollCustomEvent).target as any;
      if (this.list.length >= this.sorted.length) target.disabled = true;
      (ev as InfiniteScrollCustomEvent).target.complete();
      return;
    }

    const extra = this.mock(this.pageSize);
    this.all = [...this.all, ...extra];
    this.sorted = [...this.sorted, ...extra];
    this.list = this.sorted.slice(0, this.list.length + this.pageSize);
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  money(n: number) { return `$${(n || 0).toFixed(2)}`; }
  offPct(p: Product) { if (!p.compareAt || p.compareAt <= p.price) return 0; return Math.round(((p.compareAt - p.price) / p.compareAt) * 100); }
  discount(p: Product) { const pct = this.offPct(p); return pct > 0 ? `-${pct}%` : ''; }
  score(p: Product) { const rr = p.rating * 100 + p.reviews; const hasDiscount = !!p.compareAt && p.compareAt > p.price; return rr + (hasDiscount ? 150 : 0); }

  async addToCart(p: Product) {
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price, image: p.image }, 1);
    const t = await this.toastCtrl.create({ message: 'Añadido al carrito', duration: 1200, color: 'success', position: 'top', icon: 'cart-outline' });
    await t.present();
  }

  private mock(n: number): Product[] {
    const cats = ['macro','micro','quelatado','aminoacidos','algas','calcio_boro','k_h','bioestimulante'];
    const tagsPool = ['alto_brix','floracion','cuaje','enraizamiento','antiestres','nuevo'];
    const promos = ['Tiempo limitado', 'Últimos 2 días', ''];
    return Array.from({ length: n }).map((_, i) => {
      const id = `N-${Date.now()}-${i}`;
      const base = 5 + Math.random() * 60;
      const hasCompare = Math.random() > 0.3;
      const rating = Math.floor(Math.random()*2) + 4;
      const tsel = [tagsPool[Math.floor(Math.random()*tagsPool.length)]];
      return {
        id,
        title: ['Fertilizante Foliar', 'Bioestimulante', 'Quelatado'][i%3] + ' ' + (100+i),
        image: `https://picsum.photos/seed/${id}/640/640`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*15+6)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random()*5000),
        sold: Math.random() > 0.5 ? `${(Math.floor(Math.random()*19)+1)}K+` : '',
        promo: promos[i % promos.length],
        badge: Math.random() > 0.6 ? 'Orgánico' : '',
        category: cats[i % cats.length],
        tags: tsel,
      };
    });
  }

  private startPollingForBus() {
    this.stopPolling();
    this.pollCount = 0;
    this.pollId = setInterval(() => {
      this.pollCount++;
      const had = this.catalog.listAll().length > 0;
      this.pullFromBus();
      if (had || this.pollCount >= 8) this.stopPolling();
    }, 800);
  }
  private stopPolling() {
    if (this.pollId) { clearInterval(this.pollId); this.pollId = undefined; }
  }
}
