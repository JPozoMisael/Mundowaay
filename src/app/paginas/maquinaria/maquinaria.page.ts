import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

// =============================
// 🔹 Tipos locales
// =============================
type Category = 'tractor' | 'riego' | 'dron' | 'fumi' | 'herra' | 'repu' | 'seg';

type LocalProduct = Product & {
  compareAt?: number;
  rating?: number;
  reviews?: number;
  sold?: string;
  promo?: string;
  badge?: string;
  category?: Category;
  tags?: string[];
};

@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.page.html',
  styleUrls: ['./maquinaria.page.scss'],
  standalone: false,
})
export class MaquinariaPage implements OnInit {
  // =============================
  // 🎯 PILLS
  // =============================
  pills = [
    { key: 'tendencia', label: 'Ofertas de tendencia' },
    { key: 'relampago', label: 'Ofertas relámpago' },
    { key: 'favoritos', label: 'Favoritos de los clientes' },
    { key: 'robusto', label: 'Uso rudo' },
    { key: 'eficiencia', label: 'Alta eficiencia' },
    { key: 'nuevo', label: 'Nuevos modelos' },
  ];
  activePill = 'tendencia';

  // =============================
  // 🎯 CHIPS
  // =============================
  chips = [
    { key: 'reco', label: 'Recomendado', icon: 'assets/img/recomaq.png' },
    { key: 'tractor', label: 'Tractores', icon: 'assets/img/tractor.png' },
    { key: 'riego', label: 'Riego', icon: 'assets/img/riego.png' },
    { key: 'dron', label: 'Drones agrícolas', icon: 'assets/img/dron.png' },
    { key: 'fumi', label: 'Fumigación / Mochilas', icon: 'assets/img/fumi.png' },
    { key: 'herra', label: 'Herramientas', icon: 'assets/img/tools.png' },
    { key: 'repu', label: 'Repuestos', icon: 'assets/img/rep.png' },
    { key: 'seg', label: 'Seguridad', icon: 'assets/img/seg.png' },
  ];
  active = 'reco';

  @ViewChild('pillScroll', { static: false }) pillScroll?: ElementRef<HTMLDivElement>;

  // =============================
  // 🔹 Datos
  // =============================
  private firstPage = 20;
  private pageSize = 18;

  all: LocalProduct[] = [];
  private sorted: LocalProduct[] = [];
  list: LocalProduct[] = [];

  constructor(
    private productsSvc: ProductsService,
    private cartSvc: CartService,
    private toastCtrl: ToastController
  ) {}

  // =============================
  // 🚀 Inicialización
  // =============================
  ngOnInit() {
    this.loadProducts();
  }

  // =============================
  // 🔹 Cargar productos desde backend
  // =============================
  private loadProducts() {
    const collectionSlug = 'maquinaria-y-accesorios';
    console.log(`[Maquinaria] Cargando productos desde colección "${collectionSlug}"...`);

    this.productsSvc.getByCollection(collectionSlug).subscribe({
      next: (items: Product[]) => {
        if (items && items.length > 0) {
          console.log(`[Maquinaria] ${items.length} productos recibidos.`);
          this.all = items.map((p: Product) => this.mapToLocal(p));
        } else {
          console.warn('[Maquinaria] Colección vacía, usando mock temporal.');
          this.all = this.mock(12);
        }
        this.rebuildSortedAndSlice();
      },
      error: (err: any) => {
        console.error('[Maquinaria] Error al cargar productos:', err);
        this.all = this.mock(12);
        this.rebuildSortedAndSlice();
      },
    });
  }

  // =============================
  // 🧩 Adaptar producto
  // =============================
  private mapToLocal(p: Product): LocalProduct {
    const txt = (p.title || '').toLowerCase();
    return {
      ...p,
      price: p.price ?? 0,
      compareAt: p.compareAt,
      rating: 4,
      reviews: Math.floor(Math.random() * 200),
      sold: '',
      promo: '',
      badge: '',
      category: this.deriveCategory(txt),
      tags: p.tags || [],
    };
  }

  // =============================
  // 🧩 Deducción de categoría
  // =============================
  private deriveCategory(txt: string): Category {
    if (/tractor/.test(txt)) return 'tractor';
    if (/riego/.test(txt)) return 'riego';
    if (/dron/.test(txt)) return 'dron';
    if (/fumi|mochila/.test(txt)) return 'fumi';
    if (/herra|tool/.test(txt)) return 'herra';
    if (/repu/.test(txt)) return 'repu';
    if (/seg/.test(txt)) return 'seg';
    return 'tractor';
  }

  // =============================
  // 🛒 Añadir al carrito
  // =============================
  async addToCart(p: LocalProduct) {
    this.cartSvc
      .add(
        { id: p.id, title: p.title, price: p.price ?? 0, image: p.imageUrl || 'assets/img/placeholder.png' },
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
  // 🧮 Filtros y orden
  // =============================
  filter(key: string) {
    this.active = key;
    this.rebuildSortedAndSlice();
  }

  selectPill(key: string) {
    this.activePill = key;
    this.rebuildSortedAndSlice();
  }

  private rebuildSortedAndSlice() {
    const base =
      this.active === 'reco' ? [...this.all] : this.all.filter((p) => p.category === this.active);

    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter((p) => !!p.compareAt || !!p.promo);
        break;
      case 'favoritos':
        src.sort((a, b) => (b.reviews! - a.reviews!) || (b.rating! - a.rating!));
        break;
      case 'tendencia':
        src.sort((a, b) => this.score(b) - this.score(a));
        break;
      case 'robusto':
        src = src.filter((p) => (p.tags || []).includes('robusto'));
        break;
      case 'eficiencia':
        src = src.filter((p) => (p.tags || []).includes('eficiencia'));
        break;
      case 'nuevo':
        src = src.filter((p) => (p.tags || []).includes('nuevo'));
        break;
    }

    if (!src.length && base.length) {
      src = base.slice().sort((a, b) => this.score(b) - this.score(a));
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
    console.log(`[Maquinaria] Mostrando ${this.list.length}/${this.sorted.length} productos.`);
  }

  // =============================
  // 🧭 Scroll de Pills
  // =============================
  scrollPills(dir: number) {
    const el = this.pillScroll?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  // =============================
  // 💰 Helpers
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
    return pct ? `-${pct}%` : '';
  }

  score(p: LocalProduct) {
    return (p.rating ?? 0) * 100 + (p.reviews ?? 0) + (p.promo ? 250 : 0);
  }

  // =============================
  // 🔁 Infinite Scroll
  // =============================
  loadMore(ev: Event) {
    const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
    this.list = this.sorted.slice(0, nextLen);
    const target = (ev as InfiniteScrollCustomEvent).target as any;
    if (this.list.length >= this.sorted.length) target.disabled = true;
    target.complete();
  }

  // =============================
  // 🧪 Mock de respaldo
  // =============================
  private mock(n: number): LocalProduct[] {
    const cats: Category[] = ['tractor', 'riego', 'dron', 'fumi', 'herra', 'repu', 'seg'];
    return Array.from({ length: n }).map((_, i) => {
      const id = `M-${Date.now()}-${i}`;
      const cat = cats[i % cats.length];
      return {
        id,
        title: `Maquinaria ${cat} ${i}`,
        imageUrl: `https://picsum.photos/seed/${id}/800/800`,
        price: 100 + i,
        compareAt: 120 + i,
        rating: 4,
        reviews: 10,
        category: cat,
        tags: [],
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
