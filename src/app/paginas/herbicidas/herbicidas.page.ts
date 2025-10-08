import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

type Brand = 'QSI' | 'AVGUST' | 'OTRA';
type Category = 'pre' | 'post' | 'no_selectivo' | 'selectivo' | 'sistemico' | 'contacto';

type LocalProduct = Product & {
  compareAt?: number;
  rating?: number;
  reviews?: number;
  sold?: string;
  promo?: string;
  badge?: string;
  brand?: Brand;
  category?: Category;
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
  activePill = 'tendencia';

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

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;
  @ViewChild('chipScroll', { static: false }) chipScroll?: ElementRef<HTMLDivElement>;

  private firstPage = 20;
  private pageSize  = 18;

  all: LocalProduct[] = [];
  private sorted: LocalProduct[] = [];
  list: LocalProduct[] = [];

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private productsSvc: ProductsService
  ) {
    this.loadProducts();
  }

  private loadProducts() {
    this.productsSvc.listAll().subscribe(items => {
      this.all = items
        .filter(p => p.title.toLowerCase().includes('herbicida') || (p.tags||[]).includes('herbicida'))
        .map(p => this.mapToLocal(p));

      if (!this.all.length) {
        this.all = this.mock(24);
      }
      this.rebuildSortedAndSlice();
    });
  }

  private mapToLocal(p: Product): LocalProduct {
    return {
      ...p,
      price: p.price ?? 0,
      compareAt: p.compareAt ?? undefined,
      rating: 4,
      reviews: Math.floor(Math.random()*500),
      sold: '',
      promo: '',
      badge: '',
      brand: (p.title || '').toLowerCase().includes('qsi') ? 'QSI'
           : (p.title || '').toLowerCase().includes('avgust') ? 'AVGUST'
           : 'OTRA',
      category: this.deriveCategory(p.title || ''),
    };
  }

  private deriveCategory(text: string): Category {
    text = text.toLowerCase();
    if (/preemerg|pre /.test(text)) return 'pre';
    if (/postemerg|post /.test(text)) return 'post';
    if (/selectiv/.test(text)) return 'selectivo';
    if (/sistemic/.test(text)) return 'sistemico';
    if (/contact/.test(text)) return 'contacto';
    if (/glifosato|paraquat|glufosinato/.test(text)) return 'no_selectivo';
    return 'post';
  }

  // ===== UI =====
  scrollChips(dir: number) {
    const el = this.chipScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  selectPill(key: string){ this.activePill = key; this.rebuildSortedAndSlice(); }
  filter(key: string){ this.active = key; this.rebuildSortedAndSlice(); }

  private rebuildSortedAndSlice() {
    const base = this.active === 'reco' ? [...this.all] : this.all.filter(p => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt || !!p.promo);
        src.sort((a,b) => (this.offPct(b) - this.offPct(a)) || a.title.localeCompare(b.title));
        break;
      case 'favoritos':
        src.sort((a,b) => (b.reviews! - a.reviews!) || (b.rating! - a.rating!));
        break;
      case 'tendencia':
        src.sort((a,b) => this.score(b) - this.score(a));
        break;
      case 'residual':
        src = src.filter(p => (p.tags||[]).includes('residual'));
        break;
      case 'rapido':
        src = src.filter(p => (p.tags||[]).includes('rapido'));
        break;
      case 'organico':
        src = src.filter(p => (p.tags||[]).includes('organico'));
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

  // ===== Helpers =====
  money(n:number|undefined){ return `$${((n??0)).toFixed(2)}`; }
  offPct(p: LocalProduct){
    const price = p.price ?? 0;
    if(!p.compareAt || p.compareAt <= price) return 0;
    return Math.round(((p.compareAt - price)/p.compareAt)*100);
  }
  discount(p: LocalProduct){ const pct = this.offPct(p); return pct ? `-${pct}%` : ''; }
  score(p: LocalProduct){ return (p.rating??0)*100 + (p.reviews??0) + (p.promo ? 200 : 0); }

  async addToCart(p: LocalProduct){
    this.cartSvc.add({ id: p.id, title: p.title, price: p.price ?? 0, image: p.imageUrl || 'assets/img/placeholder.png' }, 1).subscribe();
    const t = await this.toastCtrl.create({
      message: 'Herbicida añadido al carrito',
      duration: 1200, color: 'success', position: 'top', icon: 'cart-outline'
    });
    await t.present();
  }

  loadMore(ev: Event){
    const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
    this.list = this.sorted.slice(0, nextLen);
    const target = (ev as InfiniteScrollCustomEvent).target as any;
    if (this.list.length >= this.sorted.length) target.disabled = true;
    target.complete();
  }

  // ===== MOCK =====
  private mock(n:number): LocalProduct[]{
    const cats: Category[] = ['pre','post','no_selectivo','selectivo','sistemico','contacto'];
    const brands: Brand[] = ['QSI','AVGUST'];
    const promos = ['Tiempo limitado','Últimos 2 días',''];
    const tagsPool = ['residual','rapido','organico','nuevo'];

    return Array.from({length:n}).map((_, i) => {
      const id = `H-${Date.now()}-${i}`;
      const base = 6 + Math.random()*45;
      const hasCompare = Math.random() > 0.45;
      const category = cats[i % cats.length];
      const brand = brands[i % brands.length];

      return {
        id,
        title: `Herbicida demo ${i+1}`,
        imageUrl: `https://picsum.photos/seed/${id}/720/720`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*15+6)).toFixed(2)) : undefined,
        rating: 4,
        reviews: Math.floor(Math.random()*3000),
        sold: '',
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Registro vigente' : '',
        brand,
        category,
        tags: [tagsPool[i % tagsPool.length]],
      };
    });
  }
}
