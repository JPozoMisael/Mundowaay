// src/app/servicios/wix-stores.ts
import { Injectable } from '@angular/core';
import { WixClientService } from './wix-client';
import { CatalogoBus, CatalogItem } from './catalogo-bus';

@Injectable({ providedIn: 'root' })
export class WixStoresService {
  constructor(private wix: WixClientService, private bus: CatalogoBus) {}

  async syncAll(max = 300): Promise<void> {
    const [prods, colls] = await Promise.all([
      this.wix.fetchAllProducts(max),
      this.wix.fetchAllCollections(500),
    ]);

    const idToName = new Map<string, string>();
    for (const c of colls) idToName.set(c.id, (c.name || '').trim());

    const buckets = new Map<string, CatalogItem[]>();
    const push = (cat: string, item: CatalogItem) => {
      const k = cat.toLowerCase();
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(item);
    };

    const ALL: CatalogItem[] = [];

    for (const p of prods) {
      if (p?.visible === false) continue;

      // 🔍 Log completo del producto crudo
      console.log("Producto crudo desde Wix:", JSON.stringify(p, null, 2));

      const base = this.toItem(p);
      ALL.push({ ...base, category: 'wix-all' });

      const collectionNames: string[] = (p?.collectionIds ?? [])
        .map((id: string) => idToName.get(id) || '')
        .filter(Boolean);

      const blob = collectionNames.join(' ').toLowerCase();
      const matched: string[] = [];
      if (/\bsemill/.test(blob)) matched.push('semillas');
      if (/\binsecticid/.test(blob)) matched.push('insecticidas');
      if (/\bherbicid/.test(blob)) matched.push('herbicidas');
      if (/\bfungicid/.test(blob)) matched.push('fungicidas');
      if (/\bnutrici(?:o|ó)n\b|\bfoliar\b/.test(blob)) matched.push('nutricion');
      if (/\bmaquinaria\b|\baccesorios\b/.test(blob)) matched.push('maquinaria');
      if (/\bacaricid/.test(blob)) matched.push('acaricidas');

      if (matched.length === 0 && collectionNames.length) {
        matched.push(this.norm(collectionNames[0]));
      }

      for (const cat of matched.length ? matched : ['otros']) {
        push(cat, { ...base, category: cat });
      }
    }

    for (const [cat, arr] of buckets) {
      this.bus.publish(cat, arr);
    }
    this.bus.publish('wix-all', ALL);
  }

  // ----------------- helpers -----------------
  private toItem(p: any): CatalogItem {
  // Log completo para depurar
  console.log('Producto crudo desde Wix:', JSON.stringify(p, null, 2));

  const image =
    p?.media?.mainMedia?.image?.url ||
    p?.media?.items?.[0]?.image?.url ||
    '';

  // 🔹 Captura flexible de precios
  const price =
    p?.priceData?.price ??
    p?.price?.price ??
    p?.priceData?.discountedPrice ??
    p?.price?.discountedPrice ??
    p?.priceRange?.minValue ??
    0;

  const compareAt =
    p?.priceData?.compareAtPrice ??
    p?.price?.compareAtPrice ??
    undefined;

  const desc = String(p?.description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tags = (p?.tags || []).map((t: string) => String(t).toLowerCase());

  console.log('DEBUG product mapped:', {
    id: p?._id || p?.id,
    title: p?.name,
    price,
    compareAt,
  });

  return {
    id: p?._id || p?.id,
    title: p?.name || 'Producto',
    category: 'wix-all',
    image,
    price,
    compareAt,
    tags,
    desc,
    rating: p?.rating ?? 4,
    reviews: p?.reviews ?? 0,
  };
}

  private norm(s: string) {
    return (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, '_');
  }
}
