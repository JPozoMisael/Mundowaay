import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ProductsService, Product } from '../servicios/products';
import { CartService } from '../servicios/cart';
import { Subscription } from 'rxjs';

type Tile = {
  title: string;
  link: string | any[];
  imgs: Array<{ src: string; alt: string }>;
  cta: string;
};

type TopCard = {
  title: string;
  img?: string;
  imgs?: Array<{ src: string; alt: string }>;
  desc?: string;
  multi?: boolean;
  link?: string | any[];
};

type StripItem = {
  title: string;
  img: string;
  link: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('stripEl', { static: false }) stripEl?: ElementRef<HTMLDivElement>;

  flashDeals: Product[] = [];
  products: Product[] = [];
  tiles: Tile[] = [];
  topCards: TopCard[] = [];
  stripItems: StripItem[] = [];

  loading = false;
  error = false;
  private subs: Subscription[] = [];
  private usedIds = new Set<string>();
  private slideInterval?: any;
  currentSlide = 0;

  // 🎞️ Slider Hero
  slides = [
    { text: 'Compra fácil y seguro', color: '#d9a320' },
    { text: 'Tecnología confiable', color: '#2f72c9' },
    { text: 'Aliado del agricultor', color: '#16a085' },
    { text: 'Productos de calidad', color: '#e74c3c' }
  ];

  // Configuraciones de secciones
  private readonly topCfg = [
    { title: 'Cosecha más eficiente', query: 'maquinaria', desc: 'Tecnología agrícola de alto rendimiento', link: '/maquinaria' },
    { title: 'Nutrición Foliar', query: 'foliar', desc: 'Fertilizantes para un crecimiento rápido', link: '/nutricion' },
    { title: 'Comienza desde la raíz', query: 'semilla', desc: 'Protección contra plagas', link: '/semillas' },
    { title: 'Productos esenciales para el agricultor', query: 'maquinaria', multi: true, desc: 'Explora todos los productos', link: '/maquinaria' },
  ];

  private readonly tileCfg = [
    { title: 'Semillas destacadas', link: '/semillas', query: 'semilla', cta: 'Ver más' },
    { title: 'Control de insectos', link: '/insecticidas', query: 'insecticida', cta: 'Ver más' },
    { title: 'Herbicidas populares', link: '/herbicidas', query: 'herbicida', cta: 'Ver más' },
    { title: 'Nutrición foliar y más', link: '/nutricion', query: 'foliar', cta: 'Descubrir' },
  ];

  constructor(
    private productsService: ProductsService,
    private cartService: CartService
  ) {}

  // ======================
  // 🌅 Ciclo de vida
  // ======================
  ngOnInit() {
    console.log('[HomePage] Solicitando productos desde el servicio...');
    this.refreshProducts();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
    this.subs.forEach(s => s.unsubscribe());
  }

  // ======================
  // 🎞️ Hero Slider
  // ======================
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = undefined;
    }
  }

  // ======================
  // 📦 Cargar productos
  // ======================
  refreshProducts() {
    this.loading = true;
    this.error = false;

    const sub = this.productsService.listAll().subscribe({
      next: all => {
        this.loading = false;

        if (!all?.length) {
          this.error = true;
          console.warn('⚠️ No se recibieron productos desde la API.');
          return;
        }

        console.log(`[HomePage] Productos recibidos: ${all.length}`);

        // Filtrar solo productos con imagen real
        const validProducts = all.filter(p => p.imageUrl && !p.imageUrl.includes('placeholder'));

        const deals = validProducts
          .filter(p => (p.compareAt ?? 0) > (p.price ?? 0))
          .sort((a, b) => this.offPct(b) - this.offPct(a))
          .slice(0, 10);

        const trending = validProducts
          .slice()
          .sort((a, b) => this.score(b) - this.score(a))
          .slice(0, 20);

        this.flashDeals = deals;
        this.products = trending;
        this.usedIds.clear();

        this.buildTopCards(validProducts);
        this.buildStrip(validProducts);
        this.buildTiles(validProducts);

        console.log(`[HomePage] Estructuras generadas: 
          - TopCards: ${this.topCards.length} 
          - StripItems: ${this.stripItems.length} 
          - Tiles: ${this.tiles.length}`);
      },
      error: err => {
        this.loading = false;
        this.error = true;
        console.error('❌ Error cargando productos:', err);
      }
    });

    this.subs.push(sub);
  }

  // ======================
  // 🛒 Añadir al carrito
  // ======================
  addToCart(product: Product) {
    if (!product?.id) return;

    const item = {
      id: product.id,
      title: product.title,
      price: product.price ?? 0,
      image: product.imageUrl ?? 'assets/img/placeholder.png',
      qty: 1
    };

    this.cartService.add(item).subscribe({
      next: () => console.log(`🛒 Producto añadido: ${product.title}`),
      error: err => console.error('❌ Error al añadir al carrito:', err)
    });
  }

  // ======================
  // 🔹 Top Cards
  // ======================
  private buildTopCards(all: Product[]) {
    const result: TopCard[] = [];

    for (const cfg of this.topCfg) {
      const items = all.filter(p => {
        const q = cfg.query.toLowerCase();
        return (
          (p.title ?? '').toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
          (p.category ?? '').toLowerCase().includes(q)
        );
      });

      const valid = items.filter(p => p.imageUrl && !p.imageUrl.includes('placeholder'));

      if (cfg.multi) {
        const imgs = valid.slice(0, 4).map(p => ({
          src: p.imageUrl!,
          alt: this.creativeSubtitle(p.title)
        }));
        result.push({ title: cfg.title, imgs, desc: cfg.desc, multi: true, link: cfg.link });
      } else {
        const first = valid[0];
        result.push({
          title: cfg.title,
          img: first?.imageUrl || this.placeholder(480, 360),
          desc: cfg.desc,
          link: cfg.link
        });
      }
    }

    this.topCards = result;
  }

  // ======================
  // 🔹 Strip horizontal
  // ======================
  private buildStrip(all: Product[]) {
    this.stripItems = [];
    const categorias = [
      { query: 'semilla', link: '/semillas' },
      { query: 'insecticida', link: '/insecticidas' },
      { query: 'herbicida', link: '/herbicidas' },
      { query: 'foliar', link: '/nutricion' },
      { query: 'maquinaria', link: '/maquinaria' }
    ];

    for (const cat of categorias) {
      const items = all.filter(p =>
        (p.title ?? '').toLowerCase().includes(cat.query) ||
        (p.tags || []).some(t => t.toLowerCase().includes(cat.query)) ||
        (p.category ?? '').toLowerCase().includes(cat.query)
      );

      const valid = items.filter(p => p.imageUrl && !p.imageUrl.includes('placeholder'));

      for (const p of valid.slice(0, 2)) {
        if (this.usedIds.has(p.id)) continue;
        this.usedIds.add(p.id);

        this.stripItems.push({
          title: p.title,
          img: this.thumb(p.imageUrl, 720, 540),
          link: cat.link
        });
      }
    }
  }

  // ======================
  // 🔹 Tiles (bloques de 4)
  // ======================
  private buildTiles(all: Product[] = []) {
    const result: Tile[] = [];

    for (const cfg of this.tileCfg) {
      const items = all.filter(p =>
        (p.title ?? '').toLowerCase().includes(cfg.query) ||
        (p.tags || []).some(t => t.toLowerCase().includes(cfg.query)) ||
        (p.category ?? '').toLowerCase().includes(cfg.query)
      );

      const valid = items.filter(p => p.imageUrl && !p.imageUrl.includes('placeholder'));

      const imgs = valid.slice(0, 4).map(p => ({
        src: p.imageUrl!,
        alt: p.title
      }));

      while (imgs.length < 4) {
        imgs.push({ src: this.placeholder(300, 220, imgs.length), alt: 'Imagen' });
      }

      result.push({ title: cfg.title, link: cfg.link, imgs, cta: cfg.cta });
    }

    this.tiles = result;
  }

  // ======================
  // 🎨 Utilitarios
  // ======================
  private creativeSubtitle(base: string): string {
    const opciones = [
      'Herramienta esencial',
      'Máquina de alto rendimiento',
      'Aliado del agricultor',
      'Tecnología en acción',
      'Equipo confiable'
    ];
    return opciones[Math.floor(Math.random() * opciones.length)];
  }

  private thumb(url: string | undefined, w: number, h: number): string {
    if (!url) return this.placeholder(w, h);
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=${w}&h=${h}&fit=crop&quality=85`;
  }

  private placeholder(w = 300, h = 220, seed = 1): string {
    return `https://picsum.photos/seed/fallback-${seed}/${w}/${h}`;
  }

  private offPct(p: { price?: number | null; compareAt?: number | null }) {
    const price = p.price ?? 0;
    const compareAt = p.compareAt ?? 0;
    if (compareAt <= price) return 0;
    return Math.round(((compareAt - price) / compareAt) * 100);
  }

  private score(p: Product) {
    const base = ((p as any).rating ?? 0) * 100 + ((p as any).reviews ?? 0);
    const hasDiscount = (p.compareAt ?? 0) > (p.price ?? 0);
    return base + (hasDiscount ? 150 : 0);
  }

  scrollStrip(dir: number) {
    const el = this.stripEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }
}
