import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  currentImage: string = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productsSvc: ProductsService,
    private cart: CartService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      console.warn('[ProductoPage] No se recibió ID en la ruta.');
      return;
    }

    console.log(`[ProductoPage] Cargando producto con ID: ${id}`);

    // Obtener producto desde backend
    this.productsSvc.getById(id).subscribe({
      next: (p: Product | null) => {
        this.loading = false;
        if (!p) {
          console.warn('Producto no encontrado. Mostrando placeholder.');
          this.vm = this.mockProduct(id);
          this.currentImage = this.vm.imageUrl!;
          return;
        }

        console.log('Producto cargado:', p);

        const gallery = Array.isArray(p.gallery) && p.gallery.length
          ? p.gallery
          : (p.imageUrl ? [p.imageUrl] : ['assets/img/placeholder.png']);

        const discountPercent =
          p.compareAt && p.price && p.compareAt > p.price
            ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100)
            : 0;

        this.vm = {
          ...p,
          gallery,
          price: p.price ?? 0,
          compareAt: p.compareAt,
          rating: 4 + Math.random(), // valor simulado (4–5)
          reviews: Math.floor(Math.random() * 300),
          sold: (p as any).sold ?? '',
          promo: (p as any).promo ?? '',
          badge: discountPercent > 0 ? `-${discountPercent}%` : '',
          brand: (p as any).brand ?? '',
          discountPercent,
        };

        this.currentImage = this.vm.imageUrl || this.vm.gallery[0] || 'assets/img/placeholder.png';
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.loading = false;
        this.vm = this.mockProduct(id);
        this.currentImage = this.vm.imageUrl!;
      },
    });
  }

  // Cambiar imagen de galería
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
          image: this.currentImage || this.vm.imageUrl || 'assets/img/placeholder.png',
        },
        1
      )
      .subscribe();

    const t = await this.toastCtrl.create({
      message: 'Producto añadido al carrito',
      duration: 1200,
      color: 'success',
      position: 'top',
      icon: 'cart-outline',
    });
    await t.present();
  }

  // Producto simulado si falla la API
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
}
