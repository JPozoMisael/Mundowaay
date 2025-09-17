import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { CatalogoBus, CatalogItem } from 'src/app/servicios/catalogo-bus';

type Brand = 'QSI' | 'AVGUST' | 'OTRA';
type Category =
  | 'triazol' | 'estrobilurina' | 'sdhi' | 'cobre'
  | 'sistemico' | 'contacto' | 'biologico' | 'mezcla';

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
  brand?: Brand;
  category?: Category;
  tags?: string[];
};

@Component({
  selector: 'app-fungicidas',
  templateUrl: './fungicidas.page.html',
  styleUrls: ['./fungicidas.page.scss'],
  standalone: false,
})
export class FungicidasPage {
  // Pills
  pills = [
    { key: 'tendencia',   label: 'Más demandados' },
    { key: 'relampago',   label: 'Ofertas relámpago' },
    { key: 'favoritos',   label: 'Favoritos de los clientes' },
    { key: 'residual',    label: 'Alta residualidad' },
    { key: 'amplio',      label: 'Amplio espectro' },
    { key: 'preventivo',  label: 'Preventivos' },
    { key: 'curativo',    label: 'Curativos' },
    { key: 'nuevo',       label: 'Nuevos registros' },
  ];
  activePill = 'tendencia';

  // Chips
  chips = [
    { key: 'reco',           label: 'Recomendado',      icon: 'assets/chips/reco.svg' },
    { key: 'marca_qsi',      label: 'QSI',              icon: 'assets/chips/qsi.svg' },
    { key: 'marca_avgust',   label: 'AVGUST',           icon: 'assets/chips/avgust.svg' },
    { key: 'triazol',        label: 'Triazoles',        icon: 'assets/chips/triazol.svg' },
    { key: 'estrobilurina',  label: 'Estrobilurinas',   icon: 'assets/chips/estro.svg' },
    { key: 'sdhi',           label: 'SDHI',             icon: 'assets/chips/sdhi.svg' },
    { key: 'cobre',          label: 'Cobre',            icon: 'assets/chips/copper.svg' },
    { key: 'sistemico',      label: 'Sistémicos',       icon: 'assets/chips/systemic.svg' },
    { key: 'contacto',       label: 'De contacto',      icon: 'assets/chips/contact.svg' },
    { key: 'biologico',      label: 'Biológicos',       icon: 'assets/chips/bio.svg' },
    { key: 'mezcla',         label: 'Mezclas',          icon: 'assets/chips/mix.svg' },
  ];
  active = 'reco';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('chipScroll', { static: false }) chipScroll?: ElementRef<HTMLDivElement>;

  private usingBus = false;
  private firstPage = 20;
  private pageSize  = 18;

