import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

// Extiende Product con campos visuales
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
  selector: 'app-semillas',
  templateUrl: './semillas.page.html',
  styleUrls: ['./semillas.page.scss'],
  standalone: false,
})
export class SemillasPage implements OnInit {
  // ===== Pills =====
  pills = [
    { key: 'tendencia', label: 'Ofertas de tendencia' },
    { key: 'relampago', label: 'Ofertas relámpago' },
    { key: 'favoritos', label: 'Favoritos de los clientes' },
    { key: 'rendimiento', label: 'Alto rendimiento' },
    { key: 'organico', label: 'Orgánico' },
    { key: 'trazabilidad', label: 'Trazabilidad certificada' },
    { key: 'nueva', label: 'Nuevas variedades' },
  ];
  activePill = 'tendencia';

  // ===== Chips =====
  chips = [
    { key: 'reco', label: 'Recomendado', icon: 'assets/img/reco.png' },
    { key: 'maiz', label: 'Maíz', icon: 'assets/img/maiz.png' },
    { key: 'arroz', label: 'Arroz', icon: 'assets/img/arroz.png' },
    { key: 'trigo', label: 'Trigo', icon: 'assets/img/trigo.png' },
    { key: 'soja', label: 'Soja', icon: 'assets/img/soja.png' },
    { key: 'hort', label: 'Hortalizas', icon: 'assets/img/hort.png' },
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

  ngOnInit() {
    console.log('[SemillasPage] Iniciando carga de productos...');
    this.loadProducts();
  }

  // 🚀 Cargar productos desde backend
  private loadProducts() {
    console.log('[SemillasPage] Solicitando colección "semillas" desde API...');

    this.productsSvc.getByCollection('semillas').subscribe({
      next: (items) => {
        console.log(`[SemillasPage] Productos recibidos de la colección SEMILLAS: ${items.length}`);

        this.all = items
          .filter((p) => p.imageUrl && !p.imageUrl.includes('placeholder'))
          .map((p) => this.mapToLocal(p));

        if (!this.all.length) {
          console.warn('⚠️ No se encontraron productos en la colección SEMILLAS. Se usa mock temporal.');
          this.all = this.mock(12);
        }

        this.rebuildSortedAndSlice();
      },
      error: (err) => {
        console.error('[SemillasPage] Error cargando colección SEMILLAS:', err);
        this.all = this.mock(12);
        this.rebuildSortedAndSlice();
      },
    });
  }

  // 🧩 Adaptar producto al modelo local
  private mapToLocal(p: Product): LocalProduct {
    return {
      ...p,
      price: p.price ?? 0,
      compareAt: p.compareAt,
      rating: Math.floor(Math.random() * 2) + 4,
      reviews: Math.floor(Math.random() * 500),
      sold: '',
      promo: '',
      badge: '',
      category: 'semillas',
      tags: p.tags || [],
    };
  }

  // ===== Orden y slice =====
  private rebuildSortedAndSlice() {
    const base =
      this.active === 'reco'
        ? [...this.all]
        : this.all.filter((p) => (p.category ?? '').toLowerCase().includes(this.active));

    let src = [...base];

    switch (this.activePill) {
      case 'relampago':
        src = src.filter((p) => !!p.compareAt);
        break;
      case 'favoritos':
        src.sort((a, b) => (b.reviews! - a.reviews!) || (b.rating! - a.rating!));
        break;
      case 'tendencia':
        src.sort((a, b) => this.score(b) - this.score(a));
        break;
      case 'organico':
        src = src.filter((p) => (p.tags || []).includes('organico'));
        break;
      case 'rendimiento':
        src = src.filter((p) => (p.tags || []).includes('rendimiento'));
        break;
      case 'trazabilidad':
        src = src.filter((p) => (p.tags || []).includes('trazabilidad'));
        break;
      case 'nueva':
        src = src.filter((p) => (p.tags || []).includes('nuevo'));
        break;
    }

    if (!src.length && base.length) {
      src = base.slice().sort((a, b) => this.score(b) - this.score(a));
    }

    this.sorted = src;
    this.list = this.sorted.slice(0, this.firstPage);
    console.log(`[SemillasPage] Mostrando ${this.list.length}/${this.sorted.length} productos.`);
  }

  // ===== UI =====
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

  // ===== Infinite Scroll =====
  loadMore(ev: Event) {
    const nextLen = Math.min(this.sorted.length, this.list.length + this.pageSize);
    this.list = this.sorted.slice(0, nextLen);
    const target = (ev as InfiniteScrollCustomEvent).target as any;
    if (this.list.length >= this.sorted.length) target.disabled = true;
    target.complete();
  }

  // ===== Helpers =====
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

  // ===== Carrito =====
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
      message: 'Semilla añadida al carrito',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline',
    });
    await t.present();
  }

  trackById(index: number, item: any): string {
    return item?.id || index.toString();
  }

  // ===== Mock temporal =====
  private mock(n: number): LocalProduct[] {
    const cats = ['maiz', 'arroz', 'trigo', 'soja', 'hort'];
    const tagsPool = ['organico', 'rendimiento', 'trazabilidad', 'nuevo'];
    const promos = ['Tiempo limitado', 'Últimos 2 días', ''];

    return Array.from({ length: n }).map((_, i) => {
      const id = `S-${Date.now()}-${i}`;
      const base = 5 + Math.random() * 60;
      const hasCompare = Math.random() > 0.25;

      return {
        id,
        title:
          ['Semilla Híbrida', 'Semilla Certificada', 'Semilla Tratada'][i % 3] +
          ' ' +
          (100 + i),
        imageUrl: `https://picsum.photos/seed/${id}/640/640`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare
          ? Number((base + (Math.random() * 15 + 6)).toFixed(2))
          : undefined,
        rating: Math.floor(Math.random() * 2) + 4,
        reviews: Math.floor(Math.random() * 5000),
        sold: Math.random() > 0.5 ? `${Math.floor(Math.random() * 19) + 1}K+` : '',
        promo: promos[i % promos.length],
        badge: Math.random() > 0.7 ? 'Orgánico' : '',
        category: cats[i % cats.length],
        tags: [tagsPool[Math.floor(Math.random() * tagsPool.length)]],
      };
    });
  }
}
