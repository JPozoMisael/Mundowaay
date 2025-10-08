import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
  results: Product[] = [];
  total = 0; 
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsSvc: ProductsService
  ) {}

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.q = params.get('q') || '';
        this.cat = params.get('cat') || '';
        this.searchNow();
      });
  }

  ngOnDestroy() { 
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }

  private searchNow() {
    this.loading = true;
    this.productsSvc.search(this.q, this.cat)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ items, total }) => {
        this.results = items;
        this.total = total;
        this.loading = false;
      });
  }

  clear() { 
    this.router.navigate(['/search'], { queryParams: {} }); 
  }

  open(p: Product) {
    // Si tienes una página producto por id:
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
