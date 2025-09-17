// src/app/servicios/wix-client.ts
import { Injectable } from '@angular/core';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class WixClientService {
  private _client: any;
  private _ready: Promise<void>;

  constructor() {
    this._client = createClient({
      modules: { products, collections },
      auth: OAuthStrategy({
        clientId: environment.wixClientId, // ← tu ID de cliente Headless (Web)
      }),
    }) as any;

    // Asegura tokens de visitante anónimo antes de consultar
    this._ready = this.ensureVisitorTokens();
  }

  get client() { return this._client; }

  private async ensureVisitorTokens() {
    try {
      const state = await this._client.auth?.getAuthState?.();
      if (!state?.isAuthenticated) {
        await this._client.auth?.generateVisitorTokens?.();
      }
    } catch (err) {
      // No abortamos: algunos entornos dev siguen funcionando igual.
      console.warn('[wix] No se pudieron generar visitor tokens (se continúa):', err);
    }
  }

  /** Trae hasta `max` productos visibles, paginando con paging.next() */
  async fetchAllProducts(max = 200): Promise<any[]> {
    await this._ready;
    const out: any[] = [];
    let q = this._client.products
      .queryProducts()
      .eq('visible', true)
      .limit(Math.min(100, max));

    let res = await q.find();
    out.push(...(res?.items ?? []));

    while (out.length < max && res?.paging?.next) {
      res = await res.paging.next();
      out.push(...(res?.items ?? []));
    }
    return out.slice(0, max);
  }

  /** Devuelve todas las colecciones (categorías) con id y nombre */
  async fetchAllCollections(max = 300): Promise<Array<{ id: string; name: string }>> {
    await this._ready;
    const out: Array<{ id: string; name: string }> = [];
    let q = this._client.collections.queryCollections().limit(Math.min(100, max));
    let res = await q.find();
    for (const c of res?.items ?? []) {
      out.push({ id: c?._id || c?.id, name: c?.name || c?.title || '' });
    }
    while (out.length < max && res?.paging?.next) {
      res = await res.paging.next();
      for (const c of res?.items ?? []) {
        out.push({ id: c?._id || c?.id, name: c?.name || c?.title || '' });
      }
    }
    return out;
  }
}
