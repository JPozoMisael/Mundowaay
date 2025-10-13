import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductsService, Product } from 'src/app/servicios/products';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit, OnDestroy {
  q = '';
  cat = '';
  query = '';
  results: Product[] = [];
  suggestions: Product[] = [];
  popularSearches = ['semillas', 'maíz', 'soja', 'arroz', 'fertilizantes', 'foliar', 'rosas'];
  total = 0;
  loading = false;
  showSuggestions = false;

  private destroy$ = new Subject<void>();
  private inputChanged$ = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsSvc: ProductsService
  ) {}

  ngOnInit() {
    // Escuchar parámetros de búsqueda
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.q = params.get('q') || '';
        this.cat = params.get('cat') || '';
        this.query = this.q;
        this.searchNow();
      });

    // Detectar cambios en el input y mostrar sugerencias
    this.inputChanged$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        if (!term.trim()) {
          this.suggestions = [];
          return;
        }
        this.productsSvc.search(term).subscribe(({ items }) => {
          this.suggestions = items.slice(0, 6);
        });
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔹 Ejecutar búsqueda principal
  private searchNow() {
    if (!this.q) return;
    this.loading = true;
    this.productsSvc
      .search(this.q, this.cat)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ items, total }) => {
        this.results = items;
        this.total = total;
        this.loading = false;
      });
  }

  // 🔹 Evento de escritura en el buscador
  onSearchChange(event: any) {
    const term = event.detail.value || '';
    this.inputChanged$.next(term);
  }

  // 🔹 Abrir producto desde sugerencia
  openSuggestion(p: Product) {
    this.showSuggestions = false;
    this.router.navigate(['/producto', p.id]);
  }

  // 🔹 Cerrar sugerencias con pequeño retardo
  hideSuggestionsDelayed() {
    setTimeout(() => (this.showSuggestions = false), 200);
  }

  // 🔹 Formato de moneda
  money(n?: number) {
    if (n == null || isNaN(n)) return '$0.00';
    return `$${n.toFixed(2)}`;
  }

  // 🔹 Búsqueda rápida desde chip popular
  quickSearch(tag: string) {
    this.query = tag;
    this.showSuggestions = false;
    this.router.navigate(['/search'], { queryParams: { q: tag } });
  }

  // ✅ Recuperadas de tu versión anterior:
  clear() {
    this.router.navigate(['/search'], { queryParams: {} });
    this.query = '';
    this.suggestions = [];
    this.results = [];
  }

  open(p: Product) {
    this.router.navigate(['/producto', p.id]);
  }

  hasDiscount(p: Product) {
    return p.price != null && p.compareAt != null && p.compareAt > p.price;
  }

  pct(p: Product) {
    if (!this.hasDiscount(p)) return 0;
    return Math.round(((p.compareAt! - (p.price ?? 0)) / p.compareAt!) * 100);
  }
}
