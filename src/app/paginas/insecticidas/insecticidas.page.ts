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
  brand?: 'QSI' | 'AVGUST';
  category?: 'contacto' | 'sistemico' | 'cebos' | 'biologico';
  tags?: string[];
};

@Component({
  selector: 'app-insecticidas',
  templateUrl: './insecticidas.page.html',
  styleUrls: ['./insecticidas.page.scss'],
  standalone: false,
})
export class InsecticidasPage implements OnInit, OnDestroy {
  // Pills
  pills = [
    { key: 'tendencia',   label: 'Más demandados' },
    { key: 'relampago',   label: 'Ofertas relámpago' },
    { key: 'favoritos',   label: 'Favoritos de los clientes' },
    { key: 'residual',    label: 'Alta residualidad' },
    { key: 'bajo_olor',   label: 'Bajo olor' },
    { key: 'organico',    label: 'Biológicos/Orgánicos' },
    { key: 'nuevo',       label: 'Nuevos registros' },
  ];
  activePill: string = 'tendencia';

  // Chips
  chips = [
    { key: 'reco',      label: 'Recomendado',         icon: 'assets/chips/reco.svg' },
    { key: 'marca_qsi', label: 'QSI',                 icon: 'assets/chips/qsi.svg' },
    { key: 'marca_avg', label: 'AVGUST',              icon: 'assets/chips/avgust.svg' },
    { key: 'contacto',  label: 'De contacto',         icon: 'assets/chips/contact.svg' },
    { key: 'sistemico', label: 'Sistémicos',          icon: 'assets/chips/systemic.svg' },
    { key: 'cebos',     label: 'Cebos',               icon: 'assets/chips/bait.svg' },
    { key: 'biologico', label: 'Biológicos',          icon: 'assets/chips/bio.svg' },
  ];
  active = 'reco';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  // Estado
  private usingBus = false;
  private firstPage = 20;
  private pageSize  = 18;

  all: Product[] = [];
  private sorted: Product[] = [];
  list: Product[] = [];

