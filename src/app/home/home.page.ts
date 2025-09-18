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

// 🔹 Nuevo tipo para la tira horizontal
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
  stripItems: StripItem[] = [];   // 👈 ahora con link incluido

  private page = 0;
  private pollId?: any;
  private pollCount = 0;
  private usedIds = new Set<string>();

  private readonly topCfg: Array<{ title: string; query: string; multi?: boolean; desc?: string; link?: string | any[] }> = [
    { title: 'Cosecha más eficiente', query: 'maquinaria', desc: 'Tecnología agrícola de alto rendimiento', link: '/maquinaria'},
    { title: 'Nutrición Foliar', query: 'foliar', desc: 'Fertilizantes para un crecimiento rápido' , link: '/nutricion'},
    { title: 'Comienza desde la raíz', query: 'semilla', desc: 'Protección contra plagas' , link: '/semillas'},
    { title: 'Productos esenciales para el agricultor', query: 'maquinaria', multi: true, desc: 'Explora todos los productos', link: '/maquinaria'},
  ];

  private readonly tileCfg: Array<{ title: string; link: string | any[]; query: string; cta: string }> = [
    { title: 'Semillas destacadas',     link: '/semillas',     query: 'semilla',        cta: 'Ver más' },
    { title: 'Control de insectos',     link: '/insecticidas', query: 'insecticida',    cta: 'Ver más' },
    { title: 'Herbicidas populares',    link: '/herbicidas',   query: 'herbicida',      cta: 'Ver más' },
    { title: 'Nutrición foliar y más',  link: '/nutricion',    query: 'foliar',         cta: 'Descubrir' },
  ];

  constructor(private catalog: CatalogoBus) {}

  ngOnInit() {
    this.refreshFromBus();
    this.startPollingForBus();
  }

  ngOnDestroy() { this.stopPolling(); }

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

      this.usedIds.clear();
      this.buildTopCards();
      this.buildStrip();
      this.buildTiles();
      return;
    }

    this.flashDeals = this.mock(10);
    this.products  = this.mock(20);
    this.topCards  = this.mockTopCards();
    this.stripItems = this.mockStrip(10);
    this.buildTiles();
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

  // 🔹 Uniforme y multi para productos esenciales
  private buildTopCards() {
    const result: TopCard[] = [];

    for (const cfg of this.topCfg) {
      if (cfg.multi) {
        const items = this.catalog.search(cfg.query, { limit: 20 }).items;
        const imgs: Array<{ src: string; alt: string }> = [];

        for (const p of items) {
          if (!p.image || this.usedIds.has(p.id)) continue;
          this.usedIds.add(p.id);
          imgs.push({
            src: this.thumb(p.image, 300, 220), 
            alt: this.creativeSubtitle(p.title)
          });
          if (imgs.length >= 4) break;
        }

        result.push({ title: cfg.title, imgs, desc: cfg.desc, multi: true, link: cfg.link });
      } else {
        const items = this.catalog.search(cfg.query, { limit: 20 }).items;
        let img = '';

        for (const p of items) {
          if (!p.image || this.usedIds.has(p.id)) continue;
          this.usedIds.add(p.id);
          img = this.thumb(p.image, 480, 360);
          break;
        }

        result.push({ title: cfg.title, img, desc: cfg.desc, link: cfg.link });
      }
    }

    this.topCards = result;
  }

  // 🔹 Tira horizontal con categorías variadas
  private buildStrip() {
    this.stripItems = [];

    const categorias = [
      { query: 'semilla', link: '/semillas' },
      { query: 'insecticida', link: '/insecticidas' },
      { query: 'herbicida', link: '/herbicidas' },
      { query: 'foliar', link: '/nutricion' },
      { query: 'maquinaria', link: '/maquinaria' }
    ];

    for (const cat of categorias) {
      const items = this.catalog.search(cat.query, { limit: 20 }).items;
      let count = 0;

      for (const p of items) {
        if (!p.image || this.usedIds.has(p.id)) continue;
        this.usedIds.add(p.id);

        this.stripItems.push({
          title: p.title,
          img: this.thumb(p.image, 720, 540),
          link: cat.link   // 👈 ahora permitido
        });

        count++;
        if (count >= 2) break;
        //if (this.stripItems.length >= 10) break; 
      }
      //if (this.stripItems.length >= 10) break;
    }
  }

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

    const imgs: Array<{ src: string; alt: string }> = [];
    for (const p of items) {
      if (!p.image || this.usedIds.has(p.id)) continue;
      this.usedIds.add(p.id);
      imgs.push({ src: this.thumb(p.image, 300, 220), alt: p.title });
      if (imgs.length >= n) break;
    }

    while (imgs.length < n) {
      imgs.push({ src: this.placeholder(300, 220, imgs.length), alt: 'Imagen' });
    }
    return imgs;
  }

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

  private fallbackPicsum(n = 4): Array<{ src: string; alt: string }> {
    return Array.from({ length: n }).map((_, i) => ({
      src: this.placeholder(300, 220, i + 1),
      alt: 'Placeholder'
    }));
  }

  private mock(n: number): Product[] {
    return Array.from({ length: n }).map((_, i) => {
      const id = `P${this.page}-${i}`;
      return {
        id,
        title: 'Producto ' + (i + 1),
        image: `https://picsum.photos/seed/${id}/480/480`,
        price: 10 + i,
        rating: 4,
        reviews: 100,
      };
    });
  }

  private mockTopCards(): TopCard[] {
    return this.topCfg.map((cfg, i) => {
      if (cfg.multi) {
        return {
          title: cfg.title,
          imgs: Array.from({ length: 4 }).map((_, j) => ({
            src: this.placeholder(300, 220, j),
            alt: 'Demo'
          })),
          desc: cfg.desc,
          multi: true,
        };
      }
      return {
        title: cfg.title,
        img: this.placeholder(480, 360, i),
        desc: cfg.desc,
      };
    });
  }

  private mockStrip(n: number): StripItem[] {
    return Array.from({ length: n }).map((_, i) => ({
      title: 'Strip ' + (i + 1),
      img: `https://picsum.photos/seed/strip-${i}/720/540`,
      link: '/semillas'
    }));
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

  scrollStrip(dir: number) {
    const el = this.stripEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  private startPollingForBus() {
    this.stopPolling();
    this.pollCount = 0;
    this.pollId = setInterval(() => {
      this.pollCount++;
      const had = this.catalog.listAll().length > 0;
      this.refreshFromBus();
      if (had || this.pollCount >= 8) this.stopPolling();
    }, 800);
  }
  private stopPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = undefined;
    }
  }
}
