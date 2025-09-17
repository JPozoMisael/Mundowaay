import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogoBus, CatalogItem } from 'src/app/servicios/catalogo-bus';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: false,
})
export class SearchPage implements OnInit, OnDestroy {
  q = ''; cat = '';
  results: CatalogItem[] = [];
  total = 0; loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalog: CatalogoBus
  ) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(map(p => ({ q: p.get('q') || '', cat: p.get('cat') || '' })), takeUntil(this.destroy$))
      .subscribe(({ q, cat }) => { this.q = q; this.cat = cat; this.searchNow(); });
  }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  private searchNow() {
    this.loading = true;
    const { items, total } = this.catalog.search(this.q, { cat: this.cat, limit: 200 });
    setTimeout(() => { this.results = items; this.total = total; this.loading = false; }, 100);
  }

  clear() { this.router.navigate(['/search'], { queryParams: {} }); }

  open(p: CatalogItem) {
    if (p.link) this.router.navigate(Array.isArray(p.link) ? p.link : [p.link]);
    else this.router.navigate(['/product', p.id]); // placeholder si aún no hay detalle
  }

  hasDiscount(p: CatalogItem) { return p.price != null && p.compareAt != null && p.compareAt > p.price; }
  pct(p: CatalogItem) {
    if (!this.hasDiscount(p)) return 0;
    return Math.round(((p.compareAt! - p.price!) / p.compareAt!) * 100);
  }
}
