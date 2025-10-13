import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
  Input,
  ElementRef,
  Renderer2,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { LocationService, LocationData } from 'src/app/servicios/location';
import { LocationModalComponent } from '../location-modal/location-modal.component';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService } from 'src/app/servicios/auth';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  takeUntil,
} from 'rxjs';

type Suggest = {
  recent: string[];
  cats: { key: string; label: string }[];
  hits: string[];
};

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  standalone: false,
})
export class AppHeaderComponent implements OnInit, OnDestroy, OnChanges {
  // ================================
  // 🔹 Inputs & Outputs
  // ================================
  @Input() cartCount = 0;
  @Input() scrollTop: number = 0; // << nuevo control de scroll individual
  @Output() search = new EventEmitter<string>();
  @Output() category = new EventEmitter<string>();

  // ================================
  // 🔹 Variables internas
  // ================================
  userLocation: LocationData | null = null;
  query = '';
  openSuggest = false;
  isHidden = false;

  private lastScrollTop = 0;
  private q$ = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  suggest$ = combineLatest([
    this.q$.pipe(debounceTime(160), distinctUntilChanged()),
  ]).pipe(map(([q]) => this.buildSuggest(q)));

  constructor(
    private router: Router,
    private menu: MenuController,
    private cart: CartService,
    private modalCtrl: ModalController,
    private locationSvc: LocationService,
    private auth: AuthService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  // ================================
  // 🔹 Ciclo de vida
  // ================================
  ngOnInit() {
    this.cart.count$.pipe(takeUntil(this.destroy$)).subscribe((n) => (this.cartCount = n));
    this.locationSvc.current$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loc) => (this.userLocation = loc));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scrollTop']) this.handleScroll();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================================
  // 🔹 Efecto de scroll (ocultar header)
  // ================================
  private handleScroll(): void {
    const headerEl = this.el.nativeElement.querySelector('.mw-header') as HTMLElement;
    if (!headerEl) return;

    const delta = this.scrollTop - this.lastScrollTop;
    if (Math.abs(delta) < 8) return;

    if (delta > 0 && this.scrollTop > 80) {
      this.isHidden = true;
      this.renderer.setStyle(headerEl, 'transform', 'translateY(-100%)');
    } else if (delta < 0) {
      this.isHidden = false;
      this.renderer.setStyle(headerEl, 'transform', 'translateY(0)');
    }

    this.lastScrollTop = this.scrollTop <= 0 ? 0 : this.scrollTop;
  }

  // ================================
  // 🔹 Buscador y sugerencias
  // ================================
  onInput(ev: any) {
    const value = ev?.target?.value ?? ev?.detail?.value ?? '';
    this.query = String(value).replace(/^\s+/, '');
    this.openSuggest = !!this.query || this.getRecent().length > 0;
    this.q$.next(this.query);
  }

  submit() {
    const q = (this.query || '').trim();
    if (!q) return;
    this.saveRecent(q);
    this.search.emit(q);
    this.openSuggest = false;
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  pick(text: string) {
    this.query = text;
    this.submit();
  }

  goCat(key: string) {
    this.openSuggest = false;
    this.category.emit(key);
    this.router.navigate(['/c', key]);
  }

  clear() {
    this.query = '';
    this.q$.next('');
    this.openSuggest = false;
  }

  onSearch(ev: any) {
    const q = ev?.detail?.value?.trim();
    if (q) {
      this.query = q;
      this.submit();
    }
  }

  catChange(ev: any) {
    this.category.emit(ev?.detail?.value);
  }

  // ================================
  // 🔹 Menú y carrito
  // ================================
  goCart() {
    this.router.navigateByUrl('/cart');
  }

  openMenu() {
    this.menu.enable(true, 'mainMenu');
    this.menu.open('mainMenu');
  }

  // ================================
  // 🔹 Sugerencias recientes y categorías
  // ================================
  private buildSuggest(q: string): Suggest {
    const recent = this.getRecent().slice(0, 6);
    const cats = [
      { key: 'semillas', label: 'Semillas' },
      { key: 'insecticidas', label: 'Insecticidas' },
      { key: 'herbicidas', label: 'Herbicidas' },
      { key: 'fungicidas', label: 'Fungicidas' },
      { key: 'acaricidas', label: 'Acaricidas' },
      { key: 'nutricion', label: 'Nutrición foliar' },
      { key: 'maquinaria', label: 'Maquinaria y accesorios' },
    ];

    const baseHits = [
      'semilla híbrida maíz',
      'semilla certificada trigo',
      'insecticida QSI',
      'herbicida AVGUST',
      'bioestimulante foliar',
      'bomba de mochila',
    ];

    const hits = !q
      ? baseHits.slice(0, 5)
      : baseHits.filter((x) => x.toLowerCase().includes(q.toLowerCase())).slice(0, 5);

    return { recent, cats, hits };
  }

  private getRecent(): string[] {
    try {
      return JSON.parse(localStorage.getItem('mw_recent') || '[]');
    } catch {
      return [];
    }
  }

  private saveRecent(q: string) {
    const arr = this.getRecent().filter((x) => x.toLowerCase() !== q.toLowerCase());
    arr.unshift(q);
    localStorage.setItem('mw_recent', JSON.stringify(arr.slice(0, 10)));
  }

  // ================================
  // 🔹 Modales: ubicación y login
  // ================================
  async openLocation() {
    const modal = await this.modalCtrl.create({
      component: LocationModalComponent,
    });
    await modal.present();
  }

  async openLogin() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
      cssClass: 'login-modal',
      backdropDismiss: true,
    });
    await modal.present();
  }

  get user() {
    return this.auth.currentUser;
  }

  hideSuggestDelayed() {
    setTimeout(() => (this.openSuggest = false), 180);
  }

  closeSuggest() {
    this.openSuggest = false;
  }
}