  all: Product[] = [];
  private sorted: Product[] = [];
  list: Product[] = [];

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private catalog: CatalogoBus
  ) {
    // Mocks iniciales
    this.all = this.mock(24);
    this.rebuildSortedAndSlice();

    // Rehidratar con datos reales
    setTimeout(() => this.hydrateFromCatalog(), 0);
  }

  async ionViewWillEnter() {
    this.hydrateFromCatalog();
  }

  /** Hidrata con datos del bus */
  private hydrateFromCatalog() {
    const byCat = this.catalog.search('', { cat: 'fungicidas', limit: 1200 }).items;
    const byQuery = this.catalog.search(
      'fungicida|mancozeb|clorotalonil|captan|metalaxyl|fosetyl|cymoxanil|triazol|tebuconazole|propiconazole|difenoconazole|azoxystrobin|pyraclostrobin|trifloxystrobin|kresoxim|boscalid|bixafen|fluxapyroxad|trichoderma|bacillus|cobre|oxicloruro|hidroxido',
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

  /** Mapea CatalogItem → Product */
  private fromCatalog(c: CatalogItem): Product {
    const tags = (c.tags ?? []).map(t => (t ?? '').toLowerCase());
    const text = (c.title + ' ' + (c.desc || '')).toLowerCase();

    const subcats = ['triazol','estrobilurina','sdhi','cobre','sistemico','contacto','biologico','mezcla'] as const;
    type Subcat = typeof subcats[number];
    let derived: Subcat | undefined = subcats.find(sc => tags.includes(sc));

    if (!derived) {
      if (/triazol/.test(text) || /(tebu|propicon|difeno)conazole/.test(text)) derived = 'triazol';
      else if (/(estrobil|strob|azoxi|pyraclo|trifloxi|kresoxim)/.test(text)) derived = 'estrobilurina';
      else if (/(sdhi|boscalid|bixafen|fluxapyroxad)/.test(text)) derived = 'sdhi';
      else if (/(cobre|copper|oxicloruro|hidroxido)/.test(text)) derived = 'cobre';
      else if (/(metalaxyl|fosetyl|cymoxanil|sistemic)/.test(text)) derived = 'sistemico';
      else if (/(mancozeb|chlorothalonil|captan|contact)/.test(text)) derived = 'contacto';
      else if (/(trichoderma|bacillus|biolog)/.test(text)) derived = 'biologico';
      else if (/(mezcla|mix|\+)/.test(text)) derived = 'mezcla';
    }

    const brand: Brand | undefined =
      (c.brand || '').toLowerCase() === 'qsi' ? 'QSI'
      : (c.brand || '').toLowerCase() === 'avgust' ? 'AVGUST'
      : (c.brand ? 'OTRA' : undefined);

    return {
      id: c.id,
      title: c.title,
      image: c.image || 'assets/img/placeholder.png',
      price: c.price ?? 0,
      compareAt: c.compareAt,
      rating: c.rating ?? 4,
      reviews: c.reviews ?? 0,
      badge: tags.includes('registro') && tags.includes('vigente') ? 'Registro vigente' : '',
      brand,
      category: derived ?? 'sistemico',
      tags: c.tags || [],
    };
  }

  // ====== UI ======
  selectPill(key: string){ this.activePill = key; this.rebuildSortedAndSlice(); }
  scrollPills(dir: number){
    const el = this.pillScroll?.nativeElement; if(!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }
  scrollChips(dir: number){
    const el = this.chipScroll?.nativeElement; if(!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }
  filter(key: string){ this.active = key; this.rebuildSortedAndSlice(); }

  // ====== Orden estable + slice ======
  private rebuildSortedAndSlice() {
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || p.promo);
        src.sort((a,b) => (this.offPct(b) - this.offPct(a)) || a.title.localeCompare(b.title));
        break;
      case 'favoritos':
        src.sort((a,b) => (b.reviews - a.reviews) || (b.rating - a.rating));
        break;
      case 'tendencia':
        src.sort((a,b) => this.score(b) - this.score(a));
        break;
      case 'residual':
        src = src.filter(p => (p.tags||[]).includes('residual'));
        break;
      case 'amplio':
        src = src.filter(p => (p.tags||[]).includes('amplio_espectro'));
        break;
      case 'preventivo':
        src = src.filter(p => (p.tags||[]).includes('preventivo'));
        break;
      case 'curativo':
        src = src.filter(p => (p.tags||[]).includes('curativo'));
        break;
      case 'nuevo':
        src = src.filter(p => (p.tags||[]).includes('nuevo'));
        break;
    }

    if (!src.length && base.length) {
      src = base.slice().sort((a,b) => this.score(b) - this.score(a));
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
  }

  // ====== helpers ======
  money(n:number){ return `$${(n||0).toFixed(2)}`; }
  offPct(p: Product){
    if(!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price)/p.compareAt)*100);
  }
  discount(p: Product){ const pct = this.offPct(p); return pct ? `-${pct}%` : ''; }
  score(p: Product){ return p.rating*100 + p.reviews + (p.promo ? 200 : 0); }

  async addToCart(p: Product){
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price, image: p.image }, 1);
    const t = await this.toastCtrl.create({
      message: 'Fungicida añadido al carrito',
      duration: 1200, color: 'success', position: 'top', icon: 'cart-outline'
    });
    await t.present();
  }

  loadMore(ev: Event){
    if (this.usingBus) {
      const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
      this.list = this.sorted.slice(0, nextLen);
      const target = (ev as InfiniteScrollCustomEvent).target as any;
      if (this.list.length >= this.sorted.length) target.disabled = true;
      target.complete();
      return;
    }

    const extra = this.mock(this.pageSize);
    this.all = [...this.all, ...extra];
    this.sorted = [...this.sorted, ...extra];
    this.list = this.sorted.slice(0, this.list.length + this.pageSize);
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  // ====== MOCK ======
  private mock(n:number): Product[]{
    type Cat = NonNullable<Category>;
    const cats: Cat[] = ['triazol','estrobilurina','sdhi','cobre','sistemico','contacto','biologico','mezcla'];
    const brands: Brand[] = ['QSI','AVGUST'];
    const promos = ['Tiempo limitado','Últimos 2 días',''];
    const tagsPool = ['residual','amplio_espectro','preventivo','curativo','nuevo'];

    const namesByCat: Record<Cat, string[]> = {
      triazol: ['Tebuconazole','Propiconazole','Difenoconazole'],
      estrobilurina: ['Azoxystrobin','Pyraclostrobin','Trifloxystrobin'],
      sdhi: ['Bixafen','Boscalid','Fluxapyroxad'],
      cobre: ['Oxicloruro de cobre','Hidróxido de cobre','Sulfato tribásico de cobre'],
      sistemico: ['Metalaxyl-M','Fosetyl-Al','Cymoxanil'],
      contacto: ['Mancozeb','Chlorothalonil','Captan'],
      biologico: ['Bacillus subtilis','Trichoderma harzianum','Bacillus amyloliquefaciens'],
      mezcla: ['Azoxi + Tebu','Pyraclo + Epoxi','Boscalid + Kresoxim'],
    };

    return Array.from({length:n}).map((_, i) => {
      const id = `F-${Date.now()}-${i}`;
      const base = 8 + Math.random()*50;
      const hasCompare = Math.random() > 0.45;
      const rating = Math.floor(Math.random()*2) + 4;
      const sold = Math.random() > 0.5 ? `${(Math.floor(Math.random()*15)+1)}K+` : '';
      const category: Cat = cats[i % cats.length];
      const brand = brands[i % brands.length];
      const tags = Array.from({length:Math.random()>0.6 ? 2 : 1})
        .map(() => tagsPool[Math.floor(Math.random()*tagsPool.length)]);
      const name = namesByCat[category][i % namesByCat[category].length];

      return {
        id,
        title: `${name} ${brand} ${100 + i}`,
        image: `https://picsum.photos/seed/${id}/720/720`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*18+7)).toFixed(2)) : undefined,
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
 