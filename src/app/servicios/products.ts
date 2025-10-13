import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, finalize, tap } from 'rxjs/operators';
import { GeneralService } from './general';

export type Product = {
  id: string;
  title: string;
  price?: number;
  compareAt?: number;
  discountPercent?: number;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  desc?: string;
  gallery?: string[];
  collectionSlugs?: string[];
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private loading = false;

  constructor(private general: GeneralService) {}

  // =============================
  // 📦 Obtener todos los productos
  // =============================
  listAll(): Observable<Product[]> {
    this.loading = true;
    console.log('[ProductsService] Solicitando productos desde API...');

    return this.general.get<any>('products').pipe(
      tap(res => console.log('[ProductsService] Respuesta cruda del backend:', res)),
      map(res => this.adaptResponse(res)),
      finalize(() => {
        this.loading = false;
        console.log('[ProductsService] Carga completada (listAll).');
      }),
      catchError(err => {
        console.error('❌ [ProductsService] Error cargando productos:', err);
        this.loading = false;
        return of([]);
      })
    );
  }

  // Alias universales
  getAll(): Observable<Product[]> {
    return this.listAll();
  }

  query(): Observable<Product[]> {
    return this.listAll();
  }

  // =============================
  // 🗂️ Obtener productos por colección
  // =============================
  getByCollection(slug: string): Observable<Product[]> {
    this.loading = true;
    console.log(`[ProductsService] Cargando productos de la colección "${slug}"...`);

    return this.general.get<any>(`products/collection/${slug}`).pipe(
      tap(res => console.log(`[ProductsService] Respuesta de la colección "${slug}":`, res)),
      map(res => this.adaptResponse(res)),
      finalize(() => (this.loading = false)),
      catchError(err => {
        console.error(`❌ [ProductsService] Error al cargar colección "${slug}":`, err);
        this.loading = false;
        return of([]);
      })
    );
  }

  // =============================
  // 🔍 Obtener producto por ID
  // =============================
  getById(id: string): Observable<Product | null> {
    this.loading = true;
    console.log(`[ProductsService] Buscando producto por ID: ${id}`);

    return this.general.get<any>(`products/${id}`).pipe(
      tap(res => console.log(`[ProductsService] Respuesta del producto ${id}:`, res)),
      map(res => {
        const items = this.adaptResponse(res);
        if (items.length > 0) return items[0];
        if (res?.data && typeof res.data === 'object') return this.mapProduct(res.data);
        return null;
      }),
      finalize(() => (this.loading = false)),
      catchError(err => {
        console.error('❌ [ProductsService] Error obteniendo producto por ID:', err);
        this.loading = false;
        return of(null);
      })
    );
  }

  // =============================
  // 🔎 Buscar productos
  // =============================
  search(q: string, category?: string): Observable<{ items: Product[]; total: number }> {
    const params: any = { q };
    if (category) params.category = category;

    this.loading = true;
    console.log(`[ProductsService] Buscando productos: "${q}"`);

    return this.general.get<any>('products/search', params).pipe(
      map(res => {
        const items = this.adaptResponse(res);
        return { items, total: items.length };
      }),
      finalize(() => (this.loading = false)),
      catchError(err => {
        console.error('❌ [ProductsService] Error en búsqueda:', err);
        this.loading = false;
        return of({ items: [], total: 0 });
      })
    );
  }

  // =============================
  // 🧩 Adaptar estructura general
  // =============================
  private adaptResponse(res: any): Product[] {
    if (!res) return [];
    const items = Array.isArray(res)
      ? res
      : res.data || res.products || res.items || [];
    return Array.isArray(items) ? items.map(p => this.mapProduct(p)) : [];
  }

  // =============================
  // 🧩 Mapeo robusto de producto
  // =============================
  private mapProduct(p: any): Product {
    if (!p) {
      return {
        id: '',
        title: 'Producto sin datos',
        price: 0,
        compareAt: 0,
        discountPercent: 0,
        imageUrl: 'assets/img/placeholder.png',
        category: 'general',
        tags: [],
        desc: '',
        gallery: [],
        collectionSlugs: [],
      };
    }

    // 🏷️ Campos base
    const id = p._id || p.id || '';
    const title = p.name || p.title || 'Producto sin nombre';
    const desc = p.descriptionPlain || p.description || '';

    // 💵 Precios
    const price = p.price ?? 0;
    const compareAt = p.compareAt ?? 0;
    const discountPercent =
      compareAt > price && compareAt > 0
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : p.discountPercent ?? 0;

    // 🖼️ Imagen principal
    let imageUrl =
      p.imageUrl ||
      p.mainMedia?.image?.url ||
      p.media?.mainMedia?.image?.url ||
      (Array.isArray(p.media?.items) && p.media.items[0]?.mediaItem?.image?.url) ||
      'assets/img/placeholder.png';

    // 🖼️ Galería
    const gallery = Array.isArray(p.media?.items)
      ? p.media.items
          .map((i: any) => i.mediaItem?.image?.url || i.image?.url)
          .filter((u: string) => !!u)
      : p.gallery || [];

    // 📂 Categoría, tags, colecciones
    const category =
      p.category ||
      p.additionalInfoSections?.find((s: any) => s.title === 'Categoría')
        ?.description ||
      'general';

    const tags =
      p.tags ||
      (Array.isArray(p.productOptions)
        ? p.productOptions.map((o: any) => o.name)
        : []) ||
      [];

    const collectionSlugs = Array.isArray(p.collectionSlugs)
      ? p.collectionSlugs
      : Array.isArray(p.collections)
      ? p.collections.map((c: any) => c.slug)
      : [];

    // 🔚 Resultado final
    return {
      id,
      title,
      price,
      compareAt,
      discountPercent,
      imageUrl,
      category,
      tags,
      desc,
      gallery,
      collectionSlugs,
    };
  }

  isLoading(): boolean {
    return this.loading;
  }
}
