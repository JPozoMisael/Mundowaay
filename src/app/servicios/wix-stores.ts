import { Injectable } from '@angular/core';
import { WixClientService } from './wix-client';
import { CatalogoBus, CatalogItem } from './catalogo-bus';

@Injectable({ providedIn: 'root' })
export class WixStoresService {
  constructor(private wix: WixClientService, private bus: CatalogoBus) {}

  /**
   * Descarga productos y colecciones (categorías) desde Wix,
   * mapea cada producto a 1..N categorías conocidas y publica por bucket.
   */
  async syncAll(max = 300): Promise<void> {
    const [prods, colls] = await Promise.all([
      this.wix.fetchAllProducts(max),       // hasta 300 (paginado de 100 en 100)
      this.wix.fetchAllCollections(500),    // cat. de Wix: id -> nombre
    ]);

    // Mapa id de colección -> nombre legible
    const idToName = new Map<string, string>();
    for (const c of colls) idToName.set(c.id, (c.name || '').trim());

    // Buckets por categoría normalizada
    const buckets = new Map<string, CatalogItem[]>();
    const push = (cat: string, item: CatalogItem) => {
      const k = cat.toLowerCase();
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(item);
    };

    // Opcional: bucket "todo"
    const ALL: CatalogItem[] = [];

    for (const p of prods) {
      if (p?.visible === false) continue;

      // Item base (category se sobrescribe al publicar en cada bucket)
      const base = this.toItem(p);

      // Para "wix-all"
      ALL.push({ ...base, category: 'wix-all' });

      // Nombres de colecciones a las que pertenece el producto
      const collectionNames: string[] = (p?.collectionIds ?? [])
        .map((id: string) => idToName.get(id) || '')
        .filter(Boolean);

      const blob = collectionNames.join(' ').toLowerCase();

      // Heurística de mapeo a tus páginas
      const matched: string[] = [];
      if (/\bsemill/.test(blob)) matched.push('semillas');
      if (/\binsecticid/.test(blob)) matched.push('insecticidas');
      if (/\bherbicid/.test(blob)) matched.push('herbicidas');
      if (/\bfungicid/.test(blob)) matched.push('fungicidas');
      if (/\bnutrici(?:o|ó)n\b|\bfoliar\b/.test(blob)) matched.push('nutricion');
      if (/\bmaquinaria\b|\baccesorios\b/.test(blob)) matched.push('maquinaria');
      if (/\bacaricid/.test(blob)) matched.push('acaricidas');

      // Si no matchea nada, usa el primer nombre de colección como categoría libre
      if (matched.length === 0 && collectionNames.length) {
        matched.push(this.norm(collectionNames[0])); // p.ej. "agroquimicos"
      }

      // Publica el producto en cada bucket detectado (o en "otros")
      for (const cat of matched.length ? matched : ['otros']) {
        push(cat, { ...base, category: cat });
      }
    }

    // Publicación en el índice global
    for (const [cat, arr] of buckets) {
      this.bus.publish(cat, arr);
    }
    this.bus.publish('wix-all', ALL);
  }

  // ----------------- helpers -----------------
  private toItem(p: any): CatalogItem {
    const image =
      p?.media?.mainMedia?.image?.url ||
      p?.media?.items?.[0]?.image?.url ||
      '';

    const price =
      p?.priceData?.price ??
      p?.price?.price ??
      p?.priceRange?.minValue?.price ??
      0;

    const compareAt =
      p?.priceData?.compareAtPrice ??
      p?.discount?.strikedPrice?.price ??
      undefined;

    const desc = String(p?.description || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tags = (p?.tags || []).map((t: string) => String(t).toLowerCase());

    return {
      id: p?._id || p?.id,
      title: p?.name || 'Producto',
      category: 'wix-all', // se reemplaza al publicar
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
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, '_');
  }
}
