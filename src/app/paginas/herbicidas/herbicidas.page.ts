import { Component, ViewChild, ElementRef } from '@angular/core';
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
  brand?: 'QSI' | 'AVGUST' | 'OTRA';
  category?: 'pre' | 'post' | 'no_selectivo' | 'selectivo' | 'sistemico' | 'contacto';
  tags?: string[];
};

@Component({
  selector: 'app-herbicidas',
  templateUrl: './herbicidas.page.html',
  styleUrls: ['./herbicidas.page.scss'],
  standalone: false,
})
export class HerbicidasPage {
  // ===== Pills =====
  pills = [
    { key: 'tendencia',   label: 'Más demandados' },
    { key: 'relampago',   label: 'Ofertas relámpago' },
    { key: 'favoritos',   label: 'Favoritos de los clientes' },
    { key: 'residual',    label: 'Alta residualidad' },
    { key: 'rapido',      label: 'Acción rápida' },
    { key: 'organico',    label: 'Biológicos/Orgánicos' },
    { key: 'nuevo',       label: 'Nuevos registros' },
  ];
  activePill: string = 'tendencia';

  // ===== Chips =====
  chips = [
    { key: 'reco',         label: 'Recomendado',     icon: 'assets/img/recoher.png' },
    { key: 'marca_qsi',    label: 'QSI',             icon: 'assets/img/qsiher.png' },
    { key: 'marca_avgust', label: 'AVGUST',          icon: 'assets/img/avgusther.png' },
    { key: 'pre',          label: 'Preemergente',    icon: 'assets/img/pre.png' },
    { key: 'post',         label: 'Posemergente',    icon: 'assets/img/post.png' },
    { key: 'no_selectivo', label: 'No selectivo',    icon: 'assets/img/no-select.png' },
    { key: 'selectivo',    label: 'Selectivo',       icon: 'assets/img/select.png' },
    { key: 'sistemico',    label: 'Sistémico',       icon: 'assets/img/systemicher.png' },
    { key: 'contacto',     label: 'De contacto',     icon: 'assets/img/contacther.png' },
  ];
  active = 'reco';

  // Refs para scroll
  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('chipScroll', { static: false }) chipScroll?: ElementRef<HTMLDivElement>;

  // ===== Estado =====
  private usingBus = false;
  private firstPage = 20;
  private pageSize  = 18;

