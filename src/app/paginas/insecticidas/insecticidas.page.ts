import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

type Brand = 'QSI' | 'AVGUST' | 'OTRA';
type Category = 'contacto' | 'sistemico' | 'cebos' | 'biologico';

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
  selector: 'app-insecticidas',
  templateUrl: './insecticidas.page.html',
  styleUrls: ['./insecticidas.page.scss'],
  standalone: false,
})
export class InsecticidasPage {
  // =============================
  // 🔹 PILLS Y CHIPS
  // =============================
  pills = [
    { key: 'tendencia', label: 'Más demandados' },
    { key: 'relampago', label: 'Ofertas relámpago' },
    { key: 'favoritos', label: 'Favoritos de los clientes' },
    { key: 'residual', label: 'Alta residualidad' },
    { key: 'bajo_olor', label: 'Bajo olor' },
    { key: 'organico', label: 'Biológicos/Orgánicos' },
    { key: 'nuevo', label: 'Nuevos registros' },
  ];
  activePill = 'tendencia';

  chips = [
    { key: 'reco', label: 'Recomendado', icon: 'assets/img/recoins.png' },
    { key: 'marca_qsi', label: 'QSI', icon: 'assets/img/qsi.png' },
    { key: 'marca_avg', label: 'AVGUST', icon: 'assets/img/avgust.png' },
    { key: 'contacto', label: 'De contacto', icon: 'assets/img/contact.png' },
    { key: 'sistemico', label: 'Sistémicos', icon: 'assets/img/systemic.png' },
    { key: 'cebos', label: 'Cebos', icon: 'assets/img/bait.png' },
    { key: 'biologico', label: 'Biológicos', icon: 'assets/img/bio.png' },
  ];
  active = 'reco';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;
  private lastScrollTop = 0;
  private headerElement?: HTMLElement;

