import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CatalogoBus, CatalogItem } from 'src/app/servicios/catalogo-bus';
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
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.page.html',
  styleUrls: ['./maquinaria.page.scss'],
  standalone: false,
})
export class MaquinariaPage implements OnInit, OnDestroy {
  // ====== PILLS ======
  pills = [
    { key: 'tendencia',  label: 'Ofertas de tendencia' },
    { key: 'relampago',  label: 'Ofertas relámpago' },
    { key: 'favoritos',  label: 'Favoritos de los clientes' },
    { key: 'robusto',    label: 'Uso rudo' },
    { key: 'eficiencia', label: 'Alta eficiencia' },
    { key: 'nuevo',      label: 'Nuevos modelos' },
  ];
  activePill: string = 'tendencia';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  // ====== CHIPS ======
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

  // ====== DATOS ======
  private usingBus = false;
  private firstPage = 20;
  private pageSize  = 18;

  all: Product[] = [];
  private sorted: Product[] = [];
  list: Product[] = [];

  // polling
  private pollId?: any;
  private pollCount = 0;

  constructor(
    private catalog: CatalogoBus,
    private cartSvc: CartService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.all = this.mock(12);
    this.rebuildSortedAndSlice();
    this.hydrateFromCatalog();
    this.startPollingForBus();
  }

  ngOnDestroy(){ this.stopPolling(); }

  async ionViewWillEnter() {
    this.hydrateFromCatalog();
  }

  // ✅ MÉTODO DE CARRITO CORRECTO
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
      icon: 'cart-outline',
    });
    await t.present();
  }

  // ====== MÉTODOS YA EXISTENTES ======
  filter(key: string) { this.active = key; this.rebuildSortedAndSlice(); }

  selectPill(key: string) { this.activePill = key; this.rebuildSortedAndSlice(); }

  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  money(n: number) { return `$${(n || 0).toFixed(2)}`; }

  offPct(p: Product) {
    if (!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
  }

  discount(p: Product) { const pct = this.offPct(p); return pct ? `-${pct}%` : ''; }

  score(p: Product) { return p.rating * 100 + p.reviews + (p.promo ? 250 : 0); }

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

  private rebuildSortedAndSlice() {
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];
    switch (this.activePill) {
      case 'relampago': src = src.filter(p => !!p.compareAt || p.promo); break;
      case 'favoritos': src.sort((a,b)=> (b.reviews-b.reviews)||(b.rating-a.rating)); break;
      case 'tendencia': src.sort((a,b)=> this.score(b)-this.score(a)); break;
      case 'robusto': src = src.filter(p => (p.tags||[]).includes('robusto')); break;
      case 'eficiencia': src = src.filter(p => (p.tags||[]).includes('eficiencia')); break;
      case 'nuevo': src = src.filter(p => (p.tags||[]).includes('nuevo')); break;
    }
    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
  }

  private hydrateFromCatalog() {
    const items = this.catalog.search('', { cat: 'maquinaria', limit: 600 }).items;
    if (!items.length) return;
    this.usingBus = true;
    this.all = items.map(c => this.fromCatalog(c));
    this.rebuildSortedAndSlice();
  }

  private fromCatalog(c: CatalogItem): Product {
    return {
      id: c.id,
      title: c.title,
      image: c.image || 'assets/img/placeholder.png',
      price: c.price ?? 0,
      compareAt: c.compareAt,
      rating: c.rating ?? 4,
      reviews: c.reviews ?? 0,
      sold: '',
      promo: '',
      badge: '',
      category: 'maquinaria',
      tags: c.tags ?? [],
    };
  }

  private mock(n: number): Product[] {
    const cats = ['tractor','riego','dron','fumi','herra','repu','seg'];
    return Array.from({ length: n }).map((_, i) => {
      const id = `M-${Date.now()}-${i}`;
      return {
        id,
        title: `Maquinaria ${i}`,
        image: `https://picsum.photos/seed/${id}/800/800`,
        price: 100 + i,
        compareAt: 120 + i,
        rating: 4,
        reviews: 10,
        category: cats[i % cats.length],
        tags: [],
      };
    });
  }

  private startPollingForBus() {
    this.stopPolling();
    this.pollId = setInterval(() => {
      const had = this.catalog.listAll().length > 0;
      this.hydrateFromCatalog();
      if (had) this.stopPolling();
    }, 800);
  }
  private stopPolling() {
    if (this.pollId) { clearInterval(this.pollId); this.pollId = undefined; }
  }
}