  all: Product[] = [];
  private sorted: Product[] = [];
  list: Product[] = [];
  page = 0;

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private catalog: CatalogoBus
  ) {
    // 1) Render inmediato con mocks
    this.all = this.mock(24);
    this.rebuildSortedAndSlice();

    // 2) Rehidratar con datos reales
    setTimeout(() => this.hydrateFromCatalog(), 0);
  }

  async ionViewWillEnter() {
    this.hydrateFromCatalog();
  }

  // =========================
  // 🚀 Scroll de sliders
  // =========================
  scrollChips(dir: number) {
    const el = this.chipScroll?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  // =========================
  // 📊 Data desde CatalogoBus
  // =========================
  private hydrateFromCatalog() {
    const byCat = this.catalog.search('', { cat: 'herbicidas', limit: 1200 }).items;

    const byQuery = this.catalog.search(
      'herbicida|glifosato|paraquat|dicamba|2,4-D|metsulfuron|atrazina|bentazona|oxifluorfen|diquat|nicosulfuron|imazapir|imazetapir',
      { limit: 1200 }
    ).items;

    const map = new Map<string, CatalogItem>();
    for (const it of [...byCat, ...byQuery]) map.set(it.id, it);
    const items = Array.from(map.values());

    if (!items.length) return;

    this.usingBus = true;
    this.all = items.map(c => this.fromCatalog(c));
    this.rebuildSortedAndSlice();
  }

  private fromCatalog(c: CatalogItem): Product {
    const tags = (c.tags ?? []).map(t => (t ?? '').toLowerCase());
    const tset = new Set<string>(tags);
    const text = (c.title + ' ' + (c.desc || '')).toLowerCase();

    const subcats = ['pre','post','no_selectivo','selectivo','sistemico','contacto'] as const;
    type Subcat = typeof subcats[number];
    let derived: Subcat | undefined = subcats.find(sc => tset.has(sc));

    if (!derived) {
      if (/(^|\W)(pre|preemerg)/.test(text)) derived = 'pre';
      else if (/(^|\W)(post|posemerg)/.test(text)) derived = 'post';
      else if (/(^|\W)selectiv/.test(text)) derived = 'selectivo';
      else if (/(^|\W)sist[ée]mic/.test(text)) derived = 'sistemico';
      else if (/(^|\W)contact/.test(text)) derived = 'contacto';
      else if (/(^|\W)glifosato|paraquat|glufosinato/.test(text)) derived = 'no_selectivo';
    }
    const category: Product['category'] = derived ?? 'post';

    const b = (c.brand || '').toLowerCase();
    const brand: Product['brand'] =
      b === 'qsi' ? 'QSI' : b === 'avgust' ? 'AVGUST' : (b ? 'OTRA' : undefined);

    const hasRegistro = tags.some(t => t.includes('registro')) && tags.some(t => t.includes('vigente'));

    return {
      id: c.id,
      title: c.title,
      image: c.image || 'assets/img/placeholder.png',
      price: c.price ?? 0,
      compareAt: c.compareAt,
      rating: c.rating ?? 4,
      reviews: c.reviews ?? 0,
      sold: undefined,
      promo: '',
      badge: hasRegistro ? 'Registro vigente' : '',
      brand,
      category,
      tags: c.tags || [],
    };
  }

  // =========================
  // 🔎 Filtros y orden
  // =========================
  selectPill(key: string){ this.activePill = key; this.rebuildSortedAndSlice(); }
  filter(key: string){ this.active = key; this.rebuildSortedAndSlice(); }

  private rebuildSortedAndSlice() {
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || p.promo);
        src.sort((a,b) =>
          (this.offPct(b) - this.offPct(a)) ||
          a.title.localeCompare(b.title) ||
          a.id.localeCompare(b.id)
        );
        break;
      case 'favoritos':
        src.sort((a,b) =>
          (b.reviews - a.reviews) ||
          (b.rating - a.rating) ||
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
      case 'residual':
        src = src.filter(p => (p.tags||[]).some(t => t.toLowerCase() === 'residual'));
        break;
      case 'rapido':
        src = src.filter(p => (p.tags||[]).some(t => t.toLowerCase() === 'rapido'));
        break;
      case 'organico':
        src = src.filter(p =>
          (p.tags||[]).some(t => t.toLowerCase() === 'organico')
        );
        break;
      case 'nuevo':
        src = src.filter(p => (p.tags||[]).some(t => t.toLowerCase() === 'nuevo'));
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

  // =========================
  // ⚙️ Helpers
  // =========================
  money(n:number){ return `$${(n||0).toFixed(2)}`; }
  offPct(p: Product){
    if(!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price)/p.compareAt)*100);
  }
  discount(p: Product){ const pct = this.offPct(p); return pct ? `-${pct}%` : ''; }
  score(p: Product){ return p.rating*100 + p.reviews + (p.promo ? 200 : 0); }

  // =========================
  // 🛒 Carrito
  // =========================
  async addToCart(p: Product){
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price, image: p.image }, 1);
    const t = await this.toastCtrl.create({
      message: 'Herbicida añadido al carrito',
      duration: 1200, color: 'success', position: 'top', icon: 'cart-outline'
    });
    await t.present();
  }

  // =========================
  // 🔄 Infinite scroll
  // =========================
  loadMore(ev: Event){
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

  // =========================
  // 🧪 MOCK
  // =========================
  private mock(n:number): Product[]{
    type Cat = NonNullable<Product['category']>;
    const cats: Cat[] = ['pre','post','no_selectivo','selectivo','sistemico','contacto'];
    const brands: Array<NonNullable<Product['brand']>> = ['QSI','AVGUST'];
    const promos = ['Tiempo limitado','Últimos 2 días',''];
    const tagsPool = ['residual','rapido','organico','nuevo'];

    const namesByCat: Record<Cat, string[]> = {
      pre: ['Pendimetalin', 'S-metolacloro', 'Acetoclor'],
      post: ['2,4-D', 'Dicamba', 'Haloxifop'],
      no_selectivo: ['Glifosato', 'Paraquat', 'Glufosinato'],
      selectivo: ['Metsulfuron', 'Atrazina', 'Bentazona'],
      sistemico: ['Imazapir', 'Imazetapir', 'Nicosulfuron'],
      contacto: ['Carfentrazona', 'Oxifluorfen', 'Diquat'],
    };

    return Array.from({length:n}).map((_, i) => {
      const id = `H-${Date.now()}-${this.page}-${i}`;
      const base = 6 + Math.random()*45;
      const hasCompare = Math.random() > 0.45;
      const rating = Math.floor(Math.random()*2) + 4;
      const sold = Math.random() > 0.5 ? `${(Math.floor(Math.random()*15)+1)}K+` : '';

      const category: Cat = cats[i % cats.length];
      const brand = brands[i % brands.length];
      const tagCount = Math.random()>0.6 ? 2 : 1;
      const tags = Array.from({length:tagCount}).map(() => tagsPool[Math.floor(Math.random()*tagsPool.length)]);

      const name = namesByCat[category][i % namesByCat[category].length];

      return {
        id,
        title: `${name} ${brand} ${100 + i}`,
        image: `https://picsum.photos/seed/${id}/720/720`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*15+6)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random()*5000),
        sold,
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Registro vigente' : '',
        brand,
        category,
        tags,
      };
    });
  }
}
