import { Component, ViewChild, ElementRef } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

type Brand = 'QSI' | 'AVGUST' | 'OTRA';
type Category =
  | 'triazol' | 'estrobilurina' | 'sdhi' | 'cobre'
  | 'sistemico' | 'contacto' | 'biologico' | 'mezcla';

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
  selector: 'app-fungicidas',
  templateUrl: './fungicidas.page.html',
  styleUrls: ['./fungicidas.page.scss'],
  standalone: false,
})
export class FungicidasPage {
  // ===== Pills =====
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

  // ===== Chips =====
  chips = [
    { key: 'reco',           label: 'Recomendado',      icon: 'assets/img/recofung.png' },
    { key: 'marca_qsi',      label: 'QSI',              icon: 'assets/img/qsifung.png' },
    { key: 'marca_avgust',   label: 'AVGUST',           icon: 'assets/img/avgustfung.png' },
    { key: 'triazol',        label: 'Triazoles',        icon: 'assets/img/triazol.png' },
    { key: 'estrobilurina',  label: 'Estrobilurinas',   icon: 'assets/img/estro.png' },
    { key: 'sdhi',           label: 'SDHI',             icon: 'assets/img/sdhi.png' },
    { key: 'cobre',          label: 'Cobre',            icon: 'assets/img/copper.png' },
    { key: 'sistemico',      label: 'Sistémicos',       icon: 'assets/img/systemicfung.png'},
    { key: 'contacto',       label: 'De contacto',      icon: 'assets/img/contactfung.png' },
    { key: 'biologico',      label: 'Biológicos',       icon: 'assets/img/biofung.png' },
    { key: 'mezcla',         label: 'Mezclas',          icon: 'assets/img/mix.png' },
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

  // ====== CARGA de productos (solo FUNGICIDAS) ======
  private loadProducts() {
    this.productsSvc.listAll().subscribe(items => {
      this.all = items
        .filter(p => {
          const title = (p.title || '').toLowerCase();
          const category = (p.category || '').toLowerCase();
          const tags = (p.tags || []).map(t => (t || '').toLowerCase());
          const collections = (p.collectionSlugs || []).map(s => (s || '').toLowerCase());

          // === Filtros específicos para fungicidas ===
          const slugMatch = collections.includes('fungicidas') || collections.includes('fungicida');
          const catMatch = category.includes('fungicida');
          const tagMatch = tags.some(t => t.includes('fungicida'));
          const nameMatch = /(fungicida|triazol|estrobilurina|sdhi|mancozeb|propiconazol|cobre|trichoderma|metalaxyl|fosetyl)/.test(title);

          return slugMatch || catMatch || tagMatch || nameMatch;
        })
        .map(p => this.mapToLocal(p));

      if (!this.all.length) {
        console.warn('[Fungicidas] No se encontraron productos válidos, usando mock');
        this.all = this.mock(24);
      }

      this.rebuildSortedAndSlice();
    }, err => {
      console.error('[Fungicidas] Error al cargar productos:', err);
      this.all = this.mock(24);
      this.rebuildSortedAndSlice();
    });
  }

  private mapToLocal(p: Product): LocalProduct {
    return {
      ...p,
      price: p.price ?? 0,
      compareAt: p.compareAt ?? undefined,
      rating: 4,
      reviews: Math.floor(Math.random() * 500),
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
    if (/triazol|tebu|propicon|difeno/.test(text)) return 'triazol';
    if (/estrobil|azoxi|pyraclo|trifloxi|kresoxim/.test(text)) return 'estrobilurina';
    if (/sdhi|boscalid|bixafen|fluxapyroxad/.test(text)) return 'sdhi';
    if (/cobre|oxicloruro|hidroxido/.test(text)) return 'cobre';
    if (/metalaxyl|fosetyl|cymoxanil/.test(text)) return 'sistemico';
    if (/mancozeb|clorotalonil|captan/.test(text)) return 'contacto';
    if (/trichoderma|bacillus/.test(text)) return 'biologico';
    if (/mezcla|\+/.test(text)) return 'mezcla';
    return 'sistemico';
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
      message: 'Fungicida añadido al carrito',
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

  // ====== MOCK ======
  private mock(n:number): LocalProduct[]{
    const cats: Category[] = ['triazol','estrobilurina','sdhi','cobre','sistemico','contacto','biologico','mezcla'];
    const brands: Brand[] = ['QSI','AVGUST'];
    const promos = ['Tiempo limitado','Últimos 2 días',''];

    return Array.from({length:n}).map((_, i) => {
      const id = `F-${Date.now()}-${i}`;
      const base = 8 + Math.random()*50;
      const hasCompare = Math.random() > 0.45;
      const category = cats[i % cats.length];
      const brand = brands[i % brands.length];

      return {
        id,
        title: `Fungicida demo ${i+1}`,
        imageUrl: `https://picsum.photos/seed/${id}/720/720`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*18+7)).toFixed(2)) : undefined,
        rating: 4,
        reviews: Math.floor(Math.random()*5000),
        sold: '',
        promo: promos[i % promos.length],
        badge: '',
        brand,
        category,
        tags: [],
      };
    });
  }

  // ====== Eventos del header ======
  onGlobalSearch(term: string) {
    console.log('[Header] Buscar término:', term);
  }

  onGlobalCat(cat: string) {
    console.log('[Header] Seleccionar categoría:', cat);
  }
}
