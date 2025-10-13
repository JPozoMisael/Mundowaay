import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService } from 'src/app/servicios/cart';
import { ProductsService, Product } from 'src/app/servicios/products';

type VM = Product & {
  gallery: string[];
  rating: number;
  reviews: number;
  sold?: string;
  promo?: string;
  badge?: string;
  brand?: string;
  discountPercent?: number;
};

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: false,
})
export class ProductoPage implements OnInit {
  vm?: VM;
  currentImage = '';
  loading = true;
  recommendedProducts: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private productsSvc: ProductsService,
    private cart: CartService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
        this.loadRecommendations();
      }
    });
  }

  /* ============================================================
     SCROLL HEADER (Temu/Shopee)
     ============================================================ */
  private lastScrollTop = 0;
  private isHidden = false;

  onScroll(event: any) {
    const scrollTop = event.detail?.scrollTop || 0;
    const header = document.querySelector('.mw-header') as HTMLElement;
    if (!header) return;

    const delta = scrollTop - this.lastScrollTop;
    const threshold = 10;

    if (Math.abs(delta) < threshold) return;

    if (delta > 0 && scrollTop > 120 && !this.isHidden) {
      header.classList.add('hide');
      this.isHidden = true;
    } else if (delta < 0 && this.isHidden) {
      header.classList.remove('hide');
      this.isHidden = false;
    }

    this.lastScrollTop = Math.max(scrollTop, 0);
  }

  /* ============================================================
     CARGAR PRODUCTO ACTUAL
     ============================================================ */
  loadProduct(id: string) {
    this.loading = true;
    console.log(`[ProductoPage] Cargando producto con ID: ${id}`);

    this.productsSvc.getById(id).subscribe({
      next: (p: Product | null) => {
        this.loading = false;
        if (!p) {
          console.warn('⚠️ Producto no encontrado, usando mock temporal.');
          this.vm = this.mockProduct(id);
          this.currentImage = this.vm.imageUrl!;
          return;
        }

        const gallery = Array.isArray(p.gallery) && p.gallery.length
          ? p.gallery
          : [p.imageUrl || 'assets/img/placeholder.png'];

        const discountPercent =
          p.compareAt && p.price && p.compareAt > p.price
            ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
            : 0;

        this.vm = {
          ...p,
          gallery,
          price: p.price ?? 0,
          compareAt: p.compareAt,
          rating: 4 + Math.random(),
          reviews: Math.floor(Math.random() * 500) + 100,
          sold: (p as any).sold ?? '',
          promo: (p as any).promo ?? '',
          badge: discountPercent > 0 ? `-${discountPercent}%` : '',
          brand: (p as any).brand ?? '',
          discountPercent,
        };

        this.currentImage =
          this.vm.imageUrl ||
          this.vm.gallery[0] ||
          'assets/img/placeholder.png';
      },
      error: (err: any) => {
        console.error('❌ Error al cargar producto:', err);
        this.loading = false;
        this.vm = this.mockProduct(id);
        this.currentImage = this.vm.imageUrl!;
      },
    });
  }

  /* ============================================================
     PRODUCTOS RECOMENDADOS
     ============================================================ */
  loadRecommendations() {
    this.productsSvc.listAll().subscribe({
      next: (res: Product[]) => {
        if (!res?.length) return;
        const shuffled = res
          .filter((p) => p.id !== this.vm?.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);

        this.recommendedProducts = shuffled.map((p) => ({
          ...p,
          rating: 4 + Math.random(),
          reviews: Math.floor(Math.random() * 500) + 100,
        }));
      },
      error: (err: any) => console.error('Error cargando recomendados:', err),
    });
  }

  /* ============================================================
     ACCIONES DE UI
     ============================================================ */
  setImage(img: string) {
    this.currentImage = img;
  }

  money(n: number) {
    return `$${(n || 0).toFixed(2)}`;
  }

  async addToCart() {
    if (!this.vm) return;

    this.cart
      .add(
        {
          id: this.vm.id,
          title: this.vm.title,
          price: this.vm.price ?? 0,
          image:
            this.currentImage ||
            this.vm.imageUrl ||
            'assets/img/placeholder.png',
        },
        1
      )
      .subscribe();

    const t = await this.toastCtrl.create({
      message: 'Producto añadido al carrito 🛒',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline',
    });
    await t.present();
  }

  goToProduct(id: string) {
    this.router.navigate(['/producto', id]);
    setTimeout(() => window.scrollTo(0, 0), 0);
  }

  /* ============================================================
     MOCK TEMPORAL
     ============================================================ */
  private mockProduct(id: string): VM {
    return {
      id,
      title: 'Producto de muestra',
      desc: 'Descripción temporal del producto.',
      imageUrl: 'assets/img/placeholder.png',
      gallery: ['assets/img/placeholder.png'],
      price: 20,
      compareAt: 25,
      rating: 4.2,
      reviews: 154,
      discountPercent: 20,
      badge: '-20%',
      sold: '2K+',
      promo: 'Oferta limitada',
      brand: 'WAY Demo',
      category: 'general',
      tags: [],
    };
  }
  // ====== Eventos del header (búsqueda y categoría global) ======
onGlobalSearch(term: string) {
  console.log('[Header] Buscar término:', term);
  // Puedes implementar lógica de búsqueda si deseas
}

onGlobalCat(cat: string) {
  console.log('[Header] Seleccionar categoría:', cat);
  // O navegar según categoría si lo requieres
}

}
