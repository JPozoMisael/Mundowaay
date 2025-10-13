import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ProductsService, Product } from '../servicios/products';
import { Router } from '@angular/router';

type Tile = { title: string; link: string | any[]; imgs: Array<{ src: string; alt: string }>; cta: string };
type TopCard = { title: string; img?: string; imgs?: Array<{ src: string; alt: string }>; desc?: string; multi?: boolean; link: string | any[] };
type StripItem = { title: string; img: string; link: string };

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild('stripEl', { static: false }) stripEl?: ElementRef<HTMLDivElement>;

  currentYear = new Date().getFullYear();
  isHeaderVisible = true;
  usedImages = new Set<string>(); // dedupe global

  // Slider con colores distintos (solo fondo; texto sin borde)
  slides = [
    { text: 'Compra fácil y seguro',  color: 'linear-gradient(135deg, #1e88e5, #1565c0)' },
    { text: 'Tecnología confiable',   color: 'linear-gradient(135deg, #00bfa5, #00695c)' },
    { text: 'Aliado del agricultor',  color: 'linear-gradient(135deg, #fdd835, #f9a825)' },
    { text: 'Productos de calidad',   color: 'linear-gradient(135deg, #ef5350, #c62828)' },
  ];
  currentSlide = 0;
  private slideInterval?: any;

  products: Product[] = [];
  topCards: TopCard[] = [];
  tiles: Tile[] = [];
  stripItems: StripItem[] = [];

  constructor(private productsService: ProductsService, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
    this.startAutoSlide();
  }
  ngOnDestroy() { this.stopAutoSlide(); }

  // ========= Slider =========
  nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.slides.length; }
  prevSlide() { this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length; }
  startAutoSlide() { this.stopAutoSlide(); this.slideInterval = setInterval(() => this.nextSlide(), 5000); }
  stopAutoSlide() { if (this.slideInterval) clearInterval(this.slideInterval); }

  // ========= Carga =========
  private loadProducts() {
    this.productsService.listAll().subscribe(all => {
      if (!all?.length) return;

      // Ordena “recientes” primero si el id es numérico
      all.sort((a, b) => {
        const A = Number.parseInt(String(a.id ?? '0'), 10);
        const B = Number.parseInt(String(b.id ?? '0'), 10);
        return (Number.isFinite(B) ? B : 0) - (Number.isFinite(A) ? A : 0);
      });

      this.products = all;
      this.usedImages.clear();

      this.buildTopCards(all);
      this.buildStrip(all);
      this.buildTiles(all);
    });
  }

  // ========= Reglas de categoría (positivas/negativas) =========
  private KEYWORDS = {
    'semillas': {
      pos: ['semilla', 'maíz', 'maiz', 'soya', 'soja', 'trigo', 'arroz', 'híbrido', 'hibrido', 'variedad'],
      neg: ['bomba', 'mochila', 'fumigador', 'fumigadora', 'pulverizador', 'dron', 'drone', 'sembradora', 'cosechadora', 'tanque', 'motor'],
    },
    'insecticidas': {
      pos: ['insecticida', 'acaricida', 'plaga', 'lambda', 'imidacloprid', 'acetamiprid', 'clorpirifos'],
      neg: ['herbicida', 'fungicida', 'foliar', 'fertilizante'],
    },
    'herbicidas': {
      pos: ['herbicida', 'maleza', 'glifosato', 'paraquat', 'graminicida'],
      neg: ['insecticida', 'fungicida', 'foliar', 'fertilizante'],
    },
    'nutrición foliar': {
      pos: ['foliar', 'fertilizante', 'npk', 'potasio', 'fósforo', 'fosforo', 'micronutriente', 'quelato', 'oligo'],
      neg: ['insecticida', 'herbicida', 'fungicida'],
    },
    'maquinaria': {
      pos: ['bomba', 'mochila', 'fumigador', 'fumigadora', 'pulverizador', 'dron', 'drone', 'sembradora', 'riego', 'motor', 'tanque'],
      neg: [],
    },
  };

  private norm(s = '') { 
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); 
  }

  private textBlob(p: Product) {
    const parts = [p.title, (p as any).desc, (p as any).description].filter(Boolean);
    return this.norm(parts.join(' '));
  }

  /** Coincidencia estricta: categoría exacta + señales semánticas */
  private matchesCategoryStrict(p: Product, target: string): boolean {
    const catOk = this.norm(p.category ?? '') === this.norm(target);
    if (!catOk) return false;

    const key = this.norm(target);
    const rule = this.KEYWORDS[key as keyof typeof this.KEYWORDS];
    if (!rule) return true;

    const blob = this.textBlob(p);
    const hasPos = rule.pos.some(k => blob.includes(this.norm(k)));
    const hasNeg = rule.neg.some(k => blob.includes(this.norm(k)));

    // Para Semillas exigimos al menos una señal positiva (evita “dron” clasificado mal)
    if (key === 'semillas') return hasPos && !hasNeg;

    // Para las demás: permitir si NO hay negativas (positivas ayudan, pero no forzamos)
    return !hasNeg;
  }

  private nextImage(p: Product, w: number, h: number): string {
    const src = p.imageUrl || this.placeholder(w, h);
    return src;
  }

  /** Devuelve hasta `limit` productos válidos de la categoría, sin repetir imagen globalmente */
  private pickForCategory(all: Product[], category: string, limit: number): Product[] {
    const out: Product[] = [];
    for (const p of all) {
      if (out.length >= limit) break;
      if (!this.matchesCategoryStrict(p, category)) continue;

      const src = p.imageUrl;
      if (!src || this.usedImages.has(src)) continue;

      this.usedImages.add(src);
      out.push(p);
    }
    return out;
  }

  // ========= Secciones =========
  private buildTopCards(all: Product[]) {
    const cfgs = [
      { title: 'Cosecha más eficiente', query: 'Maquinaria', desc: 'Tecnología agrícola de alto rendimiento', link: '/maquinaria' },
      { title: 'Nutrición Foliar',      query: 'Nutrición Foliar', desc: 'Fertilizantes para un crecimiento rápido', link: '/nutricion' },
      { title: 'Comienza desde la raíz',query: 'Semillas', desc: 'Protección contra plagas', link: '/semillas' },
      { title: 'Productos esenciales para el agricultor', query: 'Maquinaria', multi: true, desc: 'Explora todos los productos', link: '/maquinaria' },
    ];

    const res: TopCard[] = [];

    for (const cfg of cfgs) {
      if (cfg.multi) {
        const picks = this.pickForCategory(all, cfg.query, 4);
        const imgs = picks.map(p => ({ src: this.nextImage(p, 300, 220), alt: p.title }));
        while (imgs.length < 4) imgs.push({ src: this.placeholder(300, 220, imgs.length), alt: 'Placeholder' });

        res.push({ title: cfg.title, imgs, desc: cfg.desc, multi: true, link: cfg.link });
      } else {
        const picks = this.pickForCategory(all, cfg.query, 1);
        const imgSrc = picks[0]?.imageUrl || this.placeholder(480, 360);
        res.push({ title: cfg.title, img: imgSrc, desc: cfg.desc, link: cfg.link });
      }
    }

    this.topCards = res;
  }

  private buildStrip(all: Product[]) {
    const categorias = ['Semillas', 'Insecticidas', 'Herbicidas', 'Nutrición Foliar', 'Maquinaria'];
    const out: StripItem[] = [];

    for (const cat of categorias) {
      const picks = this.pickForCategory(all, cat, 2);
      for (const p of picks) {
        out.push({
          title: p.title,
          img: this.nextImage(p, 720, 540),
          link: `/${this.norm(cat)}`,
        });
      }
    }

    this.stripItems = out;
  }

  private buildTiles(all: Product[]) {
    const cfgs = [
      { title: 'Semillas destacadas',     link: '/semillas',     query: 'Semillas',        cta: 'Ver más' },
      { title: 'Control de insectos',     link: '/insecticidas', query: 'Insecticidas',    cta: 'Ver más' },
      { title: 'Herbicidas populares',    link: '/herbicidas',   query: 'Herbicidas',      cta: 'Ver más' },
      { title: 'Nutrición foliar y más',  link: '/nutricion',    query: 'Nutrición Foliar',cta: 'Descubrir' },
    ];

    this.tiles = cfgs.map(c => {
      const picks = this.pickForCategory(all, c.query, 4);
      const imgs = picks.map(p => ({ src: this.nextImage(p, 300, 220), alt: p.title }));

      while (imgs.length < 4) imgs.push({ src: this.placeholder(300, 220, imgs.length), alt: 'Placeholder' });

      return { title: c.title, link: c.link, imgs, cta: c.cta };
    });
  }

  // ========= Utils =========
  private placeholder(w = 300, h = 220, seed = 1) {
    return `https://picsum.photos/seed/fallback-${seed}/${w}/${h}`;
  }

  scrollStrip(dir: number) {
    const el = this.stripEl?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  goToCategory(catLink?: string | any[]) {
    if (!catLink) return;
    if (Array.isArray(catLink)) this.router.navigate(catLink);
    else this.router.navigate([catLink]);
  }

  onScroll(ev: any) {
    const scrollTop = ev.detail?.scrollTop || 0;
    this.isHeaderVisible = scrollTop < 80;
  }

  onGlobalSearch(query: string) { console.log('Buscar:', query); }
  onGlobalCat(cat: string) { console.log('Categoría:', cat); }
}
