import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CatalogBootstrapService } from './servicios/catalog-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private menu: MenuController,
    private boot: CatalogBootstrapService, // Wix → CatalogoBus (idempotente)
  ) {}

  ngOnInit(): void {
    void this.boot.ensureLoaded().catch(err => {
      console.warn('[CatalogBootstrap] ensureLoaded falló:', err);
    });
  }

  /** Navega y cierra el menú lateral si está abierto */
  go(path: string) {
    this.router.navigateByUrl(path).finally(() => {
      try { this.menu.close(); } catch {}
    });
  }

  openWhatsApp() {
    window.open('https://wa.me/593000000000', '_blank', 'noopener,noreferrer');
  }

  // ===== Eventos emitidos por <app-header> =====
  onGlobalSearch(event: any) {
    // Si el componente emite directamente un string:
    const query = (typeof event === 'string' ? event : event.detail?.value || '').trim();
    if (!query) return;
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  onGlobalCat(event: any) {
    const key = (typeof event === 'string' ? event : event.detail?.value || '').trim();
    if (!key) return;
    this.router.navigate(['/category', key]);
  }
}
