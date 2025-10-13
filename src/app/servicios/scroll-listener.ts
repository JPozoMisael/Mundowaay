import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ScrollListenerService {
  private currentContent?: IonContent;
  private lastScrollTop = 0;
  private header?: HTMLElement;

  constructor(private ngZone: NgZone, private router: Router) {
    // Detectar cambios de ruta y volver a conectar el scroll listener
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      setTimeout(() => this.connect(), 400);
    });
  }

  private connect() {
    this.header = document.querySelector('app-header') || undefined;
    const content = document.querySelector('ion-content');
    if (!content) return;

    this.currentContent = (content as any).componentOnReady
      ? (content as any)
      : undefined;

    // Activar scroll events si no lo están
    if (content && !(content as any).scrollEvents) {
      (content as any).scrollEvents = true;
    }

    // Eliminar listeners antiguos
    content.removeEventListener('ionScroll', this.handleScroll);
    content.addEventListener('ionScroll', this.handleScroll);
  }

  private handleScroll = (event: any) => {
    this.ngZone.run(() => {
      const scrollTop = event.detail?.scrollTop || 0;
      if (!this.header) return;

      if (scrollTop > this.lastScrollTop + 15) {
        this.header.classList.add('hide');
      } else if (scrollTop < this.lastScrollTop - 10) {
        this.header.classList.remove('hide');
      }
      this.lastScrollTop = scrollTop;
    });
  };
}