  // Poll corto para esperar el bus
  private pollId?: any;
  private pollCount = 0;

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private catalog: CatalogoBus
  ) {}

  ngOnInit() {
    // 1) mocks para render inmediato
    this.all = this.mock(12);
    this.rebuildSortedAndSlice();

    // 2) intenta hidratar desde el índice global (Wix)
    this.hydrateFromCatalog();
    this.startPollingForBus();
  }

  ngOnDestroy(){ this.stopPolling(); }

  async ionViewWillEnter() { this.hydrateFromCatalog(); }

  /** Lee del índice global y reemplaza los mocks si hay data real */
  private hydrateFromCatalog() {
    // por categoría de página
    const byCat = this.catalog.search('', { cat: 'insecticidas', limit: 600 }).items;

    // refuerzo por keywords (si algún item aún no tiene cat)
    const byQuery = this.catalog.search(
      'insecticida|cebo|cipermetrina|lambda|imidacloprid|tiametoxam|clorantraniliprol|beauveria|bacillus',
      { limit: 600 }
    ).items;

    const map = new Map<string, CatalogItem>();
    for (const it of [...byCat, ...byQuery]) map.set(it.id, it);
    const items = Array.from(map.values());

    if (!items.length) return;

    this.usingBus = true;
    this.all = items.map(c => this.fromCatalog(c));
    this.rebuildSortedAndSlice();
  }

  /** Mapea CatalogItem → Product */
  private fromCatalog(c: CatalogItem): Product {
    const tags = (c.tags ?? []).map(t => (t ?? '').toLowerCase());
    const tset = new Set<string>(tags);

    // ✅ subcats SIN undefined
    const subcats = ['contacto','sistemico','cebos','biologico'] as const;
    type Subcat = typeof subcats[number];

    let derived: Subcat | undefined = subcats.find((sc) => tset.has(sc));

    if (!derived) {
      const title = (c.title || '').toLowerCase();
      if (/cebo/.test(title)) derived = 'cebos';
      else if (/bacillus|beauveria|azadirachtin|azadiractina|bt\b/.test(title)) derived = 'biologico';
      else if (/imidacloprid|tiametoxam|clorantraniliprol|sist[ée]mico/.test(title)) derived = 'sistemico';
      else if (/cipermetrina|lambda|deltametrina|contacto/.test(title)) derived = 'contacto';
    }
    const category: Product['category'] = derived ?? 'biologico';

    // brand normalizada
    const b = (c.brand || '').toLowerCase();
    const brand = (b === 'qsi' ? 'QSI' : b === 'avgust' ? 'AVGUST' : undefined) as Product['brand'];

    // badge registro vigente
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

  // ===== UI =====
  selectPill(key: string){ this.activePill = key; this.rebuildSortedAndSlice(); }
  scrollPills(dir: number){
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }
  filter(key: string){ this.active = key; this.rebuildSortedAndSlice(); }

  // ===== Orden estable + slice =====
  private rebuildSortedAndSlice() {
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || p.promo);
        src.sort((a,b) => (this.offPct(b) - this.offPct(a)) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
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
      case 'bajo_olor':
        src = src.filter(p => (p.tags||[]).some(t => t.toLowerCase() === 'bajo_olor'));
        break;
      case 'organico':
        src = src.filter(p => p.category === 'biologico' || (p.tags||[]).some(t => t.toLowerCase() === 'organico'));
        break;
      case 'nuevo':
        src = src.filter(p => (p.tags||[]).some(t => t.toLowerCase() === 'nuevo'));
        break;
    }

    if (!src.length && base.length) {
      // fallback a “tendencia”
      src = base.slice().sort((a,b) =>
        (this.score(b) - this.score(a)) ||
        a.title.localeCompare(b.title) ||
        a.id.localeCompare(b.id)
      );
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
  }

  // ===== helpers =====
  money(n:number){ return `$${(n||0).toFixed(2)}`; }
  offPct(p: Product){
    if(!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price)/p.compareAt)*100);
  }
  discount(p: Product){ const pct = this.offPct(p); return pct ? `-${pct}%` : ''; }
  score(p: Product){ return p.rating*100 + p.reviews + (p.promo ? 200 : 0); }

  // Añadir al carrito
  async addToCart(p: Product){
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price, image: p.image }, 1);
    const t = await this.toastCtrl.create({
      message: 'Insecticida añadido al carrito',
      duration: 1200, color: 'success', position: 'top', icon: 'cart-outline'
    });
    await t.present();
  }

  // Infinite scroll SIN reordenar cuando hay datos del bus
  loadMore(ev: Event){
    if (this.usingBus) {
      const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
      this.list = this.sorted.slice(0, nextLen);
      const target = (ev as InfiniteScrollCustomEvent).target as any;
      if (this.list.length >= this.sorted.length) target.disabled = true;
      (ev as InfiniteScrollCustomEvent).target.complete();
      return;
    }

    // Fallback mock si aún no hay data real
    const extra = this.mock(this.pageSize);
    this.all = [...this.all, ...extra];
    this.sorted = [...this.sorted, ...extra];
    this.list = this.sorted.slice(0, this.list.length + this.pageSize);
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  // ===== MOCK =====
  private mock(n:number): Product[]{
    const cats: Array<NonNullable<Product['category']>> = ['contacto','sistemico','cebos','biologico'];
    const brands: Array<NonNullable<Product['brand']>> = ['QSI','AVGUST'];
    const promos = ['Tiempo limitado','Últimos 2 días',''];
    const tagsPool = ['residual','bajo_olor','organico','nuevo'];

    return Array.from({length:n}).map((_, i) => {
      const id = `I-${Date.now()}-${i}`;
      const base = 7 + Math.random()*40;
      const hasCompare = Math.random() > 0.45;
      const rating = Math.floor(Math.random()*2) + 4;
      const brand = brands[i % brands.length];
      const category = cats[i % cats.length];
      const tagCount = Math.random()>0.6 ? 2 : 1;
      const tags = Array.from({length:tagCount}).map(() => tagsPool[Math.floor(Math.random()*tagsPool.length)]);

      const namesByCat: Record<NonNullable<Product['category']>, string[]> = {
        contacto: ['Cipermetrina', 'Deltametrina', 'Lambda-cialotrina'],
        sistemico:['Imidacloprid', 'Tiametoxam', 'Clorantraniliprol'],
        cebos:    ['Cebo granular', 'Gel insecticida', 'Cebo atrayente'],
        biologico:['Bacillus thuringiensis', 'Beauveria bassiana', 'Azadiractina'],
      };
      const name = namesByCat[category][i % namesByCat[category].length];

      return {
        id,
        title: `${name} ${brand} ${100 + i}`,
        image: `https://picsum.photos/seed/${id}/700/700`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*15+6)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random()*5000),
        sold: Math.random() > 0.5 ? `${(Math.floor(Math.random()*15)+1)}K+` : '',
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Registro vigente' : '',
        brand,
        category,
        tags,
      };
    });
  }

  // ---- polling corto para esperar datos del bus ----
  private startPollingForBus() {
    this.stopPolling();
    this.pollCount = 0;
    this.pollId = setInterval(() => {
      this.pollCount++;
      const had = this.catalog.listAll().length > 0;
      this.hydrateFromCatalog();
      if (had || this.pollCount >= 8) this.stopPolling();
    }, 800);
  }
  private stopPolling() {
    if (this.pollId) { clearInterval(this.pollId); this.pollId = undefined; }
  }
}
