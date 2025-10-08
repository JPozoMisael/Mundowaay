import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';  
import { LoginModalComponent } from './components/login-modal/login-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  constructor(
    private router: Router,
    private menu: MenuController,
    private modalCtrl: ModalController
  ) {}

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
    // Aquí luego podrás conectar tu servicio de autenticación real
    return null; 
  }

  /** 🔹 Navegación genérica */
  go(path: string) {
    this.router.navigateByUrl(path).finally(() => {
      try { this.menu.close(); } catch {}
    });
  }

  /** 🔹 Abrir WhatsApp (coloca tu número real con prefijo +593) */
  openWhatsApp() {
    window.open('https://wa.me/593000000000', '_blank', 'noopener,noreferrer');
  }

  /** 🔹 Abrir soporte técnico (ejemplo: mailto o página interna) */
  openSupport() {
    window.open('mailto:soporte@cultivencom.com', '_blank');
  }

  /** 🔹 Abrir ubicación sucursales con Google Maps */
  openMap() {
    window.open('https://maps.app.goo.gl/XXXXXXXXX', '_blank');
  }

  /** 🔹 Abrir política de privacidad (PDF o página interna) */
  openPrivacy() {
    this.go('/ayuda/politica-privacidad');
  }

  /** 🔹 Abrir términos y condiciones */
  openTerms() {
    this.go('/ayuda/terminos-condiciones');
  }

  /** 🔹 Búsqueda global */
  onGlobalSearch(event: any) {
    const query = (typeof event === 'string' ? event : event.detail?.value || '').trim();
    if (!query) return;
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  /** 🔹 Categorías globales */
  onGlobalCat(event: any) {
    const key = (typeof event === 'string' ? event : event.detail?.value || '').trim();
    if (!key) return;
    this.router.navigate(['/category', key]);
  }
}
