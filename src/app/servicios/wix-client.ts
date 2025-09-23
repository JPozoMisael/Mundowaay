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
        clientId: environment.wixClientId, // tu nuevo ClientId de Wix Dev Center
      }),
    }) as any;

    this._ready = this.ensureVisitorTokens();
  }

  get client() {
    return this._client;
  }

  private async ensureVisitorTokens() {
    try {
      const state = await this._client.auth?.getAuthState?.();
      if (!state?.isAuthenticated) {
        await this._client.auth?.generateVisitorTokens?.();
      }
    } catch (err) {
      console.warn('[wix] No se pudieron generar visitor tokens (se continúa):', err);
    }
  }

  /** 🔹 Método oficial con el SDK */
  async fetchAllProducts(max = 200): Promise<any[]> {
    await this._ready;
    const out: any[] = [];

    let q = this._client.products
      .queryProducts()
      .eq('visible', true)
      .limit(Math.min(100, max))
      .withFieldsets('FULL'); // 👈 importante: pide todos los campos disponibles

    let res = await q.find();

    console.log('[SDK] Primer lote crudo:', JSON.stringify(res.items[0], null, 2));
    out.push(...(res?.items ?? []));

    while (out.length < max && res?.paging?.next) {
      res = await res.paging.next();
      console.log('[SDK] Lote adicional:', JSON.stringify(res.items[0], null, 2));
      out.push(...(res?.items ?? []));
    }

    return out.slice(0, max);
  }

  /** 🔹 Método alterno con REST (por si el SDK sigue sin traer precios) */
  async fetchAllProductsREST(): Promise<any[]> {
    try {
      const url = `https://www.wixapis.com/stores/v1/products/query`;
      const token = environment.wixAccessToken; // 👈 añade tu token en environment.ts

      const body = {
        query: {
          filter: { visible: true },
          paging: { limit: 50 }
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('[REST] Productos crudos:', JSON.stringify(data?.products?.[0], null, 2));
      return data?.products ?? [];
    } catch (err) {
      console.error('[REST] Error obteniendo productos:', err);
      return [];
    }
  }

  /** 🔹 Colecciones (categorías) */
  async fetchAllCollections(
    max = 300
  ): Promise<Array<{ id: string; name: string }>> {
    await this._ready;
    const out: Array<{ id: string; name: string }> = [];

    let q = this._client.collections.queryCollections().limit(Math.min(100, max));
    let res = await q.find();

    console.log('[SDK] Colecciones recibidas:', JSON.stringify(res.items, null, 2));

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
