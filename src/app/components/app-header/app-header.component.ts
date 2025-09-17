import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ModalController } from '@ionic/angular';
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
export class AppHeaderComponent implements OnInit, OnDestroy {
  @Input() cartCount = 0;
  @Output() search = new EventEmitter<string>();
  @Output() category = new EventEmitter<string>();
  userLocation: LocationData | null = null;

  // ==== estado del buscador ====
  query = '';
  openSuggest = false;

  private q$ = new BehaviorSubject<string>('');
  suggest$ = combineLatest([
    this.q$.pipe(debounceTime(160), distinctUntilChanged()),
  ]).pipe(map(([q]) => this.buildSuggest(q)));

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private menu: MenuController,
    private cart: CartService,
    private modalCtrl: ModalController,
    private locationSvc: LocationService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cart.count$.pipe(takeUntil(this.destroy$)).subscribe(n => (this.cartCount = n));
    this.locationSvc.current$.pipe(takeUntil(this.destroy$)).subscribe(loc => this.userLocation = loc);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====== BUSCADOR ======

  /** Manejador de (ionInput) del searchbar */
  onInput(ev: any) {
    const value = ev?.target?.value ?? ev?.detail?.value ?? '';
    // Compatibilidad: reemplaza trimStart() para targets < ES2019
    this.query = String(value).replace(/^\s+/, '');
    this.openSuggest = !!this.query || this.getRecent().length > 0;
    this.q$.next(this.query);
  }

  /** Enter o botón de buscar */
  submit() {
    const q = (this.query || '').trim();
    if (!q) return;
    this.saveRecent(q);
    // Emitir por si el padre escucha
    this.search.emit(q);
    this.openSuggest = false;
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  /** Click en una sugerencia de texto */
  pick(text: string) {
    this.query = text;
    this.submit();
  }

  /** Ir directo a categoría desde el panel */
  goCat(key: string) {
    this.openSuggest = false;
    this.category.emit(key);
    this.router.navigate(['/c', key]);
  }

  /** Limpiar */
  clear() {
    this.query = '';
    this.q$.next('');
    this.openSuggest = false;
  }

  // === compat anterior (si algo usa (ionSearch)) ===
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

  // ====== MENÚ / CARRITO ======
  goCart() {
    this.router.navigateByUrl('/cart');
  }
  openMenu() {
    this.menu.enable(true, 'mainMenu');
    this.menu.open('mainMenu');
  }

  // ====== SUGERENCIAS ======
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
      : baseHits
          .filter(x => x.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 5);

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
    const arr = this.getRecent().filter(x => x.toLowerCase() !== q.toLowerCase());
    arr.unshift(q);
    localStorage.setItem('mw_recent', JSON.stringify(arr.slice(0, 10)));
  }

  async openLocation(){
    const modal = await this.modalCtrl.create({
      component: LocationModalComponent
    });
    await modal.present();
  }

  async openLogin(){
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent
    });
    await modal.present();
  }

  get user(){
    return this.auth.currentUser;
  }
}
