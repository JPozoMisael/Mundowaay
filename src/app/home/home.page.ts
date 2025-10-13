import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ProductsService, Product } from 'src/app/servicios/products';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(IonContent, { static: true }) content!: IonContent;
  @ViewChild('stripEl') stripEl!: ElementRef<HTMLDivElement>;

  products: Product[] = [];
  loading = true;
  error = false;

  currentSlide = 0;
  subs: Subscription[] = [];

  // 🔹 Header autoocultable
  private lastScrollTop = 0;
  isHidden = false;

  // 🔹 Secciones dinámicas
  topCards: any[] = [];
  stripItems: any[] = [];
  tiles: any[] = [];
  slides: any[] = [];

  constructor(private productsSvc: ProductsService) {}

  // ============================================================
  // 🚀 CICLO DE VIDA
  // ============================================================
  ngOnInit() {
    this.loadProducts();
    this.buildStaticSections();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ============================================================
  // 📦 CARGA DE PRODUCTOS
  // ============================================================
  loadProducts() {
    this.loading = true;
    this.error = false;

    const sub = this.productsSvc.getAll().subscribe({
      next: (data) => {
        this.products = data || [];
        this.loading = false;
        this.error = false;
        this.buildSections();
      },
      error: (err) => {
        console.error('❌ Error cargando productos:', err);
        this.loading = false;
        this.error = true;
      },
    });

    this.subs.push(sub);
  }

  refreshProducts() {
    this.loadProducts();
  }

  // ============================================================
  // 🧩 CONSTRUCCIÓN DE SECCIONES (HOME)
  // ============================================================
  buildStaticSections() {
    this.slides = [
      { text: 'Innovación agrícola para el futuro', color: 'linear-gradient(135deg,#0052cc,#007bff)' },
      { text: 'Tecnología y genética para el campo', color: 'linear-gradient(135deg,#00897b,#26a69a)' },
      { text: 'Semillas, insumos y soluciones integrales', color: 'linear-gradient(135deg,#512da8,#9575cd)' },
    ];
  }

  buildSections() {
    this.topCards = [
      {
        title: 'Semillas Premium',
        img: this.findImg('semillas'),
        desc: 'Los híbridos más productivos del país',
        link: '/semillas',
      },
      {
        title: 'Insecticidas',
        img: this.findImg('insecticidas'),
        desc: 'Protege tus cultivos con tecnología avanzada',
        link: '/insecticidas',
      },
      {
        title: 'Nutrición Foliar',
        img: this.findImg('nutricion'),
        desc: 'Soluciones efectivas para el vigor vegetal',
        link: '/nutricion',
      },
    ];

    this.stripItems = [
      { title: 'Bioestimulantes', link: '/bioestimulantes', img: this.findImg('bioestimulantes') },
      { title: 'Herbicidas', link: '/herbicidas', img: this.findImg('herbicidas') },
      { title: 'Fungicidas', link: '/fungicidas', img: this.findImg('fungicidas') },
      { title: 'Maquinaria', link: '/maquinaria', img: this.findImg('maquinaria') },
    ];

    this.tiles = [
      {
        title: 'Explora por categoría',
        link: '/semillas',
        imgs: [
          { src: this.findImg('semillas'), alt: 'Semillas' },
          { src: this.findImg('insecticidas'), alt: 'Insecticidas' },
          { src: this.findImg('nutricion'), alt: 'Nutrición Foliar' },
          { src: this.findImg('maquinaria'), alt: 'Maquinaria' },
        ],
      },
    ];
  }

  private findImg(keyword: string): string {
    return (
      this.products.find(p => p.category?.toLowerCase().includes(keyword.toLowerCase()))?.imageUrl ||
      'assets/img/placeholder.png'
    );
  }

  // ============================================================
  // 🎠 SLIDER PRINCIPAL
  // ============================================================
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  // ============================================================
  // 🧭 SCROLL Y HEADER AUTOOCULTABLE
  // ============================================================
  onScroll(ev: CustomEvent) {
    const scrollTop = ev.detail.scrollTop;
    const delta = scrollTop - this.lastScrollTop;

    if (Math.abs(delta) > 5) {
      if (delta > 0 && scrollTop > 80) this.isHidden = true;
      else this.isHidden = false;
    }

    this.lastScrollTop = scrollTop;
  }

  // ============================================================
  // 🧱 SCROLL HORIZONTAL STRIP
  // ============================================================
  scrollStrip(dir: number) {
    if (!this.stripEl) return;
    const el = this.stripEl.nativeElement;
    el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  }

  // ============================================================
  // 🔎 EVENTOS GLOBALES (HEADER)
  // ============================================================
  onGlobalSearch(ev: any) {
    const query = ev?.detail?.value || ev?.value || '';
    if (!query || query.trim() === '') return;
    console.log('🔍 Búsqueda global:', query);
    // this.router.navigate(['/buscar'], { queryParams: { q: query } });
  }

  onGlobalCat(cat: any) {
    const category = typeof cat === 'string' ? cat : cat?.detail?.value || '';
    if (!category) return;
    console.log('📦 Categoría seleccionada:', category);
    // this.router.navigate(['/categoria', category]);
  }
}
