import { Injectable } from '@angular/core';

export type CatalogItem = {
  id: string;
  title: string;
  category: string;
  image?: string;
  price?: number;           // precio actual (con descuento si aplica)
  compareAt?: number;       // precio original (tachado)
  brand?: string;
  tags?: string[];
  desc?: string;
  rating?: number;
  reviews?: number;
  link?: string | any[];
  gallery?: string[];
  sold?: string;
  promo?: string;
  badge?: string;
  __search?: string;
};

type Incoming = Partial<CatalogItem> & {
  id: string;
  title: string;
  imageUrl?: string;
  image?: string;
  brand?: string;
  gallery?: string[];
  sold?: string;
  promo?: string;
  badge?: string;

  // Campos de Wix
  priceData?: {
    price?: number;              // precio base
    compareAtPrice?: number;     // precio tachado original (si existe)
    discountedPrice?: number;    // precio ya calculado con descuento
  };
  discount?: {
    type: 'PERCENT' | 'AMOUNT';
    value: number;
  };
  price?: number;                // fallback
};

@Injectable({ providedIn: 'root' })
export class CatalogoBus {
  private items: CatalogItem[] = [];

  constructor() {
    try {
      const raw = localStorage.getItem('mw_catalog_v1');
      if (raw) this.items = JSON.parse(raw);
    } catch {}
  }

  publish(category: string, list: Incoming[]) {
    const cat = this.norm(category);
    this.items = this.items.filter(p => this.norm(p.category) !== cat);

    console.log("[CatalogoBus] Incoming wix product FULL:", JSON.stringify(list, null, 2));

    const mapped = list.map(p =>
      this.index({
        id: p.id,
        title: p.title!,
        category,
        image: p.image ?? p.imageUrl,
        ...this.resolvePrice(p),   // 🔥 precios mapeados bien
        brand: p.brand,
        tags: p.tags ?? [],
        desc: p.desc ?? '',
        rating: p.rating,
        reviews: p.reviews,
        link: p.link,
        gallery: p.gallery ?? [],
        sold: p.sold,
        promo: p.promo,
        badge: p.badge,
      })
    );

    this.items.push(...mapped);
    this.persist();
  }

  append(category: string, list: Incoming[]) {
    const mapped = list.map(p =>
      this.index({
        id: p.id,
        title: p.title!,
        category,
        image: p.image ?? p.imageUrl,
        ...this.resolvePrice(p),   
        brand: p.brand,
        tags: p.tags ?? [],
        desc: p.desc ?? '',
        rating: p.rating,
        reviews: p.reviews,
        link: p.link,
        gallery: p.gallery ?? [],
        sold: p.sold,
        promo: p.promo,
        badge: p.badge,
      })
    );

    this.items.push(...mapped);
    this.persist();
  }

  search(q: string, opts?: { cat?: string; limit?: number }) {
    const limit = opts?.limit ?? 120;
    const cat = opts?.cat ? this.norm(opts.cat) : '';
    const haystack = cat
      ? this.items.filter(p => this.norm(p.category) === cat)
      : this.items;

    const tokens = this.tokens(this.expandSynonyms(q));
    if (!tokens.length) return { items: haystack.slice(0, limit), total: haystack.length };

    const scored = haystack.map(p => {
      const foundAll = tokens.every(t => p.__search!.includes(t));
      if (!foundAll) return null;

      let score = 0;
      const title = this.norm(p.title);
      for (const t of tokens) {
        if (title === t) score += 3;
        else if (title.startsWith(t)) score += 2;
        else if (title.includes(t)) score += 2;
        else score += 1;
      }
      if (p.compareAt != null && p.price != null && p.compareAt > p.price) score += 0.5;
      if ((p.reviews ?? 0) > 0) score += Math.min((p.reviews ?? 0) / 5000, 1);
      return { p, score };
    }).filter(Boolean) as { p: CatalogItem; score: number }[];

    scored.sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title));
    const items = scored.slice(0, limit).map(s => s.p);
    return { items, total: scored.length };
  }

  listAll() { return this.items.slice(); }

  findById(id: string): CatalogItem | undefined {
    return this.items.find(p => p.id === id);
  }

  private index(p: CatalogItem): CatalogItem {
    const blob = [
      p.title,
      p.category,
      p.brand || '',
      (p.tags || []).join(' '),
      p.desc || ''
    ].map(x => this.expandSynonyms(x || '')).join(' ');
    return { ...p, __search: this.tokens(blob).join(' ') };
  }

  private norm(s: string): string {
    return (s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  private tokens(s: string): string[] {
    const STOP = new Set(['de','la','el','y','para','por','en','del','los','las','un','una','con','al','a']);
    const base = this.norm(s).split(' ').filter(w => w && !STOP.has(w));
    const out = new Set<string>();
    for (const w of base) {
      out.add(w);
      if (w.length >= 4) out.add(w.slice(0, w.length - 1));
    }
    return Array.from(out);
  }

  private expandSynonyms(s: string): string {
    const map: [RegExp, string][] = [
      [/semillas?/gi, 'semilla'],
      [/maiz/gi, 'maíz'],
      [/hibrid[ao]s?/gi, 'híbrida'],
      [/foliar(es)?/gi, 'foliar'],
      [/insecticid(as?|o?s?)/gi, 'insecticida'],
      [/herbicid(as?|o?s?)/gi, 'herbicida'],
      [/fungicid(as?|o?s?)/gi, 'fungicida'],
      [/acaricid(as?|o?s?)/gi, 'acaricida'],
      [/bioestimulant(e?s?)/gi, 'bioestimulante'],
      [/bomba(s)?/gi, 'bomba'],
      [/mochila(s)?/gi, 'mochila'],
      [/trigo(s)?/gi, 'trigo'],
      [/soja/gi, 'soya'],
    ];
    let out = s || '';
    for (const [re, rep] of map) out = out.replace(re, rep);
    return out;
  }

  private persist() {
    try { localStorage.setItem('mw_catalog_v1', JSON.stringify(this.items)); } catch {}
  }

  private resolvePrice(p: any): { price: number; compareAt?: number } {
    let price = p?.priceData?.price ?? p?.price ?? 0;
    let compareAt: number | undefined;

    // Caso Wix con `discountedPrice`
    if (p?.priceData?.discountedPrice && p.priceData.discountedPrice < price) {
      compareAt = p.priceData.price ?? price;
      price = p.priceData.discountedPrice;
    }

    // Caso Wix con `compareAtPrice`
    if (p?.priceData?.compareAtPrice && p.priceData.compareAtPrice > price) {
      compareAt = p.priceData.compareAtPrice;
    }

    // Caso descuentos manuales (discount.value)
    if (p?.discount?.value) {
      compareAt = compareAt ?? price;
      if (p.discount.type === 'PERCENT') {
        price = price - (price * p.discount.value) / 100;
      } else if (p.discount.type === 'AMOUNT') {
        price = price - p.discount.value;
      }
    }

    return { price, compareAt };
  }
}
