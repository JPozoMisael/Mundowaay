import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
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
  category?: string; // citricos, frutales, hort, orn
  tags?: string[];   // organico, rendimiento, trazabilidad, nuevo
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
  private usingBus = false;
  private firstPage = 24;
  private pageSize  = 18;

  all: Product[] = [];
  private sorted: Product[] = [];
  list: Product[] = [];
  page = 0;

  constructor(
    private cartSvc: CartService,
    private catalog: CatalogoBus // índice global (se llena en el bootstrap)
  ) {
    // 1) Render inmediato con mocks (no se publican en el bus)
    this.all = this.mock(28);
    this.rebuildSortedAndSlice();

    // 2) Rehidratar en cuanto haya datos reales
    setTimeout(() => this.hydrateFromCatalog(), 0);
  }

  // Rehidrata al entrar por si la sync terminó estando fuera de la vista
  async ionViewWillEnter() {
    this.hydrateFromCatalog();
  }

  /** Lee del índice global y reemplaza los mocks si hay data real */
  private hydrateFromCatalog() {
    // Búsqueda por categoría de página
    const byCat = this.catalog.search('', { cat: 'acaricidas', limit: 1200 }).items;

    // Refuerzo con keywords típicas de acaricidas/miticidas por si faltan etiquetas
    const byQuery = this.catalog.search(
      'acaricida|miticida|ácaro|acaro|spiromesifen|abamectina|etoxazole|hexythiazox|propargite|bifenazate|fenpyroximate',
      { limit: 1200 }
    ).items;

    // Dedupe
    const map = new Map<string, CatalogItem>();
    for (const it of [...byCat, ...byQuery]) map.set(it.id, it);
    const items = Array.from(map.values());

    if (!items.length) return;

    this.usingBus = true;
    this.all = items.map(c => this.fromCatalog(c));
    this.rebuildSortedAndSlice();
  }

  /** Mapea CatalogItem (Wix/bus) → Product local de esta página */
  private fromCatalog(c: CatalogItem): Product {
    const tags = (c.tags ?? []).map(t => (t ?? '').toLowerCase());
    const tset = new Set<string>(tags);
    const text = (c.title + ' ' + ((c as any).desc || '')).toLowerCase();

    // subcategorías (cultivos): busca en tags; si no, heuristic por texto; default: 'hort'
    const subcats = ['citricos','frutales','hort','orn'] as const;
    type Subcat = typeof subcats[number];

    let derived: Subcat | undefined = subcats.find(sc => tset.has(sc));
    if (!derived) {
      if (/cítrico|citric/.test(text)) derived = 'citricos';
      else if (/frutal|fruta/.test(text)) derived = 'frutales';
      else if (/ornament/.test(text)) derived = 'orn';
      else derived = 'hort';
    }

    // Badge simple: orgánico si viene en tags
    const badge = tset.has('organico') ? 'Orgánico' : '';

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
      badge,
      category: derived,
      tags: c.tags || [],
    };
  }

  // ===== Eventos de UI =====
  selectPill(key: string){ this.activePill = key; this.rebuildSortedAndSlice(); }
  filter(key: string){ this.active = key; this.page = 0; this.rebuildSortedAndSlice(); }

  scrollPills(dir: number){
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  addToCart(p: Product){
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price, image: p.image }, 1);
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
      // fallback para no dejar vacío
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
  money(n: number){ return `$${(n||0).toFixed(2)}`; }
  offPct(p: Product){
    if (!p.compareAt || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
  }
  discount(p: Product){ const pct = this.offPct(p); return pct>0 ? `-${pct}%` : ''; }
  score(p: Product){
    const rr = p.rating * 100 + p.reviews;
    const promo = p.promo ? 250 : 0;
    return rr + promo;
  }

  // ===== Infinite scroll SIN reordenar cuando hay datos del bus =====
  loadMore(ev: Event){
    if (this.usingBus) {
      const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
      this.list = this.sorted.slice(0, nextLen);
      const target = (ev as InfiniteScrollCustomEvent).target as any;
      if (this.list.length >= this.sorted.length) target.disabled = true;
      (ev as InfiniteScrollCustomEvent).target.complete();
      return;
    }

    // Fallback mocks si aún no hay data real
    const extra = this.mock(this.pageSize);
    this.all = [...this.all, ...extra];
    this.sorted = [...this.sorted, ...extra];
    this.list = this.sorted.slice(0, this.list.length + this.pageSize);
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  // ===== MOCK =====
  private mock(n: number): Product[]{
    const cats = ['citricos','frutales','hort','orn'] as const;
    const tagsPool = ['organico','rendimiento','trazabilidad','nuevo'];
    const promos = ['Tiempo limitado', 'Últimos 2 días', ''];
    return Array.from({length:n}).map((_,i)=>{
      const id = `A-${Date.now()}-${this.page}-${i}`;
      const base = 7 + Math.random()*70;
      const hasCompare = Math.random() > 0.45;
      const rating = 4 + Math.floor(Math.random()*2);
      const sold = Math.random() > 0.5 ? `${(Math.floor(Math.random()*19)+1)}K+` : '';
      const tcount = Math.random()>0.6 ? 2 : 1;
      const tsel = Array.from({length:tcount}).map(()=>tagsPool[Math.floor(Math.random()*tagsPool.length)]);
      const names = [
        'Acaricida específico',
        'Control de ácaros',
        'Miticida sistémico',
        'Acción por contacto',
        'Alta persistencia',
        'Baja fitotoxicidad'
      ];
      return {
        id,
        title: `${names[i % names.length]} ${110 + i}`,
        image: `https://picsum.photos/seed/${id}/640/640`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*18+8)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random()*5000),
        sold,
        promo: promos[i % promos.length],
        badge: Math.random()>0.7 ? 'Orgánico' : (Math.random()>0.7 ? 'Local' : ''),
        category: cats[i % cats.length],
        tags: tsel,
      };
    });
  }
}
