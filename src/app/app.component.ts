import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';  // 👈 importa ModalController
import { CatalogBootstrapService } from './servicios/catalog-bootstrap';
import { LoginModalComponent } from './components/login-modal/login-modal.component'; // 👈 importa tu modal

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
    private modalCtrl: ModalController,   // 👈 inyéctalo aquí
    private boot: CatalogBootstrapService,
  ) {}

  ngOnInit(): void {
    void this.boot.ensureLoaded().catch(err => {
      console.warn('[CatalogBootstrap] ensureLoaded falló:', err);
    });
  }

  /** 🔹 Abre el modal de login (igual que en el header) */
  async openLogin() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
      cssClass: 'login-modal',
      backdropDismiss: true
    });
    await modal.present();
  }

  get user() {
    // Si tu auth ya está en el root
    return null; // o usa this.auth.currentUser si lo tienes aquí también
  }

  /** Otros métodos que ya tenías **/
  go(path: string) {
    this.router.navigateByUrl(path).finally(() => {
      try { this.menu.close(); } catch {}
    });
  }

  openWhatsApp() {
    window.open('https://wa.me/593000000000', '_blank', 'noopener,noreferrer');
  }

  onGlobalSearch(event: any) {
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
