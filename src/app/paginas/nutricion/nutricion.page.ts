import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

// =============================
// 🔹 Tipo extendido local
// =============================
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
  selector: 'app-nutricion',
  templateUrl: './nutricion.page.html',
  styleUrls: ['./nutricion.page.scss'],
  standalone: false,
})
export class NutricionPage implements OnInit {
  // ===== Pills =====
  pills = [
    { key: 'tendencia', label: 'Más demandados' },
    { key: 'relampago', label: 'Ofertas relámpago' },
    { key: 'favoritos', label: 'Favoritos de los clientes' },
    { key: 'alto_brix', label: 'Alto °Brix' },
    { key: 'floracion', label: 'Floración y cuaje' },
    { key: 'enraizamiento', label: 'Enraizamiento' },
    { key: 'antiestres', label: 'Antiestrés' },
    { key: 'nuevo', label: 'Nuevos lanzamientos' },
  ];
  activePill = 'tendencia';

  // ===== Chips =====
  chips = [
    { key: 'reco', label: 'Recomendado', icon: 'assets/img/reconutri.png' },
    { key: 'macro', label: 'Macronutrientes', icon: 'assets/img/macro.png' },
    { key: 'micro', label: 'Micronutrientes', icon: 'assets/img/micro.png' },
    { key: 'quelatado', label: 'Quelatados', icon: 'assets/img/chelate.png' },
    { key: 'aminoacidos', label: 'Aminoácidos', icon: 'assets/img/amino.png' },
    { key: 'algas', label: 'Algas/Extractos', icon: 'assets/img/seaweed.png' },
    { key: 'calcio_boro', label: 'Calcio-Boro', icon: 'assets/img/ca-b.png' },
    { key: 'k_h', label: 'K-H (maduración)', icon: 'assets/img/k-h.png' },
    { key: 'bioestimulante', label: 'Bioestimulantes', icon: 'assets/img/bionutri.png' },
  ];
  active = 'reco';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  private firstPage = 20;
  private pageSize = 18;

  all: LocalProduct[] = [];
  private sorted: LocalProduct[] = [];
  list: LocalProduct[] = [];

  constructor(
    private cartSvc: CartService,
    private toastCtrl: ToastController,
    private productsSvc: ProductsService
  ) {}

  // =============================
  // 🚀 Inicialización
  // =============================
  ngOnInit() {
    this.loadProducts();
  }

  // =============================
  // 🔹 Cargar productos desde API
  // =============================
  private loadProducts() {
    const collectionSlug = 'nutricion-foliar'; // Slug exacto en tu backend (Wix o API propia)
    console.log(`[Nutrición] Cargando productos desde colección: ${collectionSlug}`);

    this.productsSvc.getByCollection(collectionSlug).subscribe({
      next: (items: Product[]) => {
        console.log(`[Nutrición] Productos recibidos: ${items.length}`);

        this.all = items.map((p: Product) => this.mapToLocal(p));

        if (!this.all.length) {
          console.warn(`[Nutrición] No se encontraron productos. Usando mock temporal.`);
          this.all = this.mock(12);
        }

        this.rebuildSortedAndSlice();
      },
      error: (err: any) => {
        console.error('[Nutrición] Error cargando productos:', err);
        this.all = this.mock(12);
        this.rebuildSortedAndSlice();
      },
    });
  }

  // =============================
  // 🧩 Adaptar producto al modelo local
  // =============================
  private mapToLocal(p: Product): LocalProduct {
    const tags = (p.tags ?? []).map(t => t.toLowerCase());
    return {
      ...p,
      price: p.price ?? 0,
      compareAt: p.compareAt,
      rating: 4,
      reviews: Math.floor(Math.random() * 200),
      sold: '',
      promo: '',
      badge: tags.includes('organico') ? 'Orgánico' : '',
      category: 'nutricion',
      tags: p.tags || [],
    };
  }

