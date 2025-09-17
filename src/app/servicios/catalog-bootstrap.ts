import { Injectable } from '@angular/core';
import { WixStoresService } from './wix-stores';
import { CatalogoBus } from './catalogo-bus';

/**
 * Carga inicial del catálogo desde Wix y lo publica en CatalogoBus.
 * Idempotente: solo corre una vez por sesión.
 */
@Injectable({ providedIn: 'root' })
export class CatalogBootstrapService {
  private inFlight?: Promise<void>;

  constructor(
    private wixStores: WixStoresService,
    private bus: CatalogoBus
  ) {}

  ensureLoaded(): Promise<void> {
    if (!this.inFlight) {
      this.inFlight = this.run();
    }
    return this.inFlight;
  }

  private async run(): Promise<void> {
    try {
      await this.wixStores.syncAll(300); // trae y bucketiza por categorías
    } catch (err) {
      console.error('[catalog bootstrap] error:', err);
    } finally {
      // Notifica a quien escuche (si tu bus expone esto); no rompe si no existe.
      (this.bus as any)?.emitChange?.();
    }
  }
}
