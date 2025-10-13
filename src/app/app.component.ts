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

  /** 🔹 Abrir modal de login */
  async openLogin() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
      cssClass: 'login-modal',
      backdropDismiss: true,
    });
    await modal.present();
  }

  /** 🔹 Obtener usuario autenticado (placeholder) */
  get user() {
    return null; // aquí conectarás tu servicio de autenticación real
  }

  /** 🔹 Navegación genérica */
  go(path: string) {
    this.router.navigateByUrl(path).finally(() => {
      try {
        this.menu.close();
      } catch {}
    });
  }

  /** 🔹 Enlace a WhatsApp (actualiza con tu número real) */
  openWhatsApp() {
    window.open('https://wa.me/593000000000', '_blank', 'noopener,noreferrer');
  }

  /** 🔹 Soporte técnico */
  openSupport() {
    window.open('mailto:soporte@cultivencom.com', '_blank');
  }

  /** 🔹 Ubicación (Google Maps) */
  openMap() {
    window.open('https://maps.app.goo.gl/XXXXXXXXX', '_blank');
  }

  /** 🔹 Política de privacidad */
  openPrivacy() {
    this.go('/ayuda/politica-privacidad');
  }

  /** 🔹 Términos y condiciones */
  openTerms() {
    this.go('/ayuda/terminos-condiciones');
  }
}