  // =============================
  // 🔁 Ordenar y limitar lista
  // =============================
  private rebuildSortedAndSlice() {
    const base =
      this.active === 'reco'
        ? [...this.all]
        : this.all.filter(p => (p.category ?? '').toLowerCase().includes(this.active));

    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter(p => !!p.compareAt);
        break;
      case 'favoritos':
        src.sort((a, b) => (b.reviews! - a.reviews!) || (b.rating! - a.rating!));
        break;
      case 'tendencia':
        src.sort((a, b) => this.score(b) - this.score(a));
        break;
      case 'alto_brix':
        src = src.filter(p => (p.tags || []).includes('alto_brix'));
        break;
      case 'floracion':
        src = src.filter(p => (p.tags || []).includes('floracion') || (p.tags || []).includes('cuaje'));
        break;
      case 'enraizamiento':
        src = src.filter(p => (p.tags || []).includes('enraizamiento'));
        break;
      case 'antiestres':
        src = src.filter(p => (p.tags || []).includes('antiestres'));
        break;
      case 'nuevo':
        src = src.filter(p => (p.tags || []).includes('nuevo'));
        break;
    }

    if (!src.length && base.length) {
      src = base.slice().sort((a, b) => this.score(b) - this.score(a));
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
    console.log(`[Nutrición] Mostrando ${this.list.length}/${this.sorted.length} productos.`);
  }

  // =============================
  // ⚙️ UI (Filtros y scroll)
  // =============================
  selectPill(key: string) {
    this.activePill = key;
    this.rebuildSortedAndSlice();
  }

  filter(key: string) {
    this.active = key;
    this.rebuildSortedAndSlice();
  }

  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  // =============================
  // 🔄 Infinite scroll
  // =============================
  loadMore(ev: Event) {
    const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
    this.list = this.sorted.slice(0, nextLen);
    const target = (ev as InfiniteScrollCustomEvent).target as any;
    if (this.list.length >= this.sorted.length) target.disabled = true;
    target.complete();
  }

  // =============================
  // 💰 Helpers visuales
  // =============================
  money(n: number) {
    return `$${(n || 0).toFixed(2)}`;
  }

  offPct(p: LocalProduct) {
    if (!p.compareAt || p.compareAt <= (p.price ?? 0)) return 0;
    return Math.round(((p.compareAt - (p.price ?? 0)) / p.compareAt) * 100);
  }

  discount(p: LocalProduct) {
    const pct = this.offPct(p);
    return pct > 0 ? `-${pct}%` : '';
  }

  score(p: LocalProduct) {
    const rr = (p.rating ?? 0) * 100 + (p.reviews ?? 0);
    const hasDiscount = !!p.compareAt && p.compareAt > (p.price ?? 0);
    return rr + (hasDiscount ? 150 : 0);
  }

  // =============================
  // 🛒 Carrito
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
      message: 'Producto añadido al carrito',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline',
    });
    await t.present();
  }

  // =============================
  // 🔧 Datos falsos (mock)
  // =============================
  private mock(n: number): LocalProduct[] {
    const cats = ['macro', 'micro', 'quelatado', 'aminoacidos', 'algas', 'calcio_boro', 'k_h', 'bioestimulante'];
    const tagsPool = ['alto_brix', 'floracion', 'cuaje', 'enraizamiento', 'antiestres', 'nuevo'];
    const promos = ['Tiempo limitado', 'Últimos 2 días', ''];

    return Array.from({ length: n }).map((_, i) => {
      const id = `N-${Date.now()}-${i}`;
      const base = 5 + Math.random() * 60;
      const hasCompare = Math.random() > 0.3;
      const rating = Math.floor(Math.random() * 2) + 4;
      const tsel = [tagsPool[Math.floor(Math.random() * tagsPool.length)]];
      return {
        id,
        title: ['Fertilizante Foliar', 'Bioestimulante', 'Quelatado'][i % 3] + ' ' + (100 + i),
        imageUrl: `https://picsum.photos/seed/${id}/640/640`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random() * 15 + 6)).toFixed(2)) : undefined,
        rating,
        reviews: Math.floor(Math.random() * 5000),
        sold: Math.random() > 0.5 ? `${Math.floor(Math.random() * 19) + 1}K+` : '',
        promo: promos[i % promos.length],
        badge: Math.random() > 0.6 ? 'Orgánico' : '',
        category: cats[i % cats.length],
        tags: tsel,
      };
    });
  }
  // ====== Eventos del header (búsqueda y categoría global) ======
onGlobalSearch(term: string) {
  console.log('[Header] Buscar término:', term);
  // Puedes implementar lógica de búsqueda si deseas
}

onGlobalCat(cat: string) {
  console.log('[Header] Seleccionar categoría:', cat);
  // O navegar según categoría si lo requieres
}

}