  // =============================
  // 🔹 DATOS
  // =============================
  private firstPage = 20;
  private pageSize = 18;
  all: LocalProduct[] = [];
  private sorted: LocalProduct[] = [];
  list: LocalProduct[] = [];

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private productsSvc: ProductsService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Buscar header global para efecto Temu
    this.headerElement = document.querySelector('app-header') as HTMLElement;
    this.loadProducts();
  }

  // =============================
  // 🔹 CARGAR PRODUCTOS
  // =============================
  private loadProducts() {
    this.productsSvc.listAll().subscribe((items) => {
      this.all = items
        .filter(
          (p) =>
            p.title.toLowerCase().includes('insecticida') ||
            (p.tags || []).includes('insecticida')
        )
        .map((p) => this.mapToLocal(p));

      if (!this.all.length) this.all = this.mock(20);
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
      brand:
        (p.title || '').toLowerCase().includes('qsi')
          ? 'QSI'
          : (p.title || '').toLowerCase().includes('avgust')
          ? 'AVGUST'
          : 'OTRA',
      category: this.deriveCategory(p.title || ''),
    };
  }

  private deriveCategory(text: string): Category {
    text = text.toLowerCase();
    if (/cebo/.test(text)) return 'cebos';
    if (/bacillus|beauveria|azadirachtin|bt\b/.test(text)) return 'biologico';
    if (/imidacloprid|tiametoxam|clorantraniliprol|sist[ée]mico/.test(text))
      return 'sistemico';
    if (/cipermetrina|lambda|deltametrina|contacto/.test(text))
      return 'contacto';
    return 'biologico';
  }

  // =============================
  // 🔹 FILTROS / ORDEN
  // =============================
  selectPill(key: string) {
    this.activePill = key;
    this.rebuildSortedAndSlice();
  }

  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  filter(key: string) {
    this.active = key;
    this.rebuildSortedAndSlice();
  }

  private rebuildSortedAndSlice() {
    const base =
      this.active === 'reco'
        ? [...this.all]
        : this.all.filter((p) => p.category === this.active);
    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter((p) => !!p.compareAt || p.promo);
        src.sort(
          (a, b) =>
            this.offPct(b) - this.offPct(a) || a.title.localeCompare(b.title)
        );
        break;
      case 'favoritos':
        src.sort((a, b) => (b.reviews! - a.reviews!) || (b.rating! - a.rating!));
        break;
      case 'tendencia':
        src.sort((a, b) => this.score(b) - this.score(a));
        break;
      case 'residual':
        src = src.filter((p) => (p.tags || []).includes('residual'));
        break;
      case 'bajo_olor':
        src = src.filter((p) => (p.tags || []).includes('bajo_olor'));
        break;
      case 'organico':
        src = src.filter(
          (p) => p.category === 'biologico' || (p.tags || []).includes('organico')
        );
        break;
      case 'nuevo':
        src = src.filter((p) => (p.tags || []).includes('nuevo'));
        break;
    }

    if (!src.length && base.length)
      src = base.slice().sort((a, b) => this.score(b) - this.score(a));

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
  }

  // =============================
  // 🔹 UTILIDADES
  // =============================
  money(n: number | undefined) {
    return `$${(n ?? 0).toFixed(2)}`;
  }

  offPct(p: LocalProduct) {
    const price = p.price ?? 0;
    if (!p.compareAt || p.compareAt <= price) return 0;
    return Math.round(((p.compareAt - price) / p.compareAt) * 100);
  }

  discount(p: LocalProduct) {
    const pct = this.offPct(p);
    return pct ? `-${pct}%` : '';
  }

  score(p: LocalProduct) {
    return (p.rating ?? 0) * 100 + (p.reviews ?? 0) + (p.promo ? 200 : 0);
  }

  // =============================
  // 🛒 AÑADIR AL CARRITO
  // =============================
  async addToCart(p: LocalProduct) {
    this.cartSvc
      .add(
        {
          id: p.id,
          title: p.title,
          price: p.price ?? 0,
          image: p.imageUrl || 'assets/img/placeholder.png',
        },
        1
      )
      .subscribe();

    const t = await this.toastCtrl.create({
      message: 'Insecticida añadido al carrito 🛒',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline',
    });
    await t.present();
  }

  // =============================
  // 🔹 SCROLL INFINITO
  // =============================
  loadMore(ev: Event) {
    const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
    this.list = this.sorted.slice(0, nextLen);
    const target = (ev as InfiniteScrollCustomEvent).target as any;
    if (this.list.length >= this.sorted.length) target.disabled = true;
    target.complete();
  }

  // =============================
  // 🔹 EFECTO SCROLL ESTILO TEMU
  // =============================
  onScroll(event: any) {
    const scrollTop = event.detail?.scrollTop || 0;
    if (!this.headerElement) return;

    // Determinar dirección del scroll
    if (scrollTop > this.lastScrollTop + 10) {
      // Bajando -> ocultar
      this.renderer.setStyle(this.headerElement, 'transform', 'translateY(-100%)');
      this.renderer.setStyle(this.headerElement, 'transition', 'transform 0.3s ease');
    } else if (scrollTop < this.lastScrollTop - 10) {
      // Subiendo -> mostrar
      this.renderer.setStyle(this.headerElement, 'transform', 'translateY(0)');
      this.renderer.setStyle(this.headerElement, 'transition', 'transform 0.3s ease');
    }

    this.lastScrollTop = scrollTop;
  }

  // =============================
  // 🔹 MOCK LOCAL
  // =============================
  private mock(n: number): LocalProduct[] {
    const cats: Category[] = ['contacto', 'sistemico', 'cebos', 'biologico'];
    const brands: Brand[] = ['QSI', 'AVGUST'];
    const promos = ['Tiempo limitado', 'Últimos 2 días', ''];
    const tagsPool = ['residual', 'bajo_olor', 'organico', 'nuevo'];

    const namesByCat: Record<Category, string[]> = {
      contacto: ['Cipermetrina', 'Deltametrina', 'Lambda-cialotrina'],
      sistemico: ['Imidacloprid', 'Tiametoxam', 'Clorantraniliprol'],
      cebos: ['Cebo granular', 'Gel insecticida', 'Cebo atrayente'],
      biologico: ['Bacillus thuringiensis', 'Beauveria bassiana', 'Azadiractina'],
    };

    return Array.from({ length: n }).map((_, i) => {
      const id = `I-${Date.now()}-${i}`;
      const base = 7 + Math.random() * 40;
      const hasCompare = Math.random() > 0.45;
      const rating = Math.floor(Math.random() * 2) + 4;
      const brand = brands[i % brands.length];
      const category = cats[i % cats.length];
      const name = namesByCat[category][i % namesByCat[category].length];
      const tagCount = Math.random() > 0.6 ? 2 : 1;
      const tags = Array.from({ length: tagCount }).map(
        () => tagsPool[Math.floor(Math.random() * tagsPool.length)]
      );

      return {
        id,
        title: `${name} ${brand} ${100 + i}`,
        imageUrl: `https://picsum.photos/seed/${id}/700/700`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare
          ? Number((base + (Math.random() * 15 + 6)).toFixed(2))
          : undefined,
        rating,
        reviews: Math.floor(Math.random() * 3000),
        sold: '',
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Registro vigente' : '',
        brand,
        category,
        tags,
      };
    });
  }

  // =============================
  // 🔹 EVENTOS HEADER (opcional)
  // =============================
  onGlobalSearch(term: string) {
    console.log('[Header] Buscar término:', term);
  }

  onGlobalCat(cat: string) {
    console.log('[Header] Categoría seleccionada:', cat);
  }
  // ============================================================
// 🔹 Optimización de listas *ngFor (trackBy)
// ============================================================
trackById(index: number, item: any): string {
  return item.id || index.toString();
}

}
