import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router, private menu: MenuController) {}

  go(path: string) {
    this.router.navigateByUrl(path).then(() => this.menu.close());
  }

  openWhatsApp() {
    window.open('https://wa.me/593000000000', '_blank'); // cambia por tu número
  }

  // llamados por <app-header>
  onGlobalSearch(q: string) {
    if (!q) return;
    this.router.navigate(['/search'], { queryParams: { q } });
  }
  onGlobalCat(cat: string) {
    if (!cat) return;
    this.router.navigate(['/category', cat]);
  }
}
