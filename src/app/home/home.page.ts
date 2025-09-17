import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { CatalogoBus, CatalogItem } from 'src/app/servicios/catalogo-bus';

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
};

// --- tipo para las tiles ---
type Tile = {
  title: string;
  link: string | any[];
  imgs: Array<{ src: string; alt: string }>;
  cta: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('stripEl', { static: false }) stripEl?: ElementRef<HTMLDivElement>;

  banners = [
    { img: 'assets/banners/maiz-1.jpg', title: 'Compra fácil y seguro', subtitle: 'Ofertas para productores' },
    { img: 'assets/banners/maiz-2.jpg', title: 'Temporada de siembra', subtitle: 'Descuentos limitados' },
  ];

  flashDeals: Product[] = [];
  products: Product[] = [];
  private page = 0;

  // 🔄 Tiles dinámicas
  tiles: Tile[] = [];

  // Config de secciones para tiles
  private readonly tileCfg: Array<{ title: string; link: string | any[]; query: string; cta: string }> = [
    { title: 'Semillas destacadas',     link: '/semillas',     query: 'semilla',                                      cta: 'Ver más' },
    { title: 'Control de insectos',     link: '/insecticidas', query: 'insecticida',                                  cta: 'Ver más' },
    { title: 'Herbicidas populares',    link: '/herbicidas',   query: 'herbicida',                                    cta: 'Ver más' },
    { title: 'Nutrición foliar y más',  link: '/nutricion',    query: 'foliar bioestimulante macro micro quelatado', cta: 'Descubrir' },
  ];

  // ⏳ polling temporal hasta que el bus tenga datos
  private pollId?: any;
  private pollCount = 0;

  constructor(private catalog: CatalogoBus) {}

  ngOnInit() {
    this.refreshFromBus();
    this.startPollingForBus();
  }

  ngOnDestroy() { this.stopPolling(); }

  // ------- data --------
  private refreshFromBus() {
    const all = this.catalog.listAll();

    if (all.length) {
      const deals = all
        .filter(p => (p.compareAt ?? 0) > (p.price ?? 0))
        .sort((a, b) => this.offPct(b) - this.offPct(a))
        .slice(0, 10)
        .map(p => this.view(p));

      const trending = all
        .slice()
        .sort((a, b) => this.score(b) - this.score(a))
        .slice(0, 20)
        .map(p => this.view(p));

      this.flashDeals = deals;
      this.products = trending;
      this.buildTiles(); // ya hay data
      return;
    }

    // 🔙 fallback temporal si aún no hay data de Wix
    this.flashDeals = this.mock(10);
    this.products  = this.mock(20);
    this.buildTiles(); // se rellenan con placeholders
  }

  private view(p: CatalogItem): Product {
    return {
      id: p.id,
      title: p.title,
      image: p.image || 'assets/img/placeholder.png',
      price: p.price ?? 0,
      compareAt: p.compareAt,
      rating: p.rating ?? 4,
      reviews: p.reviews ?? 0,
    };
  }

  // Helpers
  money(n: number) { return `$${(n || 0).toFixed(2)}`; }
  discount(p: Product) {
    if (!p.compareAt || p.compareAt <= p.price) return '';
    const pct = Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
    return `-${pct}%`;
  }
  private offPct(p: { price?: number; compareAt?: number }) {
    if (!p.compareAt || !p.price || p.compareAt <= p.price) return 0;
    return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
  }
  private score(p: CatalogItem) {
    const base = (p.rating ?? 0) * 100 + (p.reviews ?? 0);
    const hasDiscount = (p.compareAt ?? 0) > (p.price ?? 0);
    return base + (hasDiscount ? 150 : 0);
  }

  addToCart(p: Product) { console.log('ADD TO CART', p.id); }

  async loadMore(ev: Event) {
    this.page++;
    this.products = [...this.products, ...this.mock(12)];
    (ev as InfiniteScrollCustomEvent).target.complete();
  }

  // ------- fallback mock (se usa sólo si aún no hay data real) -------
  private mock(n: number): Product[] {
    return Array.from({ length: n }).map((_, i) => {
      const id = `P${this.page}-${i}`;
      const base = 2 + Math.random() * 50;
      const hasCompare = Math.random() > 0.5;
      return {
        id,
        title: ['Semilla Híbrida', 'Insecticida', 'Fertilizante', 'Herbicida', 'Maquinaria'][i % 5] + ' ' + (100 + i),
        image: `https://picsum.photos/seed/${id}/480/480`,
        price: Number(base.toFixed(2)),
        compareAt: hasCompare ? Number((base + (Math.random()*10+3)).toFixed(2)) : undefined,
        rating: Math.floor(Math.random() * 3) + 3,
        reviews: Math.floor(Math.random() * 3000),
      };
    });
  }

  // Strip
  stripItems = Array.from({ length: 10 }).map((_, i) => ({
    title: 'Recomendado ' + (i + 1),
    img: `https://picsum.photos/seed/strip-${i}/720/540`
  }));
  scrollStrip(dir: number) {
    const el = this.stripEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  // ------- Tiles dinámicas -------
  private buildTiles() {
    const gotData = this.catalog.listAll().length > 0;
    const result: Tile[] = [];

    for (const cfg of this.tileCfg) {
      const imgs = gotData ? this.pickImages(cfg.query, 4) : this.fallbackPicsum(4);
      result.push({ title: cfg.title, link: cfg.link, imgs, cta: cfg.cta });
    }

    this.tiles = result;
  }

  private pickImages(query: string, n = 4): Array<{ src: string; alt: string }> {
    const items = this.catalog.search(query, { limit: 60 }).items;

    const seen = new Set<string>();
    const imgs: Array<{ src: string; alt: string }> = [];
    for (const p of items) {
      const url = (p.image || '').trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      imgs.push({ src: this.thumb(url, 300, 220), alt: p.title });
      if (imgs.length >= n) break;
    }

    while (imgs.length < n) {
      imgs.push({ src: this.placeholder(300, 220, imgs.length), alt: 'Imagen' });
    }
    return imgs;
  }

  private thumb(url: string, w: number, h: number): string {
    if (!url) return this.placeholder(w, h);
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}w=${w}&h=${h}&fit=crop&quality=85`;
  }

  private placeholder(w = 300, h = 220, seed = 1): string {
    return `https://picsum.photos/seed/fallback-${seed}/${w}/${h}`;
  }

  private fallbackPicsum(n = 4): Array<{ src: string; alt: string }> {
    return Array.from({ length: n }).map((_, i) => ({
      src: this.placeholder(300, 220, i + 1),
      alt: 'Placeholder'
    }));
  }

  // ⏳ polling simple para “esperar” a que CatalogoBus tenga datos
  private startPollingForBus() {
    this.stopPolling();
    this.pollCount = 0;
    this.pollId = setInterval(() => {
      this.pollCount++;
      const had = this.catalog.listAll().length > 0;
      this.refreshFromBus();
      if (had || this.pollCount >= 8) this.stopPolling(); // ~6–8s máx
    }, 800);
  }
  private stopPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = undefined;
    }
  }
}
